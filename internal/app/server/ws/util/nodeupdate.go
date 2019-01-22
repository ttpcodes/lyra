package util

import (
	"encoding/json"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/sirupsen/logrus"
)

type NodeUpdateResponse struct {
	Command string

	Node *models.Node
}

func CreateNodeUpdateResponse(node *models.Node) ([]byte, error) {
	command := NodeUpdateResponse{
		Command: "nodeUpdate",
		Node: node,
	}
	response, err := json.Marshal(command)
	if err != nil {
		logrus.Error("Error generating JSON response:\n", err)
		return make([]byte, 0), err
	}
	return response, nil
}