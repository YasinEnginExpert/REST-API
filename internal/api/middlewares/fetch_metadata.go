package middlewares

import (
	"net/http"
)

// FetchMetadata middleware implements a resource isolation policy using Sec-Fetch-* headers.
// It protects against CSRF and cross-origin attacks by rejecting unexpected cross-site requests.
// See: https://web.dev/fetch-metadata/
func FetchMetadata(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Allow direct navigation and standard top-level navigations (GET/HEAD)
		// Usually mode='navigate' or destined for 'document'
		// But for a REST API, we primarily care about blocking state-changing cross-site calls.

		// If the browser doesn't support these headers, we skip the check (allow by default for compatibility).
		// Sec-Fetch-Site is the primary indicator.
		site := r.Header.Get("Sec-Fetch-Site")

		// If header is missing, allow (or block if you want strict enforcement for modern browsers only)
		if site == "" {
			next.ServeHTTP(w, r)
			return
		}

		// 2. Allow same-origin, same-site, and browser-initiated requests (none)
		// 'same-origin': Request comes from the same origin (e.g., app internal fetch)
		// 'same-site': Request comes from same site (e.g., subdomain)
		// 'none': User typed URL or clicked bookmark (top-level navigation)
		if site == "same-origin" || site == "same-site" || site == "none" {
			next.ServeHTTP(w, r)
			return
		}

		// 3. Allow simple top-level navigation (GET/HEAD) from anywhere
		// This ensures users can click links TO your site, but external sites can't POST to it.
		// Sec-Fetch-Mode: navigate
		// Also allow OPTIONS (CORS preflight)
		mode := r.Header.Get("Sec-Fetch-Mode")
		if (mode == "navigate" && (r.Method == http.MethodGet || r.Method == http.MethodHead)) || r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		// 4. Special Exception for standard simple requests if needed (optional)
		// For stricter API security, we generally block everything else coming from 'cross-site'.

		// If we are here, it means the request is 'cross-site' and NOT a simple navigation.
		// Example: A malicious site doing a POST to your API via <form> or fetch().
		// We block it.

		// Log attack attempt if desire
		// log.Printf("Blocked cross-site request from %s to %s", r.Header.Get("Origin"), r.URL.Path)

		w.WriteHeader(http.StatusForbidden)
		// Do not use json error here to keep it lightweight and standard
	})
}
