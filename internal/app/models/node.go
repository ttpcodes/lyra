package models

import "time"

type Node struct {
	ticker *time.Ticker

	ID uint

	CurrentTime uint
	Playlist []Media
}

func NewNode(id uint) *Node {
	return &Node{
		CurrentTime: 0,
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
	n.Playlist = n.Playlist[1:]
	n.CurrentTime = 0
}