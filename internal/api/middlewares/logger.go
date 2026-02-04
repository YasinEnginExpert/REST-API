package middlewares

import (
	"log"
	"net/http"
	"time"
)

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Get Request ID
		reqID := GetRequestID(r.Context())

		next.ServeHTTP(w, r)

		log.Printf("[REQ] [%s] %s %s | Duration: %v", reqID, r.Method, r.RequestURI, time.Since(start))
	})
}
