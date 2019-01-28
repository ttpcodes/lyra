package util

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/stores"
	"github.com/sirupsen/logrus"
)

type Hub struct {
	Broadcast chan []byte
	clients map[*Client]bool
	Register chan *Client
	Unregister chan *Client
}

func CreateHub() *Hub {
	return &Hub{
		Broadcast: make(chan []byte),
		clients: make(map[*Client]bool),
		Register: make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Execute() {
	logrus.Debug("Starting WS Hub executor.")
	for {
		select {
		case client := <-h.Register:
			logrus.Debug("Received Register message on WS Hub.")
			h.clients[client] = true
		case client := <-h.Unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			response, err := NewLeaveResponse(client.User)
			if err != nil {
				logrus.Error("Error generating leave response:\n", err)
			}
			if err := stores.GetUserStore().Remove(client.User.ID); err != nil {
				logrus.Error("Error removing user from store:\n", err)
			}
			go func() {
				h.Broadcast <- response
			}()
		case message := <-h.Broadcast:
			logrus.Debug("Received Broadcast message on WS Hub.")
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
		}
	}
}
