package middlewares

import "net/http"

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. X-XSS-Protection: 1; mode=block
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// 2. X-Frame-Options: deny
		w.Header().Set("X-Frame-Options", "deny")

		// 3. X-Content-Type-Options: nosniff
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// 4. Content-Security-Policy
		csp := "default-src 'self'; " +
			"script-src 'self'; " +
			"style-src 'self'; " +
			"img-src 'self' data:; " +
			"font-src 'self'; " +
			"object-src 'none'; " +
			"base-uri 'self'; " +
			"frame-ancestors 'none';"
		w.Header().Set("Content-Security-Policy", csp)

		// 5. Strict-Transport-Security
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

		// 6. Referrer-Policy
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		// 7. Permissions-Policy
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		// 8. Cache-Control (Prevent caching of sensitive API data)
		w.Header().Set("Cache-Control", "no-store")

		// 9. Cross-Origin Policies (Isolation)
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
		w.Header().Set("Cross-Origin-Resource-Policy", "same-origin")
		w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")

		// 10. Extra Hardening for Legacy/Specific Vectors
		// Flash/Adobe cross-domain policy
		w.Header().Set("X-Permitted-Cross-Domain-Policies", "none")
		// IE legacy download option
		w.Header().Set("X-Download-Options", "noopen")
		// Browser isolation request
		w.Header().Set("Origin-Agent-Cluster", "?1")

		next.ServeHTTP(w, r)
	})
}
