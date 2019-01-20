all: deps build

build: frontend
	go build cmd/unnamed.go

deps:
	dep ensure

frontend:
	cd web && npm run build
	fileb0x web.json

.PHONY: all build deps frontend