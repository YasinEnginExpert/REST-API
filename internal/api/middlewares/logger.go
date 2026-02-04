package middlewares

import (
	"log"
	"net/http"
	"time"
)

// loggingResponseWriter captures the status code and size of the response
type loggingResponseWriter struct {
	http.ResponseWriter
	status    int
	bytes     int
	startTime time.Time
}

func (lw *loggingResponseWriter) WriteHeader(code int) {
	lw.status = code
	// Add X-Response-Time header
	duration := time.Since(lw.startTime)
	lw.ResponseWriter.Header().Set("X-Response-Time", duration.String())
	lw.ResponseWriter.WriteHeader(code)
}

func (lw *loggingResponseWriter) Write(b []byte) (int, error) {
	// If WriteHeader was not called, default to 200 OK
	if lw.status == 0 {
		lw.status = http.StatusOK
	}
	n, err := lw.ResponseWriter.Write(b)
	lw.bytes += n
	return n, err
}

// Logger middleware provides detailed request logging, panic recovery, and X-Response-Time header
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		reqID := GetRequestID(r.Context())

		// Initialize custom writer with start time for header calculation
		lw := &loggingResponseWriter{
			ResponseWriter: w,
			startTime:      start,
		}

		defer func() {
			// Panic Recovery
			if rec := recover(); rec != nil {
				lw.status = http.StatusInternalServerError
				http.Error(lw, "Internal Server Error", http.StatusInternalServerError)
				log.Printf("[PANIC] req_id=%s ip=%s method=%s uri=%s err=%v",
					reqID, clientIP(r), r.Method, r.RequestURI, rec)
				return
			}

			// Capture status if not set (e.g. implicit 200 on return)
			if lw.status == 0 {
				lw.status = http.StatusOK
			}

			dur := time.Since(start)

			log.Printf("[REQ] req_id=%s ip=%s method=%s uri=%s status=%d bytes=%d dur=%s ua=%q",
				reqID,
				clientIP(r), // Uses utils.go clientIP
				r.Method,
				r.RequestURI,
				lw.status,
				lw.bytes,
				dur.String(),
				r.UserAgent(),
			)
		}()

		next.ServeHTTP(lw, r)
	})
}
