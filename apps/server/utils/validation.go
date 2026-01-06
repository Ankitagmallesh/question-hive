package utils

import (
	"log"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

// ValidateStruct validates a struct using the validator tags
func ValidateStruct(s interface{}) error {
	return validate.Struct(s)
}

// LogError logs an error with context
func LogError(context string, err error) {
	if err != nil {
		log.Printf("[ERROR] %s: %v", context, err)
	}
}

// LogInfo logs an info message
func LogInfo(message string) {
	log.Printf("[INFO] %s", message)
}
