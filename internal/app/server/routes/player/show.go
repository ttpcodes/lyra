package player

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/models"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/auth"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/stores"
	"github.com/sirupsen/logrus"
	"net/http"
)

func ShowHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if vars["player"] == "me" {
		ab := auth.GetAuth()
		user, err := ab.CurrentUser(r)
		if err != nil {
			logrus.Error("Error retrieving current user:\n", err)
			return
		}
		users := stores.GetUserStore()
		self, err := users.Get(user.(*models.User).ID)
		if err != nil {
			logrus.Error("Error retrieving user instance:\n", err)
			return
		}
		response, err := json.Marshal(self)
		if err != nil {
			logrus.Error("Error generating JSON response:\n", err)
			return
		}
		_, err = w.Write(response)
		if err != nil {
			logrus.Error("Error when writing response:\n", err)
			return
		}
	}
}
