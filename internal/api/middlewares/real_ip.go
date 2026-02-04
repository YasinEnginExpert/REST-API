package middlewares

import (
	"net"
	"net/http"
	"strings"
)

// RealIP resolves the client's true IP address from X-Forwarded-For or X-Real-IP headers.
// IMPORTANT: Only use this if you trust your reverse proxy (Nginx, Cloudflare, etc.)
func RealIP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clientIP := ""

		// 1. Check X-Forwarded-For (standard for proxies)
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			// XFF can contain multiple IPs "client, proxy1, proxy2"
			ips := strings.Split(xff, ",")
			clientIP = strings.TrimSpace(ips[0])
		}

		// 2. Check X-Real-IP (Nginx default)
		if clientIP == "" {
			clientIP = r.Header.Get("X-Real-IP")
		}

		// 3. Fallback to RemoteAddr
		if clientIP == "" {
			ip, _, err := net.SplitHostPort(r.RemoteAddr)
			if err == nil {
				clientIP = ip
			} else {
				clientIP = r.RemoteAddr
			}
		}

		// Update RemoteAddr so subsequent middlewares (like RateLimit, Logger) see the real IP
		r.RemoteAddr = clientIP

		next.ServeHTTP(w, r)
	})
}
