package util

type SkipCommand struct {
	BaseCommand `json:"-"`

	Command string
}

func (c SkipCommand) Handle(client Client) {
	client.User.Node.Next()
}