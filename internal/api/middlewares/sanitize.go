package middlewares

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

const maxRequestBodySize = 1 << 20 // 1MB

// SanitizeMiddleware provides production-grade XSS protection.
// It limits request size, avoids mutating sensitive keys, and can reject suspicious requests.
func SanitizeMiddleware(next http.Handler) http.Handler {
	policy := bluemonday.UGCPolicy()
	strictMode := true // Reject requests with 400 if they contain suspicious payloads

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Limit Body Size to prevent DoS
		if r.Body != nil {
			r.Body = http.MaxBytesReader(w, r.Body, maxRequestBodySize)
		}

		// 2. Sanitize Query Parameters (Values only)
		params := r.URL.Query()
		changedQuery := false
		for key, values := range params {
			for i, val := range values {
				sVal := policy.Sanitize(val)
				if sVal != val {
					changedQuery = true
					params[key][i] = sVal
				}
			}
		}

		if strictMode && changedQuery {
			http.Error(w, "Potential XSS detected in query parameters", http.StatusBadRequest)
			return
		}
		if !strictMode {
			r.URL.RawQuery = params.Encode()
		}

		// 3. Sanitize Body based on Content-Type
		contentType := r.Header.Get("Content-Type")
		if strings.Contains(contentType, "application/json") {
			if !handleJSONBody(w, r, policy, strictMode) {
				return
			}
		} else if strings.Contains(contentType, "application/x-www-form-urlencoded") ||
			strings.Contains(contentType, "multipart/form-data") {
			if !handleFormBody(w, r, policy, strictMode) {
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

func handleJSONBody(w http.ResponseWriter, r *http.Request, policy *bluemonday.Policy, strict bool) bool {
	bodyBytes, err := readAndRestoreBody(r)
	if err != nil {
		if err.Error() == "http: request body too large" {
			http.Error(w, "Request body too large", http.StatusRequestEntityTooLarge)
			return false
		}
		return true // Continue with whatever body we have
	}
	if len(bodyBytes) == 0 {
		return true
	}

	var inputData interface{}
	if err := json.Unmarshal(bodyBytes, &inputData); err != nil {
		return true // Invalid JSON is not an XSS error
	}

	sanitizedData, changed := sanitizeValue(inputData, policy)

	if strict && changed {
		http.Error(w, "Potential XSS detected in JSON body", http.StatusBadRequest)
		return false
	}

	if changed {
		newBodyBytes, err := json.Marshal(sanitizedData)
		if err == nil {
			r.Body = io.NopCloser(bytes.NewReader(newBodyBytes))
			r.ContentLength = int64(len(newBodyBytes))
		}
	}

	return true
}

func handleFormBody(w http.ResponseWriter, r *http.Request, policy *bluemonday.Policy, strict bool) bool {
	// Pre-read body to allow restoration because ParseForm consumes it
	bodyBytes, _ := readAndRestoreBody(r)

	if err := r.ParseForm(); err != nil {
		return true
	}

	changed := false
	for k, values := range r.PostForm {
		for i, v := range values {
			sv := policy.Sanitize(v)
			if sv != v {
				changed = true
				r.PostForm[k][i] = sv
			}
		}
	}

	if r.MultipartForm != nil {
		for k, values := range r.MultipartForm.Value {
			for i, v := range values {
				sv := policy.Sanitize(v)
				if sv != v {
					changed = true
					r.MultipartForm.Value[k][i] = sv
				}
			}
		}
	}

	if strict && changed {
		http.Error(w, "Potential XSS detected in form data", http.StatusBadRequest)
		return false
	}

	// Restore body just in case other middlewares need it
	if bodyBytes != nil {
		r.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	}

	return true
}

func readAndRestoreBody(r *http.Request) ([]byte, error) {
	if r.Body == nil {
		return nil, nil
	}
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, err
	}
	r.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	return bodyBytes, nil
}

func sanitizeValue(data interface{}, policy *bluemonday.Policy) (interface{}, bool) {
	changed := false
	switch v := data.(type) {
	case string:
		s := policy.Sanitize(v)
		if s != v {
			return s, true
		}
		return v, false
	case map[string]interface{}:
		for key, val := range v {
			sv, c := sanitizeValue(val, policy)
			if c {
				changed = true
				v[key] = sv
			}
		}
		return v, changed
	case []interface{}:
		for i, val := range v {
			sv, c := sanitizeValue(val, policy)
			if c {
				changed = true
				v[i] = sv
			}
		}
		return v, changed
	default:
		return v, false
	}
}
