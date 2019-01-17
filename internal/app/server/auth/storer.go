package auth

import (
	"context"
	"github.com/jinzhu/gorm"
	"github.com/volatiletech/authboss"
	"gitlab.com/ttpcodes/jma22-kvfrans-ttpcodes/internal/app/db"
)

var storer UserStorer

func CreateStorer(db *gorm.DB) UserStorer {
	storer = UserStorer{
		db: db,
	}
	return storer
}

type UserStorer struct {
	db *gorm.DB
}

func (u UserStorer) Create(ctx context.Context, user authboss.User) error {
	var existing []db.User
	if err := u.db.Where(user).First(&existing).Error; err != nil {
		return err
	}
	if len(existing) > 1 {
		return authboss.ErrUserFound
	}
	if err := u.db.Create(user.(*db.User)).Error; err != nil {
		return err
	}
	return nil
}

func (u UserStorer) Load(ctx context.Context, key string) (authboss.User, error) {
	query := db.User{
		Email: key,
	}
	var user []db.User
	u.db.Where(query).First(&user)
	if len(user) > 0 {
		return &user[0], nil
	}
	return nil, authboss.ErrUserNotFound
}

func (u UserStorer) New(ctx context.Context) authboss.User {
	return &db.User{}
}

func (u UserStorer) Save(ctx context.Context, user authboss.User) error {
	var existing []db.User
	if err := u.db.Where(user).First(&existing).Error; err != nil {
		return err
	}
	if len(existing) < 1 {
		return authboss.ErrUserNotFound
	}
	if err := u.db.Save(user.(*db.User)).Error; err != nil {
		return err
	}
	return nil
}