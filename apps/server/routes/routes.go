package routes

import (
	"question-hive-server/handlers"
	"question-hive-server/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all application routes
func SetupRoutes(r *gin.Engine) {
	// Add logger middleware
	r.Use(middleware.Logger())
	
	// Health check
	r.GET("/health", handlers.HealthCheck)
	
	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/oauth/google", handlers.GoogleOAuthCallback)
		}
		
		// Academic routes (public for now, can be protected later)
		academic := v1.Group("/academic")
		{
			// Exam routes
			exams := academic.Group("/exams")
			{
				exams.GET("", handlers.GetExams)
				exams.GET("/:exam_id/subjects", handlers.GetSubjects)
			}
			
			// Subject routes
			subjects := academic.Group("/subjects")
			{
				subjects.GET("", handlers.GetSubjects)
				subjects.GET("/:subject_id", handlers.GetSubject)
				subjects.GET("/:subject_id/chapters", handlers.GetChapters)
			}
			
			// Chapter routes
			chapters := academic.Group("/chapters")
			{
				chapters.GET("", handlers.GetChapters)
				chapters.GET("/:chapter_id", handlers.GetChapter)
			}
		}
		
		// Protected routes
		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// User profile
			user := protected.Group("/user")
			{
				user.GET("/profile", handlers.GetProfile)
				user.PUT("/profile", handlers.UpdateProfile)
			}
			
			// Questions (protected)
			questions := protected.Group("/questions")
			{
				questions.GET("", handlers.GetQuestions)
				questions.POST("", handlers.CreateQuestion)
				questions.GET("/:id", handlers.GetQuestion)
				questions.PUT("/:id", handlers.UpdateQuestion)
				questions.DELETE("/:id", handlers.DeleteQuestion)
			}
			
			// Question Papers (protected)
			papers := protected.Group("/question-papers")
			{
				papers.GET("", handlers.GetQuestionPapers)
				papers.POST("", handlers.CreateQuestionPaper)
				papers.GET("/:id", handlers.GetQuestionPaper)
				papers.PUT("/:id", handlers.UpdateQuestionPaper)
				papers.DELETE("/:id", handlers.DeleteQuestionPaper)
			}
		}
	}
}
