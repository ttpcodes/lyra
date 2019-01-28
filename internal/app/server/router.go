package server

import (
	"context"
	"github.com/gorilla/mux"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/auth"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/routes"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/routes/node"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/routes/player"
	ws "github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/server/ws/routes"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/web"
	"github.com/sirupsen/logrus"
	"github.com/volatiletech/authboss"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func CreateRouter() {
	wait := time.Duration(15)


	ab := auth.GetAuth()
	r := mux.NewRouter()
	r.Use(ab.LoadClientStateMiddleware)

	fs := http.FileServer(web.HTTP)

	r.PathPrefix("/auth").Handler(http.StripPrefix("/auth", ab.Config.Core.Router))

	a := authboss.Middleware2(ab, authboss.RequireNone, authboss.RespondUnauthorized)

	n := r.PathPrefix("/nodes").Subrouter()
	n.Use(a)
	n.PathPrefix("/{id}").HandlerFunc(node.ShowHandler)

	p := r.PathPrefix("/players").Subrouter()
	p.Use(a)
	p.PathPrefix("/{player}").HandlerFunc(player.ShowHandler)
	p.PathPrefix("").HandlerFunc(player.IndexHandler)

	w := r.PathPrefix("/ws").Subrouter()
	w.Use(a)
	w.PathPrefix("/game").HandlerFunc(ws.WebsocketGameHandler)

	s := r.PathPrefix("/game.html").Subrouter()
	s.Use(a)
	game, err := web.ReadFile("game.html")
	if err != nil {
		logrus.Fatal("Error when loading game file:\n", err)
	}
	s.HandleFunc("", func (w http.ResponseWriter, r *http.Request) {
		if _, err := w.Write(game); err != nil {
			logrus.Error("Error when serving game route:\n", err)
		}
	})
	r.Path("/").HandlerFunc(routes.IndexHandler)

	r.PathPrefix("/").Handler(fs)

	srv := &http.Server{
		Addr:         "0.0.0.0:80",
		Handler:      r,
		IdleTimeout:  time.Second * 60,
		ReadTimeout:  time.Second * 15,
		WriteTimeout: time.Second * 15,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil {
			logrus.Error("Error on starting HTTP server:")
			logrus.Error(err)
		}
	}()
	logrus.Info("HTTP server now listening on port 80.")

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Kill)

	<-c

	ctx, cancel := context.WithTimeout(context.Background(), wait)
	defer cancel()
	srv.Shutdown(ctx)
	logrus.Info("HTTP server gracefully shut down.")
}
