package router

import (
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func Routes() *mux.Router {
	router := mux.NewRouter()

	// Create Middleware Stack
	stack := middlewares.CreateStack(
		middlewares.RealIP,
		middlewares.RequestID,
		middlewares.RateLimit,
		middlewares.HPP(map[string]bool{
			"sortby": true, // Allow multi-sort
			"tags":   true,
		}),
		middlewares.SecurityHeaders,
		middlewares.FetchMetadata, // Modern CSRF check
		middlewares.Cors,
		middlewares.MiddlewaresExcludePaths(middlewares.Logger, "/docs", "/favicon.ico"),
		middlewares.Compression,
	)

	// Apply Middlewares
	router.Use(mux.MiddlewareFunc(stack))

	// Root
	router.HandleFunc("/", handlers.RootHandler).Methods("GET")

	// Register Subrouters
	RegisterDeviceRoutes(router)
	RegisterInterfaceRoutes(router)
	RegisterLocationRoutes(router)
	RegisterVLANRoutes(router)
	RegisterUserRoutes(router)

	return router
}
