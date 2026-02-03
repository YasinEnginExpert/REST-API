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
		middlewares.Recovery,
		middlewares.RateLimit,
		middlewares.HPP,
		middlewares.SecurityHeaders,
		middlewares.Cors,
		middlewares.ResponseTimeMiddleware,
		middlewares.Logger,
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
