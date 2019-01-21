package util

type QueueCommand struct {
	BaseCommand `json:"-"`

	Command string
	URL string
}

func (c QueueCommand) Handle(client Client) {

}