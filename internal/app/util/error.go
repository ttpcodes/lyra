package util

import (
	"encoding/json"
	"github.com/sirupsen/logrus"
)

type ErrorResponse struct {
	Error string
}

func CreateErrorResponse(message string) []byte {
	 response, err := json.Marshal(ErrorResponse{
		Error: message,
	 })
	 if err != nil {
	 	logrus.Fatal("Error when generating error response:\n", err)
	 }
	 return response
}
