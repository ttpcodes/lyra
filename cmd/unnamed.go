package main

import (
	"github.com/sirupsen/logrus"
	"gitlab.com/ttpcodes/jma22-kvfrans-ttpcodes/internal/app/db"
	"gitlab.com/ttpcodes/jma22-kvfrans-ttpcodes/internal/app/server"
)

func main() {
	db.GetDatabase()
	logrus.Debug("Initialized database.")
	server.CreateRouter()
}