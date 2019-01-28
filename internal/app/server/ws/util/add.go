package util

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/db"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/sources/youtube"
	"github.com/sirupsen/logrus"
	"regexp"
)

type AddCommand struct {
	BaseCommand `json:"-"`

	Command string
	URL string
}

func (c AddCommand) Handle(client Client) {
	defer func() {
		response, err := CreateMediasUpdateResponse(client.User)
		if err != nil {
			logrus.Error("Error generating WS response:\n", err)
			return
		}
		client.Send <- response
	}()
	regex := regexp.MustCompile(`(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)`)
	res := regex.FindAllStringSubmatch(c.URL, -1)
	if len(res) > 0 && len(res[0]) > 0 {
		media, err := db.GetMedia(res[0][5])
		if err == nil {
			db.AppendMediaUser(media, *client.User)
			return
		}
		media, err = youtube.GetVideoInfo(res[0][5])
		if err != nil {
			logrus.Warn("Error attempting to retrieve video info:\n", err)
			return
		}
		db.AddMedia(media)
		db.AppendMediaUser(media, *client.User)
		return
	}
	logrus.Warnf("Improperly formatted URL, ignoring.")
}