package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	Port        string   `mapstructure:"PORT"`
	GinMode     string   `mapstructure:"GIN_MODE"`
	CORSOrigins []string `mapstructure:"CORS_ORIGINS"`

	// Database configuration
	DatabaseURL  string `mapstructure:"DATABASE_URL"`
	DBHost       string `mapstructure:"DB_HOST"`
	DBPort       string `mapstructure:"DB_PORT"`
	DBUser       string `mapstructure:"DB_USER"`
	DBPassword   string `mapstructure:"DB_PASSWORD"`
	DBName       string `mapstructure:"DB_NAME"`

	// JWT configuration
	JWTSecret string `mapstructure:"JWT_SECRET"`
	
	// External APIs
	GeminiAPIKey string `mapstructure:"GEMINI_API_KEY"`
}

func Load() *Config {
	// Try to load .env.local first, then .env
	envFiles := []string{".env.local", ".env"}
	for _, file := range envFiles {
		if err := godotenv.Load(file); err == nil {
			log.Printf("Loaded environment from %s", file)
			break
		}
	}

	// Set defaults
	viper.SetDefault("PORT", "8080")
	viper.SetDefault("GIN_MODE", "debug")
	viper.SetDefault("CORS_ORIGINS", "http://localhost:3000")
	viper.SetDefault("JWT_SECRET", "WEAREWETEAMRK7")

	// Read from environment
	viper.AutomaticEnv()

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatal("Failed to unmarshal config:", err)
	}

	// Explicitly read DATABASE_URL from environment if not set
	if config.DatabaseURL == "" {
		config.DatabaseURL = os.Getenv("DATABASE_URL")
	}

	// Parse CORS origins if it's a comma-separated string
	if corsOrigins := os.Getenv("CORS_ORIGINS"); corsOrigins != "" {
		config.CORSOrigins = strings.Split(corsOrigins, ",")
		for i := range config.CORSOrigins {
			config.CORSOrigins[i] = strings.TrimSpace(config.CORSOrigins[i])
		}
	}

	return &config
}




