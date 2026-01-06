package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID        uint   `json:"user_id"`
	Email         string `json:"email"`
	Role          string `json:"role"`
	InstitutionID *uint  `json:"institution_id"`
	jwt.RegisteredClaims
}

var jwtSecret []byte

// Initialize JWT secret
func InitJWT(secret string) {
	jwtSecret = []byte(secret)
}

// GenerateJWT creates a new JWT token for the user
func GenerateJWT(userID uint, email, role string, institutionID *uint) (string, error) {
	claims := JWTClaims{
		UserID:        userID,
		Email:         email,
		Role:          role,
		InstitutionID: institutionID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   email,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateJWT validates and parses a JWT token
func ValidateJWT(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshToken generates a new token with extended expiry
func RefreshToken(tokenString string) (string, error) {
	claims, err := ValidateJWT(tokenString)
	if err != nil {
		return "", err
	}

	// Generate new token with same claims but extended expiry
	return GenerateJWT(claims.UserID, claims.Email, claims.Role, claims.InstitutionID)
}
