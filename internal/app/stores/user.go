package stores

import (
	"errors"
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

func (s UserStore) Get(id uint) (*models.User, error) {
	if val, ok := s.items[id]; ok {
		return val, nil
	}
	return &models.User{}, errors.New("index out of range")
}

func (s UserStore) Remove(id uint) error {
	if _, ok := s.items[id]; ok {
		delete(s.items, id)
		return nil
	}
	return errors.New("index out of range")
}