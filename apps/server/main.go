package main

import (
	"log"
	"question-hive-server/config"
	"question-hive-server/database"
	"question-hive-server/routes"
	"question-hive-server/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(".env.local"); err != nil {
		log.Println("No .env.local file found, using environment variables")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize JWT with secret
	utils.InitJWT(cfg.JWTSecret)

	// Set Gin mode
	if cfg.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	if err := database.Initialize(cfg); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Note: Schema and migrations are handled by Drizzle (packages/db) against Supabase.
	// This service only connects and queries.

	// Initialize Gin router
	r := gin.Default()

	// Configure CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = cfg.CORSOrigins
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Setup routes
	routes.SetupRoutes(r)

	log.Printf("🚀 Question Hive Server starting on port %s", cfg.Port)
	log.Printf("📊 Database connected (schema managed by Drizzle)")
	log.Printf("🔧 Environment: %s", cfg.GinMode)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
