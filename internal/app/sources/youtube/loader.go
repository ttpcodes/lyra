package youtube

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/senseyeio/duration"
	"github.com/sirupsen/logrus"
	"google.golang.org/api/googleapi/transport"
	"google.golang.org/api/youtube/v3"
	"net/http"
)

var service *youtube.Service

func CreateYouTubeLoader(key string) {
	client := &http.Client{
		Transport: &transport.APIKey{
			Key: key,
		},
	}

	var err error
	service, err = youtube.New(client)
	if err != nil {
		logrus.Fatal("Error on initializing YouTube service:\n", err)
	}
}

func GetVideoInfo(id string) (models.Media, error) {
	response, err := service.Videos.List("contentDetails,snippet").Id(id).MaxResults(1).Do()
	if err != nil {
		logrus.Warn("Error retrieving video info (is this a valid video ID?):\n", err)
		return models.Media{}, err
	}
	if len(response.Items) != 1 {
		logrus.Warn("Improper number of videos returned.")
		return models.Media{}, err
	}
	item := response.Items[0]
	length, err := duration.ParseISO8601(response.Items[0].ContentDetails.Duration)
	if err != nil {
		logrus.Error("Error parsing time of video:\n", err)
		return models.Media{}, err
	}
	return models.Media{
		ID: id,
		Length: uint64(60 * length.TM + length.TS),
		Title: item.Snippet.Title,
		Type: "youtube",
	}, nil
}