package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"restapi/internal/api"

	"golang.org/x/net/http2"
)

func main() {

	// Initialize routes
	router := api.Routes()

	port := 3000

	// Load the TLS cert and key
	// NOTE: Paths are relative to where the binary is executed from.
	// We assume it's run from the project root.
	cert := "certs/cert.pem"
	key := "certs/key.pem"

	// Configure TLS
	tlsConfig := &tls.Config{
		MinVersion: tls.VersionTLS12,
		// ClientAuth: tls.RequireAndVerifyClientCert, // Enforce mTLS (Disabled for simpler dev testing)
		ClientAuth: tls.NoClientCert, // Allow simple HTTPS
	}

	// Create a customer Server
	server := &http.Server{
		Addr:      fmt.Sprintf(":%d", port),
		Handler:   router,
		TLSConfig: tlsConfig,
	}

	// Enable http2
	http2.ConfigureServer(server, &http2.Server{})

	fmt.Println("Server is running on port:", port)

	err := server.ListenAndServeTLS(cert, key)
	if err != nil {
		log.Fatalln("Could not start server", err)
	}
}
