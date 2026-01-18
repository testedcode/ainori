package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetStats returns live statistics
func (h *Handlers) GetStats(c *gin.Context) {
	today := time.Now().Format("2006-01-02")

	var ridesToday, ridesTakenToday, usersOnline int

	// Count rides today
	h.DB.QueryRow(
		`SELECT COUNT(*) FROM rides WHERE ride_date = $1 AND status != 'cancelled'`,
		today,
	).Scan(&ridesToday)

	// Count rides taken today (accepted requests)
	h.DB.QueryRow(
		`SELECT COUNT(*) FROM ride_requests 
		 WHERE DATE(created_at) = $1 AND status = 'accepted'`,
		today,
	).Scan(&ridesTakenToday)

	// Count users online (active in last 15 minutes)
	// For now, we'll use a simple count of users who logged in today
	h.DB.QueryRow(
		`SELECT COUNT(DISTINCT user_id) FROM rides 
		 WHERE DATE(created_at) = $1 OR DATE(updated_at) = $1`,
		today,
	).Scan(&usersOnline)

	c.JSON(http.StatusOK, gin.H{
		"rides_today":      ridesToday,
		"rides_taken_today": ridesTakenToday,
		"users_online":     usersOnline,
	})
}

