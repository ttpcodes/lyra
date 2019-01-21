package util

import (
	"encoding/json"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/stores"
	"github.com/sirupsen/logrus"
)

type MoveCommand struct {
	BaseCommand `json:"-"`

	Command string
	Node uint
}

func (c MoveCommand) Handle(client Client) {
	store := stores.GetNodeStore()
	node, err := store.Get(c.Node)
	if err != nil {
		logrus.Warn("Error retrieving the proper node:\n", err)
		return
	}
	client.User.Node = *node
	data, err := json.Marshal(c)
	if err != nil {
		logrus.Error("Error generating WebSocket response:\n", err)
		return
	}
	client.Hub.Broadcast <- data
}