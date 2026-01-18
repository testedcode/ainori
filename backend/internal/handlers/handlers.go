package handlers

import (
	"cpool.ai/backend/internal/config"
	"database/sql"

	"github.com/gin-gonic/gin"
)

// Handlers holds all handler dependencies
type Handlers struct {
	DB     *sql.DB
	Config *config.Config
}

// New creates a new Handlers instance
func New(db *sql.DB, cfg *config.Config) *Handlers {
	return &Handlers{
		DB:     db,
		Config: cfg,
	}
}

// HealthCheck returns API health status
func HealthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"status":  "ok",
		"message": "cpool.ai API is running",
	})
}

