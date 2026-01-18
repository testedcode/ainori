package handlers

import (
	"net/http"
	"strconv"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetAllUsers returns all users (admin only)
func (h *Handlers) GetAllUsers(c *gin.Context) {
	rows, err := h.DB.Query(
		`SELECT id, email, name, phone, city, role, carbon_credits, upi_id, created_at, updated_at
		 FROM users ORDER BY created_at DESC`,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(
			&user.ID, &user.Email, &user.Name, &user.Phone, &user.City,
			&user.Role, &user.CarbCredits, &user.UPIID, &user.CreatedAt, &user.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		users = append(users, user)
	}

	c.JSON(http.StatusOK, users)
}

// UpdateUser updates a user (admin only)
func (h *Handlers) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Name         *string `json:"name"`
		Phone        *string `json:"phone"`
		City         *string `json:"city"`
		Role         *string `json:"role"`
		CarbCredits  *int    `json:"carbon_credits"`
		UPIID        *string `json:"upi_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.Name != nil {
		updates = append(updates, "name = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Name)
		argIndex++
	}
	if req.Phone != nil {
		updates = append(updates, "phone = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Phone)
		argIndex++
	}
	if req.City != nil {
		updates = append(updates, "city = $"+strconv.Itoa(argIndex))
		args = append(args, *req.City)
		argIndex++
	}
	if req.Role != nil {
		updates = append(updates, "role = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Role)
		argIndex++
	}
	if req.CarbCredits != nil {
		updates = append(updates, "carbon_credits = $"+strconv.Itoa(argIndex))
		args = append(args, *req.CarbCredits)
		argIndex++
	}
	if req.UPIID != nil {
		updates = append(updates, "upi_id = $"+strconv.Itoa(argIndex))
		args = append(args, *req.UPIID)
		argIndex++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id)

	query := `UPDATE users SET ` + updates[0]
	for i := 1; i < len(updates); i++ {
		query += `, ` + updates[i]
	}
	query += ` WHERE id = $` + strconv.Itoa(argIndex)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated"})
}

// GetAnalytics returns analytics data (admin only)
func (h *Handlers) GetAnalytics(c *gin.Context) {
	var stats struct {
		TotalUsers      int     `json:"total_users"`
		TotalRides      int     `json:"total_rides"`
		ActiveRides     int     `json:"active_rides"`
		CompletedRides  int     `json:"completed_rides"`
		TotalRevenue    float64 `json:"total_revenue"`
		TotalCredits    int     `json:"total_credits"`
		ActiveCorridors int     `json:"active_corridors"`
	}

	h.DB.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&stats.TotalUsers)
	h.DB.QueryRow(`SELECT COUNT(*) FROM rides`).Scan(&stats.TotalRides)
	h.DB.QueryRow(`SELECT COUNT(*) FROM rides WHERE status IN ('open', 'partially_filled')`).Scan(&stats.ActiveRides)
	h.DB.QueryRow(`SELECT COUNT(*) FROM rides WHERE status = 'completed'`).Scan(&stats.CompletedRides)
	h.DB.QueryRow(`SELECT COALESCE(SUM(amount), 0) FROM payments WHERE rider_status = 'done' AND giver_status = 'received'`).Scan(&stats.TotalRevenue)
	h.DB.QueryRow(`SELECT COALESCE(SUM(credits), 0) FROM carbon_credits`).Scan(&stats.TotalCredits)
	h.DB.QueryRow(`SELECT COUNT(*) FROM corridors WHERE is_active = true`).Scan(&stats.ActiveCorridors)

	c.JSON(http.StatusOK, stats)
}

// ToggleFeature toggles a feature flag (admin only)
func (h *Handlers) ToggleFeature(c *gin.Context) {
	featureName := c.Param("name")

	var req struct {
		Enabled bool `json:"enabled"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(
		`UPDATE feature_flags SET enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE name = $2`,
		req.Enabled, featureName,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to toggle feature"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Feature toggled"})
}

