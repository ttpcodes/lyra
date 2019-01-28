package util

import (
	"encoding/json"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/sirupsen/logrus"
)

type MovePosCommand struct {
	BaseCommand `json:"-"`

	Command string
	User *models.User
	X float32
	Y float32
}

func (c MovePosCommand) Handle(client Client) {
	client.User.X = c.X
	client.User.Y = c.Y
	c.User = client.User
	data, err := json.Marshal(c)
	if err != nil {
		logrus.Error("Error generating WebSocket response:\n", err)
		return
	}
	client.Hub.Broadcast <- data
}