package util

type AddCommand struct {
	BaseCommand `json:"-"`

	Command string
	URL string
}

func (c AddCommand) Handle(client Client) {

}