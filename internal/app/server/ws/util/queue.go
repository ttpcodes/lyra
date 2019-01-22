package util

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/db"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/sources/youtube"
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
		logrus.Warn("Media does not exist in database, creating.")
		media, err = youtube.GetVideoInfo(c.ID)
		if err != nil {
			logrus.Warn("Error retrieving video info (is this a valid video):\n", err)
			return
		}
		db.AddMedia(media)
	}
	client.User.Node.AddMedia(media)
	logrus.Infof("Added media ID %s to node %d", c.ID, client.User.Node.ID)
}