package models

import (
	"github.com/jinzhu/gorm"
	"github.com/volatiletech/authboss"
)

type User struct {
	authboss.User `json:"-"`
	gorm.Model `json:"-"`

	Email string `gorm:"not null;unique" json:"-"`
	Password string `gorm:"not null" json:"-"`
	Username string `gorm:"not null;unique"`

	Medias []Media `gorm:"many2many:medias_users;"`

	Node *Node `gorm:"-"`
	X float32 `gorm:"-"`
	Y float32 `gorm:"-"`
}

func (u User) GetArbitrary() map[string]string {
	arbitrary := make(map[string]string)
	arbitrary["username"] = u.Username
	return arbitrary
}

func (u User) GetPID() string {
	return u.Password
}

func (u User) GetPassword() string {
	return u.Password
}

func (u *User) PutArbitrary(arbitrary map[string]string) {
	if username, ok := arbitrary["username"]; ok {
		u.Username = username
	}
}

func (u *User) PutPID(pid string) {
	u.Email = pid
}

func (u *User) PutPassword(password string) {
	u.Password = password
}

func (u User) TableName() string {
	return "users"
}