package util

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/db"
	"github.com/sirupsen/logrus"
)

type RemoveCommand struct {
	BaseCommand `json:"-"`

	Command string
	ID string
}

func (c RemoveCommand) Handle(client Client) {
	if c.ID == "" {
		logrus.Warn("ID not provided in RemoveCommand, ignoring.")
		return
	}
	media, err := db.GetMedia(c.ID)
	if err != nil {
		logrus.Warn("Error retrieving media by ID (is it correct):\n", err)
		return
	}
	db.RemoveMediaUser(media, *client.User)
}