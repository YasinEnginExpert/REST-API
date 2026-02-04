package middlewares

import (
	"context"
	"net/http"
	"restapi/pkg/utils"
	"strings"
)

type contextKey string

const UserKey contextKey = "user"

// AuthMiddleware validates JWT tokens from Authorization header or Cookie
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := extractToken(r)

		if tokenString == "" {
			utils.JSONError(w, "Unauthorized: No token provided", http.StatusUnauthorized)
			return
		}

		claims, err := utils.VerifyToken(tokenString)
		if err != nil {
			utils.JSONError(w, "Unauthorized: Invalid token", http.StatusUnauthorized)
			return
		}

		// Set user in context
		ctx := context.WithValue(r.Context(), UserKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// extractToken tries to get the token from Header "Authorization: Bearer <token>"
// or falls back to "Bearer" cookie
func extractToken(r *http.Request) string {
	// 1. Get token from header
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			return parts[1]
		}
	}

	// 2. Fallback to cookie
	cookie, err := r.Cookie("Bearer")
	if err == nil {
		return cookie.Value
	}

	return ""
}

// GetUserFromContext retrieves the UserClaims from a request context
// Returns nil if not found or invalid
func GetUserFromContext(ctx context.Context) *utils.UserClaims {
	claims, ok := ctx.Value(UserKey).(*utils.UserClaims)
	if !ok {
		return nil
	}
	return claims
}
