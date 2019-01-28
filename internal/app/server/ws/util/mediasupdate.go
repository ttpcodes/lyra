package util

import (
	"encoding/json"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/db"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/sirupsen/logrus"
)

type MediasUpdateResponse struct {
	Command string

	Medias []models.Media
}

func CreateMediasUpdateResponse(user *models.User) ([]byte, error) {
	media, err := db.GetPlaylist(*user)
	if err != nil {
		return nil, err
	}
	command := MediasUpdateResponse{
		Command: "playlist",
		Medias: media,
	}
	response, err := json.Marshal(command)
	if err != nil {
		logrus.Error("Error generating JSON response:\n", err)
		return make([]byte, 0), err
	}
	return response, nil
}