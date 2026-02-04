package middlewares

import (
	"fmt"
	"net/http"
	pkgutils "restapi/pkg/utils"
)

// Allowed origins list
var allowOrigins = []string{
	"https://my-origin-url.com",
	"https://localhost:3000",
	"http://localhost:3000", // Local Dev
	"http://localhost:8080", // Vue / Generic
	"http://localhost:5173", // Vite / React
	"http://localhost:4200", // Angular
}

func Cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		fmt.Println("Request Origin:", origin)

		// Check if the origin is allowed
		if origin != "" {
			if isOriginAllowed(origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin") // Important for caching
			} else {
				pkgutils.JSONError(w, "Not allowed by CORS", http.StatusForbidden)
				return
			}
		} else {
			// No origin (e.g. server-to-server or curl), usually verified by other means or blocked.
			// Ideally, for a public API, "Access-Control-Allow-Origin: *" is used.
			// For this specific logic, we are strict.
			// Uncomment below if you want to allow non-browser requests freely:
			// w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle Preflight (OPTIONS) requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Logic fix: Check ALL origins before returning false
func isOriginAllowed(origin string) bool {
	for _, allowedOrigin := range allowOrigins {
		if origin == allowedOrigin {
			return true
		}
	}
	return false
}
