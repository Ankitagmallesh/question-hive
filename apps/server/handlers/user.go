package handlers

import (
	"net/http"
	"question-hive-server/models"

	"github.com/gin-gonic/gin"
)

// UpdateProfile updates the current user's profile
func UpdateProfile(c *gin.Context) {
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Profile updated successfully",
		Data: gin.H{
			"message": "Update profile endpoint - coming soon",
		},
	})
}
