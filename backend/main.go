package main

import (
	"log"
	"os"

	"cpool.ai/backend/internal/config"
	"cpool.ai/backend/internal/db"
	"cpool.ai/backend/internal/handlers"
	"cpool.ai/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	database, err := db.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Run migrations
	if err := db.RunMigrations(database); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Initialize handlers
	h := handlers.New(database, cfg)

	// Public routes
	api := router.Group("/api")
	{
		api.GET("/health", handlers.HealthCheck)
		api.POST("/auth/register", h.Register)
		api.POST("/auth/login", h.Login)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Auth
		protected.GET("/auth/profile", h.GetProfile)

		// Stats
		protected.GET("/stats", h.GetStats)

		// Cities
		protected.GET("/cities", h.GetCities)
		protected.PUT("/cities/:id/status", h.UpdateCityStatus) // Admin only

		// Corridors
		protected.GET("/corridors", h.GetCorridors)
		protected.GET("/corridors/:id", h.GetCorridor)
		protected.POST("/corridors", h.CreateCorridor)      // Admin only
		protected.PUT("/corridors/:id", h.UpdateCorridor)    // Admin only
		protected.DELETE("/corridors/:id", h.DeleteCorridor) // Admin only

		// User corridors
		protected.GET("/user/corridors", h.GetUserCorridors)
		protected.POST("/user/corridors", h.AssignCorridor) // Admin only

		// Vehicles
		protected.GET("/vehicles", h.GetVehicles)
		protected.GET("/vehicles/:id", h.GetVehicle)
		protected.POST("/vehicles", h.CreateVehicle)
		protected.PUT("/vehicles/:id", h.UpdateVehicle)
		protected.DELETE("/vehicles/:id", h.DeleteVehicle)

		// Rides
		protected.GET("/rides", h.GetRides)
		protected.GET("/rides/:id", h.GetRide)
		protected.POST("/rides", h.CreateRide)
		protected.PUT("/rides/:id", h.UpdateRide)
		protected.DELETE("/rides/:id", h.CancelRide)

		// Ride requests
		protected.GET("/rides/:id/requests", h.GetRideRequests)
		protected.POST("/rides/:id/requests", h.CreateRideRequest)
		protected.PUT("/rides/:id/requests/:requestId", h.UpdateRideRequest)

		// Messages
		protected.GET("/rides/:id/messages", h.GetMessages)
		protected.POST("/rides/:id/messages", h.CreateMessage)

		// Payments
		protected.GET("/rides/:id/payments", h.GetPayments)
		protected.POST("/rides/:id/payments", h.CreatePayment)
		protected.PUT("/rides/:id/payments/:userId", h.UpdatePaymentStatus)

		// Admin routes
		admin := protected.Group("/admin")
		admin.Use(middleware.AdminMiddleware())
		{
			admin.GET("/users", h.GetAllUsers)
			admin.PUT("/users/:id", h.UpdateUser)
			admin.GET("/analytics", h.GetAnalytics)
			admin.PUT("/features/:name", h.ToggleFeature)
		}
	}

	// Start server
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

