package handlers

import (
	"net/http"
	"question-hive-server/models"

	"github.com/gin-gonic/gin"
)

// GoogleOAuthRequest represents the request from frontend after Google OAuth
type GoogleOAuthRequest struct {
	Token    string `json:"token" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Picture  string `json:"picture"`
	Provider string `json:"provider" binding:"required"`
}

// GoogleUserInfo represents user info from Google
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

// GoogleOAuthCallback handles OAuth callback from Google
func GoogleOAuthCallback(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.APIResponse{Success: false, Error: "OAuth via Go API disabled; use Supabase Auth"})
}

// verifyGoogleToken verifies the Google ID token
// verifyGoogleToken intentionally removed in Supabase-only mode
