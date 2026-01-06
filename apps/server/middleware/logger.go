package middleware

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger returns a gin.HandlerFunc (middleware) that logs requests using a custom format
func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// Skip logging for health check endpoint
		if param.Path == "/health" {
			return ""
		}
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}