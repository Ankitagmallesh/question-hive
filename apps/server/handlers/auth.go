package handlers

import (
	"net/http"
	"question-hive-server/models"

	"github.com/gin-gonic/gin"
)

// Register creates a new user account
func Register(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.APIResponse{Success: false, Error: "Registration via Go API disabled; use web/Supabase flow"})
}

// Login authenticates a user and returns a JWT token
func Login(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.APIResponse{Success: false, Error: "Password login disabled; integrate Supabase Auth"})
}

// GetProfile returns the current user's profile
func GetProfile(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.APIResponse{Success: false, Error: "Profile endpoint disabled until Supabase Auth mapping"})
}

// RefreshToken generates a new token for the authenticated user
func RefreshToken(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.APIResponse{Success: false, Error: "Token refresh disabled; use Supabase session"})
}
