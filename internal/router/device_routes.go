package router

import (
	"net/http"
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterDeviceRoutes(router *mux.Router) {
	devices := router.PathPrefix("/devices").Subrouter()

	// Authentication required for all device metadata/actions
	devices.Use(middlewares.AuthMiddleware)

	// Admin only for mutations
	adminOnly := middlewares.RequireRole("admin")

	devices.HandleFunc("", handlers.GetDevices).Methods("GET")
	devices.Handle("", adminOnly(http.HandlerFunc(handlers.CreateDevice))).Methods("POST")
	devices.Handle("", adminOnly(http.HandlerFunc(handlers.BulkPatchDevices))).Methods("PATCH")
	devices.Handle("", adminOnly(http.HandlerFunc(handlers.BulkDeleteDevices))).Methods("DELETE")

	devices.HandleFunc("/{id}", handlers.GetDevice).Methods("GET")
	devices.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.UpdateDevice))).Methods("PUT")
	devices.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.PatchDevice))).Methods("PATCH")
	devices.Handle("/{id}", adminOnly(http.HandlerFunc(handlers.DeleteDevice))).Methods("DELETE")

	devices.HandleFunc("/{id}/interfaces", handlers.GetInterfacesByDevice).Methods("GET")
	devices.HandleFunc("/{id}/interfacecount", handlers.GetInterfaceCount).Methods("GET")
}
