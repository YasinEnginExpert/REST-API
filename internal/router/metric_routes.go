package router

import (
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func RegisterMetricRoutes(router *mux.Router) {
	metricRouter := router.PathPrefix("/metrics").Subrouter()
	metricRouter.Use(middlewares.AuthMiddleware)

	// Read operations
	metricRouter.HandleFunc("", handlers.GetMetrics).Methods("GET")
	metricRouter.HandleFunc("/device/{id}", handlers.GetLatestDeviceMetrics).Methods("GET")
}
