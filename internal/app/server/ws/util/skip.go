package util

import "github.com/sirupsen/logrus"

type SkipCommand struct {
	BaseCommand `json:"-"`

	Command string
}

func (c SkipCommand) Handle(client Client) {
	client.User.Node.Next()
	response, err := CreateNodeUpdateResponse(client.User.Node)
	if err != nil {
		logrus.Error("Error generating WS response:\n", err)
		return
	}
	client.Hub.Broadcast <- response
}