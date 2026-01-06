package handlers

import (
	"net/http"
	"question-hive-server/models"
	"time"

	"github.com/gin-gonic/gin"
)

// HealthCheck endpoint for monitoring
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Question Hive Server is running",
		Data: gin.H{
			"status":    "healthy",
			"timestamp": time.Now(),
			"version":   "1.0.0",
		},
	})
}

// HealthHandler kept for backward compatibility with tests expecting this exact name.
func HealthHandler(c *gin.Context) {
	c.String(http.StatusOK, "Question Hive API is running")
}

// PingHandler simple ping endpoint returning pong.
func PingHandler(c *gin.Context) {
	c.String(http.StatusOK, "pong")
}
