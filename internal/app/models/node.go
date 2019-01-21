package models

type Node struct {
	ID uint

	CurrentTime uint
	Playlist []Media
}

func NewNode(id uint) *Node {
	return &Node{
		CurrentTime: 0,
		ID: id,
		Playlist: make([]Media, 0),
	}
}