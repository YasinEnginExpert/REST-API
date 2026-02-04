package middlewares

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	pkgutils "restapi/pkg/utils"
)

type visitor struct {
	count    int
	resetAt  time.Time
	lastSeen time.Time
}

type rateLimiter struct {
	mu        sync.Mutex
	visitors  map[string]*visitor
	limit     int
	resetTime time.Duration
	ttl       time.Duration
}

// NewRateLimiter creates a new rate limiter instance
func NewRateLimiter(limit int, resetTime time.Duration) *rateLimiter {
	rl := &rateLimiter{
		visitors:  make(map[string]*visitor),
		limit:     limit,
		resetTime: resetTime,
		ttl:       10 * time.Minute, // remove visitors not seen for 10 min
	}
	go rl.cleanupVisitors()
	return rl
}

func (rl *rateLimiter) cleanupVisitors() {
	t := time.NewTicker(1 * time.Minute)
	// In a real app app shutdown, we should stop this ticker, but for this simple example it's fine.
	// defer t.Stop()

	for range t.C {
		now := time.Now()
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if now.Sub(v.lastSeen) > rl.ttl {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *rateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		now := time.Now()

		rl.mu.Lock()

		v, ok := rl.visitors[ip]
		if !ok {
			v = &visitor{count: 0, resetAt: now.Add(rl.resetTime)}
			rl.visitors[ip] = v
		}

		// Has the window expired for this user?
		if now.After(v.resetAt) {
			v.count = 0
			v.resetAt = now.Add(rl.resetTime)
		}

		v.count++
		v.lastSeen = now

		remaining := rl.limit - v.count
		retryAfter := int(v.resetAt.Sub(now).Seconds())
		over := v.count > rl.limit

		rl.mu.Unlock() // Critical: Unlock BEFORE next.ServeHTTP

		// Rate limit headers (great for client debugging)
		w.Header().Set("X-RateLimit-Limit", strconv.Itoa(rl.limit))
		valRemaining := remaining
		if valRemaining < 0 {
			valRemaining = 0
		}
		w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(valRemaining))
		w.Header().Set("X-RateLimit-Reset", strconv.FormatInt(v.resetAt.Unix(), 10))

		if over {
			w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
			pkgutils.JSONError(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// GlobalRateLimiter instance for router usage
var GlobalRateLimiter = NewRateLimiter(100, 1*time.Minute)

// RateLimit wrapper to match router.Use signature
func RateLimit(next http.Handler) http.Handler {
	return GlobalRateLimiter.Middleware(next)
}
