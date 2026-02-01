package router

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
	router.HandleFunc("/devices", handlers.GetDevices).Methods("GET")
	router.HandleFunc("/devices", handlers.CreateDevice).Methods("POST")
	router.HandleFunc("/devices", handlers.BulkPatchDevices).Methods("PATCH")

	router.HandleFunc("/devices/{id}", handlers.GetDevice).Methods("GET")
	router.HandleFunc("/devices/{id}", handlers.UpdateDevice).Methods("PUT")
	router.HandleFunc("/devices/{id}", handlers.PatchDevice).Methods("PATCH")
	router.HandleFunc("/devices/{id}", handlers.DeleteDevice).Methods("DELETE")

	// Interfaces
	router.HandleFunc("/interfaces", handlers.GetInterfaces).Methods("GET")
	router.HandleFunc("/interfaces", handlers.CreateInterface).Methods("POST")
	router.HandleFunc("/interfaces", handlers.BulkPatchInterfaces).Methods("PATCH")
	router.HandleFunc("/interfaces/{id}", handlers.GetInterface).Methods("GET")
	router.HandleFunc("/interfaces/{id}", handlers.UpdateInterface).Methods("PUT")
	router.HandleFunc("/interfaces/{id}", handlers.PatchInterface).Methods("PATCH")
	router.HandleFunc("/interfaces/{id}", handlers.DeleteInterface).Methods("DELETE")

	// Locations
	router.HandleFunc("/locations", handlers.GetLocations).Methods("GET")
	router.HandleFunc("/locations", handlers.CreateLocation).Methods("POST")
	router.HandleFunc("/locations", handlers.BulkPatchLocations).Methods("PATCH")
	router.HandleFunc("/locations/{id}", handlers.GetLocation).Methods("GET")
	router.HandleFunc("/locations/{id}", handlers.UpdateLocation).Methods("PUT")
	router.HandleFunc("/locations/{id}", handlers.PatchLocation).Methods("PATCH")
	router.HandleFunc("/locations/{id}", handlers.DeleteLocation).Methods("DELETE")

	// VLANs
	router.HandleFunc("/vlans", handlers.GetVLANs).Methods("GET")
	router.HandleFunc("/vlans", handlers.CreateVLAN).Methods("POST")
	router.HandleFunc("/vlans", handlers.BulkPatchVLANs).Methods("PATCH")
	router.HandleFunc("/vlans/{id}", handlers.UpdateVLAN).Methods("PUT")
	router.HandleFunc("/vlans/{id}", handlers.PatchVLAN).Methods("PATCH")
	router.HandleFunc("/vlans/{id}", handlers.DeleteVLAN).Methods("DELETE")

	return router
}
