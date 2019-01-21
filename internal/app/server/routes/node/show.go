package node

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/stores"
	"github.com/mit6148/jma22-kvfrans-ttpcodes/internal/app/util"
	"github.com/sirupsen/logrus"
	"net/http"
	"strconv"
)

func ShowHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 8)
	if err != nil {
		logrus.Warn("Invalid node ID format, ignoring.")
		response := util.CreateErrorResponse("Invalid node ID format.")
		w.WriteHeader(400)
		_, err := w.Write(response)
		if err != nil {
			logrus.Error("Error when writing response:\n", err)
		}
		return
	}
	store := stores.GetNodeStore()
	node, err := store.Get(uint(id))
	if err != nil {
		logrus.Warn("Invalid node ID, ignoring.")
		response := util.CreateErrorResponse("Invalid node ID.")
		w.WriteHeader(400)
		_, err := w.Write(response)
		if err != nil {
			logrus.Error("Error when writing response:\n", err)
		}
		return
	}
	response, err := json.Marshal(node)
	if err != nil {
		logrus.Error("Error when generating JSON response:\n", err)
		return
	}
	_, err = w.Write(response)
	if err != nil {
		logrus.Error("Error when writing response:\n", err)
	}
}