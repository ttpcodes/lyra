FROM golang:1.11.4-alpine3.8 as build

RUN apk add --no-cache dep
RUN apk add --no-cache git
RUN apk add --no-cache make
RUN apk add --no-cache npm
RUN go get -u github.com/UnnoTed/fileb0x

COPY . /go/src/github.com/mit6148/jma22-kvfrans-ttpcodes

WORKDIR /go/src/github.com/mit6148/jma22-kvfrans-ttpcodes
RUN make

FROM alpine:3.8

COPY --from=build /go/src/github.com/mit6148/jma22-kvfrans-ttpcodes/unnamed /usr/local/bin/unnamed

CMD ["/usr/local/bin/unnamed"]
