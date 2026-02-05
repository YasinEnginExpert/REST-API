package middlewares

import (
	"context"
	"net/http"
	"restapi/pkg/utils"
	"strings"

	"github.com/gorilla/mux"
)

type contextKey string

const UserKey contextKey = "user"

// AuthMiddleware validates JWT tokens from Authorization header or Cookie
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := extractToken(r)

		if tokenString == "" {
			utils.JSONError(w, "Unauthorized: No security token provided", http.StatusUnauthorized)
			return
		}

		claims, err := utils.VerifyToken(tokenString)
		if err != nil {
			utils.JSONError(w, "Unauthorized: Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Set user in context
		ctx := context.WithValue(r.Context(), UserKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireRole ensures the authenticated user has one of the required roles
func RequireRole(roles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims := GetUserFromContext(r.Context())
			if claims == nil {
				utils.JSONError(w, "Unauthorized: Authentication required", http.StatusUnauthorized)
				return
			}

			authorized := false
			for _, role := range roles {
				if strings.EqualFold(claims.Role, role) {
					authorized = true
					break
				}
			}

			if !authorized {
				utils.JSONError(w, "Forbidden: You do not have permission to perform this action", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireOwnerOrAdmin ensures that the user is either an admin or the owner of the resource (ID in URL)
func RequireOwnerOrAdmin() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			vars := mux.Vars(r)
			id := vars["id"]

			claims := GetUserFromContext(r.Context())
			if claims == nil {
				utils.JSONError(w, "Unauthorized: Authentication required", http.StatusUnauthorized)
				return
			}

			// If admin, allow
			if strings.EqualFold(claims.Role, "admin") {
				next.ServeHTTP(w, r)
				return
			}

			// If owner, allow
			if claims.UserID == id {
				next.ServeHTTP(w, r)
				return
			}

			utils.JSONError(w, "Forbidden: You do not have permission to access/modify this resource", http.StatusForbidden)
		})
	}
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
