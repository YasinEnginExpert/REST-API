package middlewares

import (
	"net"
	"net/http"
	"strings"
)

// Middleware defines the function signature for a middleware
type Middleware func(http.Handler) http.Handler

// CreateStack chains multiple middlewares together
// The first middleware in the list is the "outermost" (runs first)
func CreateStack(xs ...Middleware) Middleware {
	return func(next http.Handler) http.Handler {
		for i := len(xs) - 1; i >= 0; i-- {
			x := xs[i]
			next = x(next)
		}
		return next
	}
}

// MiddlewaresExcludePaths applies a middleware only if the path does NOT start with one of the excludePaths
func MiddlewaresExcludePaths(middleware func(http.Handler) http.Handler, excludePaths ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			for _, path := range excludePaths {
				if strings.HasPrefix(r.URL.Path, path) {
					next.ServeHTTP(w, r)
					return
				}
			}
			middleware(next).ServeHTTP(w, r)
		})
	}
}

// clientIP resolves the client's IP address, stripping the port if present.
// It is used by RateLimit and Logger middlewares.
func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
