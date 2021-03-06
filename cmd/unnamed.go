package main

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/constants"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/db"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/auth"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/sources/youtube"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/stores"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func main() {
	viper.SetEnvPrefix("UNNAMED")
	viper.AutomaticEnv()

	viper.SetDefault(constants.DB_HOST, "localhost")

	err := viper.BindEnv(constants.DB_HOST)
	if err != nil {
		logrus.Fatal("Error binding to environment variables:\n", err)
	}
	err = viper.BindEnv(constants.YOUTUBE_KEY)
	if err != nil {
		logrus.Fatal("Error binding to environment variables:\n", err)
	}

	key := viper.GetString(constants.YOUTUBE_KEY)
	if key == "" {
		logrus.Fatal("YouTube API key was not provided to the application.")
	}
	youtube.CreateYouTubeLoader(key)

	database := db.CreateDatabase()
	storer := auth.CreateStorer(database)
	auth.CreateAuth(storer)
	stores.CreateNodeStore()
	stores.CreateUserStore()
	logrus.Debug("Initialized database.")
	server.CreateRouter()
}