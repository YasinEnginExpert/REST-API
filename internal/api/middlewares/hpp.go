package middlewares

import (
	"net/http"
	"net/url"

	pkgutils "restapi/pkg/utils"
)

// HPP Middleware (HTTP Parameter Pollution)
// Returns a middleware that rejects duplicate query parameters unless they are in the allowMulti list.
func HPP(allowMulti map[string]bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// clean := make(url.Values, len(params)) // optimization: pre-allocate
			// r.URL.Query() parses raw query every time.
			// Optimization: Parse manually or just use Query() once.
			params := r.URL.Query()
			clean := make(url.Values, len(params))

			for key, values := range params {
				// If duplicate exists and not allowed, Reject (Security Best Practice)
				if len(values) > 1 && !allowMulti[key] {
					pkgutils.JSONError(w, "Duplicate query parameter forbidden: "+key, http.StatusBadRequest)
					return
				}

				// Normalize: If allowed multi, keep all. If single, keep first.
				// Since we rejected unauthorized duplicates, we can safely copy values.
				// But wait, if we allow multi, we should keep them.
				// If we don't allow multi (and didn't error because len=1), we keep it.
				// So we can just copy 'values' to 'clean' for allowed keys,
				// and for non-allowed keys (which are guaranteed to be length 1 here) copy them too.

				// Actually, simpler logic:
				// If len > 1 && !allowed -> Error
				// Else -> Copy values
				clean[key] = values
			}

			// Re-encode is necessary to actually sanitize the r.URL.RawQuery
			// This ensures downstream handlers using r.URL.RawQuery see the cleaned version
			// (though here we just validated, but technically r.URL.Query() is a copy)
			// If we want to enforce the check, we don't strictly *need* to rewrite if we rejected bad ones.
			// But creating a clean map and re-encoding ensures deterministic order and no side-channel junk.
			r.URL.RawQuery = clean.Encode()

			next.ServeHTTP(w, r)
		})
	}
}
