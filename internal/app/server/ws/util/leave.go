package util

import (
	"encoding/json"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/sirupsen/logrus"
)

type LeaveResponse struct {
	Command string

	User *models.User
}

func NewLeaveResponse(user *models.User) ([]byte, error) {
	command := LeaveResponse{
		Command: "leave",
		User: user,
	}
	response, err := json.Marshal(command)
	if err != nil {
		logrus.Error("Error generating JSON response:\n", err)
		return make([]byte, 0), err
	}
	return response, nil
}
