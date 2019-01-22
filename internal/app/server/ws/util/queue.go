package util

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/db"
	"github.com/sirupsen/logrus"
)

type QueueCommand struct {
	BaseCommand `json:"-"`

	Command string
	ID string
}

func (c QueueCommand) Handle(client Client) {
	if c.ID == "" {
		logrus.Warn("ID not provided in QueueCommand, ignoring.")
		return
	}
	media, err := db.GetMedia(c.ID)
	if err != nil {
		logrus.Warn("Error retrieving media by ID (is it correct):\n", err)
		return
	}
	client.User.Node.AddMedia(media)
	logrus.Infof("Added media ID %s to node %d", c.ID, client.User.Node.ID)
}