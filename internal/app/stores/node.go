package stores

import (
	"errors"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
)

var nodeInstance *NodeStore

type NodeStore struct {
	items map[uint]*models.Node
}

func CreateNodeStore() {
	nodeInstance = &NodeStore{
		items: make(map[uint]*models.Node),
	}
	for i := range [18]int{} {
		node := models.NewNode(uint(i))
		go node.Run()
		nodeInstance.Add(node)
	}
}

func GetNodeStore() *NodeStore {
	return nodeInstance
}

func (s *NodeStore) Add(n *models.Node) {
	s.items[n.ID] = n
}

func (s *NodeStore) Get(id uint) (*models.Node, error) {
	if val, ok := s.items[id]; ok {
		return val, nil
	}
	return models.NewNode(0), errors.New("index out of range")
}