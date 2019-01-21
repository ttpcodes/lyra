package player

import (
	"encoding/json"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/stores"
	"github.com/sirupsen/logrus"
	"net/http"
)

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	users := stores.GetUserStore()
	response, err := json.Marshal(users.All())
	if err != nil {
		logrus.Error("Error generating JSON response:\n", err)
	}
	_, err = w.Write(response)
	if err != nil {
		logrus.Error("Error when writing response:\n", err)
	}
}