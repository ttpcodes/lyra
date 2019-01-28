package routes

import (
	"github.com/gorilla/websocket"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/auth"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/ws/util"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/stores"
	"github.com/sirupsen/logrus"
	"net/http"
	"sync"
)

var gameHub *util.Hub
var gameOnce sync.Once

var gameUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
}

func GetGameHub() *util.Hub {
	gameOnce.Do(func () {
		gameHub = util.CreateHub()
		go gameHub.Execute()

		for _, node := range stores.GetNodeStore().All() {
			event := *node
			go func () {
				for {
					select {
					case _ = <- event.Done:
						response, err := util.CreateNodeDoneResponse(&event)
						if err != nil {
							continue
						}
						gameHub.Broadcast <- response
					}
				}
			}()
		}
	})
	return gameHub
}

func WebsocketGameHandler(w http.ResponseWriter, r *http.Request) {
	GetGameHub()
	conn, err := gameUpgrader.Upgrade(w, r, nil)
	if err != nil {
		logrus.Error("Error when upgrading client to WS connection:")
		logrus.Error(err)
		return
	}

	ab := auth.GetAuth()

	user, err := ab.CurrentUser(r)
	if err != nil {
		logrus.Warn("Error retrieving current user (are they authenticated?:\n", err)
		return
	}
	node, err := stores.GetNodeStore().Get(0)
	if err != nil {
		logrus.Error("Error on getting initial node:\n", err)
		return
	}
	user.(*models.User).Node = node
	user.(*models.User).X = 10.5
	user.(*models.User).Y = 13.5

	client := &util.Client{
		Conn: conn,
		Hub: gameHub,
		Send: make(chan []byte, 256),
		User: user.(*models.User),
	}
	client.Hub.Register <- client

	go client.RunRead()
	go client.RunWrite()

	store := stores.GetUserStore()
	store.Add(user.(*models.User))
	logrus.Debug("Sent initial message on WS connection.")
}
