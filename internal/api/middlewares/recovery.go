package middlewares

import (
	"log"
	"net/http"
	pkgutils "restapi/pkg/utils"
	"runtime/debug"
)

func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[PANIC] %v\nStack: %s", err, string(debug.Stack()))
				pkgutils.JSONError(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()

		next.ServeHTTP(w, r)
	})
}
