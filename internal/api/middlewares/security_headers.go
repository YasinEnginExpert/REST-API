package middlewares

import "net/http"

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// X-XSS-Protection: 1; mode=block
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// X-Frame-Options: deny
		w.Header().Set("X-Frame-Options", "deny")

		// X-Content-Type-Options: nosniff
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// Content-Security-Policy: default-src 'self'
		w.Header().Set("Content-Security-Policy", "default-src 'self'")

		// Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

		next.ServeHTTP(w, r)
	})
}
