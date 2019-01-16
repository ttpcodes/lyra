package db

import (
	"github.com/jinzhu/gorm"
)

type User struct {
	gorm.Model

	Email string `gorm:"not null"`
	Password string `gorm:"not null"`
	Username string `gorm:"not null"`
}