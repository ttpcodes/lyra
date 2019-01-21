package util

import (
	"github.com/gorilla/websocket"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/sirupsen/logrus"
	"time"
)

const (
	pingInterval = pongWait * 9 / 10

	pongWait = 60 * time.Second

	writeWait = 10 * time.Second
)

type Client struct {
	Conn *websocket.Conn
	Hub *Hub
	Send chan []byte
	User *models.User
}

func (c *Client) RunRead() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetPongHandler(func(string) error { c.Conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logrus.Error("Unexpected WebSocket closure:\n", err)
			}
			break
		}
		if command := ParseCommand(message); command != nil {
			command.Handle(*c)
			continue
		}
		logrus.Warn("Error parsing WebSocket command, ignoring.")
	}
}

func (c *Client) RunWrite() {
	ticker := time.NewTicker(pingInterval)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()
	for {
		select{
		case message, ok := <-c.Send:
			logrus.Debug("Received Send message on WS Client.")
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
