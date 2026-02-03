package router

import (
	"restapi/internal/api/handlers"

	"github.com/gorilla/mux"
)

func RegisterDeviceRoutes(router *mux.Router) {
	devices := router.PathPrefix("/devices").Subrouter()
	devices.HandleFunc("", handlers.GetDevices).Methods("GET")
	devices.HandleFunc("", handlers.CreateDevice).Methods("POST")
	devices.HandleFunc("", handlers.BulkPatchDevices).Methods("PATCH")
	devices.HandleFunc("", handlers.BulkDeleteDevices).Methods("DELETE")
	devices.HandleFunc("/{id}", handlers.GetDevice).Methods("GET")
	devices.HandleFunc("/{id}", handlers.UpdateDevice).Methods("PUT")
	devices.HandleFunc("/{id}", handlers.PatchDevice).Methods("PATCH")
	devices.HandleFunc("/{id}", handlers.DeleteDevice).Methods("DELETE")
	devices.HandleFunc("/{id}/interfaces", handlers.GetInterfacesByDevice).Methods("GET")
	devices.HandleFunc("/{id}/interfacecount", handlers.GetInterfaceCount).Methods("GET")
}
