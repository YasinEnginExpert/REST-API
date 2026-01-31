package middlewares

import (
	"log"
	"net/http"
	"time"
)

func ResponseTimeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		wrappedWriter := &ResponseWriter{
			ResponseWriter: w,
			status:         http.StatusOK,
			startTime:      start,
		}

		next.ServeHTTP(wrappedWriter, r)

		duration := time.Since(start)

		log.Printf("Method: %s, URL: %s, Status: %d, Duration: %v", r.Method, r.URL.Path, wrappedWriter.status, duration)
	})
}

type ResponseWriter struct {
	http.ResponseWriter
	status    int
	startTime time.Time
}

func (rw *ResponseWriter) WriteHeader(code int) {
	rw.status = code
	// Calculate duration up to this point (Header Flush)
	duration := time.Since(rw.startTime)
	rw.ResponseWriter.Header().Set("X-Response-Time", duration.String())
	rw.ResponseWriter.WriteHeader(code)
}
