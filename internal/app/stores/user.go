package stores

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
)

var userInstance *UserStore

type UserStore struct {
	items map[uint]*models.User
}

func CreateUserStore() {
	userInstance = &UserStore{
		items: make(map[uint]*models.User),
	}
}

func GetUserStore() *UserStore {
	return userInstance
}

func (s *UserStore) Add(u *models.User) {
	s.items[u.ID] = u
}

func (s UserStore) All() []models.User {
	slice := make([]models.User, 0)
	for _, item := range s.items {
		slice = append(slice, *item)
	}
	return slice
}