package middlewares

import (
	"net/http"
)

// HPP Middleware (HTTP Parameter Pollution)
func HPP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Clean Query Parameters
		params := r.URL.Query()
		cleanedParams := r.URL.Query()

		for key, values := range params {
			if len(values) > 1 {
				// If multiple values exist, keep only the first one
				cleanedParams.Set(key, values[0])
			}
		}

		// Re-encode cleaned parameters
		r.URL.RawQuery = cleanedParams.Encode()

		next.ServeHTTP(w, r)
	})
}
