package middlewares

import (
	"log"
	"net/http"
	"sync"
	"time"
)

type rateLimiter struct {
	mu        sync.Mutex
	visitors  map[string]int
	limit     int
	resetTime time.Duration
}

// NewRateLimiter creates a new rate limiter instance
func NewRateLimiter(limit int, resetTime time.Duration) *rateLimiter {
	rl := &rateLimiter{
		visitors:  make(map[string]int),
		limit:     limit,
		resetTime: resetTime,
	}
	go rl.resetVisitorCount()
	return rl
}

func (rl *rateLimiter) resetVisitorCount() {
	for {
		time.Sleep(rl.resetTime)
		rl.mu.Lock()
		rl.visitors = make(map[string]int)
		rl.mu.Unlock()
	}
}

func (rl *rateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rl.mu.Lock()
		defer rl.mu.Unlock()

		visitorIP := r.RemoteAddr
		// In a real app, you might want to strip the port from RemoteAddr
		rl.visitors[visitorIP]++

		if rl.visitors[visitorIP] > rl.limit {
			log.Printf("[RateLimit] Too many requests from %s", visitorIP)
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Global instance for simple usage in routers.go
// 100 requests per minute
var GlobalRateLimiter = NewRateLimiter(100, 1*time.Minute)

// wrapper to match router.Use signature
func RateLimit(next http.Handler) http.Handler {
	return GlobalRateLimiter.Middleware(next)
}
