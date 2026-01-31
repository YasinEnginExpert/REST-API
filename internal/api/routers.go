package api

import (
	"restapi/internal/api/handlers"
	"restapi/internal/api/middlewares"

	"github.com/gorilla/mux"
)

func Routes() *mux.Router {
	router := mux.NewRouter()

	// Create Middleware Stack (Order is Critical)
	// 1. Recovery: Catches panics from everything below it.
	// 2. RateLimit: Fail fast to save resources.
	// 3. HPP: Clean parameters before processing.
	// 4. SecurityHeaders & Cors: Security checks.
	// 5. ResponseTime & Logger: Monitoring and Logging.
	// 6. Compression: Compresses the response writing.
	stack := middlewares.CreateStack(
		middlewares.Recovery,
		middlewares.RateLimit,
		middlewares.HPP,
		middlewares.SecurityHeaders,
		middlewares.Cors,
		middlewares.ResponseTimeMiddleware,
		middlewares.Logger, // Logger might be inside ResponseTime or independent, placing here for flow
		middlewares.Compression,
	)

	// Apply the stack to the router
	// Note: Gorilla Mux's router.Use applies middlewares in the order they are added.
	// However, since we built a stack helper, we can apply the whole thing at once
	// or usage router.Use with our pre-composed Chain if we adapt the signature.
	// But clearer here might be to use Standard router.Use for the stack if it matches,
	// OR just standard mux usage.
	//
	// WAIT: Mux `Use` accepts `func(http.Handler) http.Handler`.
	// Our `CreateStack` returns exactly that.

	router.Use(mux.MiddlewareFunc(stack))

	// Root
	router.HandleFunc("/", handlers.RootHandler).Methods("GET")

	// Devices
	router.HandleFunc("/devices", handlers.Devices).Methods("GET", "POST")

	// Interfaces
	router.HandleFunc("/interfaces", handlers.Interfaces).Methods("GET", "POST", "PUT", "PATCH", "DELETE")

	return router
}
