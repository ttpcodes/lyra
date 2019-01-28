package db

import (
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/constants"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"github.com/volatiletech/authboss"
)

var db *gorm.DB

func CreateDatabase() *gorm.DB {
	host := viper.GetString(constants.DB_HOST)
	connString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host,
		"5432", "unnamed", "unnamed", "unnamed")
	newDb, err := gorm.Open("postgres", connString)
	db = newDb
	if err != nil {
		logrus.Fatal("Error on connecting to database:\n", err)
	}
	logrus.Infof("Connected to database at %s.", host)
	db.Model(&models.Media{})
	db.Model(&models.User{}).Related(&models.Media{}, "Medias")
	db.AutoMigrate(&models.Media{})
	db.AutoMigrate(&models.User{})
	logrus.Debugf("Ran User model migration.")
	return db
}

func GetDatabase() *gorm.DB {
	return db
}

func AddMedia(media models.Media) {
	database := GetDatabase()
	database.Create(&media)
}

func GetMedia(id string) (models.Media, error) {
	database := GetDatabase()
	var media []models.Media
	database.Where(models.Media{ID: id}).First(&media)
	if len(media) > 0 {
		return media[0], nil
	}
	return models.Media{}, errors.New("media not found in database")
}

func AppendMediaUser(media models.Media, user models.User) {
	GetDatabase().Model(&user).Association("Medias").Append(&media)
}

func RemoveMediaUser(media models.Media, user models.User) {
	GetDatabase().Model(&user).Association("Medias").Delete(&media)
}

func GetPlaylist(user models.User) ([]models.Media, error) {
	var result []models.User
	GetDatabase().Where(models.User{Email: user.Email}).Preload("Medias").First(&result)
	if len(result) > 0 {
		return result[0].Medias, nil
	}
	return nil, authboss.ErrUserNotFound
}