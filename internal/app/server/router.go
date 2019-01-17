package server

import (
	"context"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"gitlab.com/ttpcodes/jma22-kvfrans-ttpcodes/internal/app/server/auth"
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

	r.PathPrefix("/auth").Handler(http.StripPrefix("/auth", ab.Config.Core.Router))

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
