package util

type RemoveCommand struct {
	BaseCommand `json:"-"`

	Command string
}

func (c RemoveCommand) Handle(client Client) {

}