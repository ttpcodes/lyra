package util

type UnparsedCommand struct {
	BaseCommand

	Command string
}

func (c UnparsedCommand) Handle(client Client) {

}