package middlewares

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
)

type CtxKeyRequestID struct{}

// RequestID adds a unique ID to every request
func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Check for existing ID (e.g. from load balancer)
		id := r.Header.Get("X-Request-ID")
		if id == "" {
			// 2. Generate new ID
			id = generateID()
		}

		// 3. Set header in response
		w.Header().Set("X-Request-ID", id)

		// 4. Add to context
		ctx := context.WithValue(r.Context(), CtxKeyRequestID{}, id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func generateID() string {
	b := make([]byte, 12) // 24 chars hex
	rand.Read(b)
	return hex.EncodeToString(b)
}

func GetRequestID(ctx context.Context) string {
	if id, ok := ctx.Value(CtxKeyRequestID{}).(string); ok {
		return id
	}
	return "unknown"
}
