package db

import (
	"fmt"
	"github.com/jinzhu/gorm"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/sirupsen/logrus"
	"sync"

	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var db *gorm.DB
var once sync.Once

func GetDatabase() *gorm.DB {
	once.Do(func() {
		host := "localhost"
		connString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host,
			"5432", "unnamed", "unnamed", "unnamed")
		newDb, err := gorm.Open("postgres", connString)
		db = newDb
		if err != nil {
			logrus.Fatal("Error on connecting to database:\n", err)
		}
		logrus.Infof("Connected to database at %s.", host)
		db.Model(&models.Media{})
		db.Model(&models.User{}).Related(&models.Media{}, "Media")
		db.AutoMigrate(&models.Media{})
		db.AutoMigrate(&models.User{})
		logrus.Debugf("Ran User model migration.")
	})
	return db
}