package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	// These will be set by the main application from config
	jwtSecret = []byte("default-secret")
	jwtExp    = 24 * time.Hour
)

// ConfigureJWT sets the JWT secret and expiration duration
// Should be called at application startup
func ConfigureJWT(secret string, expiration string) error {
	jwtSecret = []byte(secret)

	dur, err := time.ParseDuration(expiration)
	if err != nil {
		return err
	}
	jwtExp = dur
	return nil
}

// UserClaims defines the custom claims structure
type UserClaims struct {
	UserID   string `json:"uid"`
	Username string `json:"user"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// SignToken generates a new JWT token for a user
func SignToken(userID, username, role string) (string, error) {
	claims := UserClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(jwtExp)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// VerifyToken parses and validates a token string
func VerifyToken(tokenString string) (*UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*UserClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
