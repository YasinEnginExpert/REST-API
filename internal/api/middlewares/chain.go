package middlewares

import "net/http"

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
