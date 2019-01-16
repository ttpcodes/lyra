all: deps build

build:
	go build cmd/unnamed.go

deps:
	dep ensure

.PHONY: all build deps