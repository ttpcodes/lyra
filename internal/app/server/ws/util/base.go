package util

type BaseCommand interface {
	Handle(client Client)
}