package util

import (
	"encoding/json"
	"github.com/sirupsen/logrus"
)

func ParseCommand(body []byte) BaseCommand {
	unparsed := UnparsedCommand{}
	if err := json.Unmarshal(body, &unparsed); err != nil {
		logrus.Warn("Error parsing command name:\n", err)
		return nil
	}
	switch unparsed.Command {
	case "add":
		command := AddCommand{}
		if err := json.Unmarshal(body, &command); err != nil {
			logrus.Warn("Error parsing command body:\n", err)
			return nil
		}
		return command
	case "move":
		command := MoveCommand{}
		if err := json.Unmarshal(body, &command); err != nil {
			logrus.Warn("Error parsing command body:\n", err)
			return nil
		}
		return command
	case "movePos":
		command := MovePosCommand{}
		if err := json.Unmarshal(body, &command); err != nil {
			logrus.Warn("Error parsing command body:\n", err)
			return nil
		}
		return command
	case "queue":
		command := QueueCommand{}
		if err := json.Unmarshal(body, &command); err != nil {
			logrus.Warn("Error parsing command body:\n", err)
			return nil
		}
		return command
	case "remove":
		command := RemoveCommand{}
		if err := json.Unmarshal(body, &command); err != nil {
			logrus.Warn("Error parsing command body:\n", err)
			return nil
		}
		return command
	case "skip":
		command := SkipCommand{}
		if err := json.Unmarshal(body, &command); err != nil {
			logrus.Warn("Error parsing command body:\n", err)
			return nil
		}
		return command
	}
	return nil
}