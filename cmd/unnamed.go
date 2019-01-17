package main

import (
	"github.com/sirupsen/logrus"
	"gitlab.com/ttpcodes/jma22-kvfrans-ttpcodes/internal/app/db"
	"gitlab.com/ttpcodes/jma22-kvfrans-ttpcodes/internal/app/server"
	"gitlab.com/ttpcodes/jma22-kvfrans-ttpcodes/internal/app/server/auth"
)

func main() {
	database := db.GetDatabase()
	storer := auth.CreateStorer(database)
	auth.CreateAuth(storer)
	logrus.Debug("Initialized database.")
	server.CreateRouter()
}