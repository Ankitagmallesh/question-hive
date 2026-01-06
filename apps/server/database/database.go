package database

import (
	"fmt"
	"log"
	"net/url"
	"question-hive-server/config"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the shared GORM database handle for the server.
// Note: Schema and data migrations are owned by Drizzle (TypeScript) against Supabase.
// This Go service only connects and queries; it does not create or mutate schema.
var DB *gorm.DB

// Initialize sets up a read/write connection to Supabase Postgres using DATABASE_URL only.
// REQUIREMENTS:
// - cfg.DatabaseURL must be set to your Supabase connection string (preferably pooled).
// - SSL is required by Supabase; ensure the URL includes sslmode=require or equivalent.
func Initialize(cfg *config.Config) error {
	if cfg.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required for Supabase. Set it in .env.local or environment")
	}

	// Ensure DSN has required options for Supabase pooler compatibility
	dsn := ensureDSNOptions(cfg.DatabaseURL)
	safe := safeDSNForLog(dsn)
	log.Printf("Connecting to Supabase %s", safe)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Connected to Supabase Postgres successfully")
	// IMPORTANT: No AutoMigrate or seed here. Managed by Drizzle migrations in packages/db.
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// ensureDSNOptions appends safe defaults: sslmode=require, default_query_exec_mode=simple_protocol,
// and disables pgx statement cache to avoid "prepared statement already exists" with poolers.
func ensureDSNOptions(raw string) string {
	u, err := url.Parse(raw)
	if err != nil {
		// Fallback: append query string naively
		return appendParam(appendParam(appendParam(raw, "sslmode", "require"), "default_query_exec_mode", "simple_protocol"), "statement_cache_capacity", "0")
	}
	q := u.Query()
	if q.Get("sslmode") == "" {
		q.Set("sslmode", "require")
	}
	if q.Get("default_query_exec_mode") == "" {
		q.Set("default_query_exec_mode", "simple_protocol")
	}
	// Disable pgx statement cache
	if q.Get("statement_cache_capacity") == "" {
		q.Set("statement_cache_capacity", "0")
	}
	u.RawQuery = q.Encode()
	return u.String()
}

func appendParam(dsn, key, value string) string {
	sep := "?"
	if strings.Contains(dsn, "?") {
		sep = "&"
	}
	return dsn + sep + key + "=" + url.QueryEscape(value)
}

// safeDSNForLog redacts credentials and prints host/db for logs
func safeDSNForLog(dsn string) string {
	u, err := url.Parse(dsn)
	if err != nil {
		return "(unable to parse DSN)"
	}
	host := u.Hostname()
	db := strings.TrimPrefix(u.Path, "/")
	return fmt.Sprintf("(host: %s, db: %s)", host, db)
}
