package routes

import (
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/auth"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/web"
	"github.com/sirupsen/logrus"
	"net/http"
	"sync"
)

var index []byte
var indexOnce sync.Once

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	indexOnce.Do(func() {
		var err error
		index, err = web.ReadFile("index.html")
		if err != nil {
			logrus.Fatal("Error when reading index file:\n", err)
		}
	})
	ab := auth.GetAuth()
	_, err := ab.CurrentUser(r)
	if err != nil {
		if _, err := w.Write(index); err != nil {
			logrus.Error("Error when serving index route:\n", err)
		}
	}
	http.Redirect(w, r, "/game.html", http.StatusTemporaryRedirect)
}
