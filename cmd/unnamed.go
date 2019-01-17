package main

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/db"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/auth"
	"github.com/sirupsen/logrus"
)

func main() {
	database := db.GetDatabase()
	storer := auth.CreateStorer(database)
	auth.CreateAuth(storer)
	logrus.Debug("Initialized database.")
	server.CreateRouter()
}