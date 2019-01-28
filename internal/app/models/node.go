package models

import (
	"github.com/sirupsen/logrus"
	"time"
)

type Node struct {
	ticker *time.Ticker

	Done chan struct{} `json:"-"`

	ID uint

	CurrentTime uint
	Playlist []Media
}

func NewNode(id uint) *Node {
	return &Node{
		CurrentTime: 0,
		Done: make(chan struct{}),
		ID: id,
		Playlist: make([]Media, 0),
		ticker: time.NewTicker(1 * time.Second),
	}
}

func (n *Node) AddMedia(media Media) {
	n.Playlist = append(n.Playlist, media)
}

func (n *Node) Run() {
	for {
		select {
		case <- n.ticker.C:
			if len(n.Playlist) > 0 {
				n.CurrentTime += 1
				if uint64(n.CurrentTime) > n.Playlist[0].Length {
					n.Next()
				}
			}
		}
	}
}

func (n *Node) Next() {
	if len(n.Playlist) > 0 {
		n.Playlist = n.Playlist[1:]
		n.CurrentTime = 0
	}
	if len(n.Playlist) == 0 {
		logrus.Infof("done %d", n.ID)
		n.Done <- struct{}{}
	}
}