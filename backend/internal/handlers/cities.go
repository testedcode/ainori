package handlers

import (

	"net/http"
	"strconv"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetCities returns all cities
func (h *Handlers) GetCities(c *gin.Context) {
	rows, err := h.DB.Query(`SELECT id, name, status, created_at, updated_at FROM cities ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var cities []models.City
	for rows.Next() {
		var city models.City
		if err := rows.Scan(&city.ID, &city.Name, &city.Status, &city.CreatedAt, &city.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		cities = append(cities, city)
	}

	c.JSON(http.StatusOK, cities)
}

// UpdateCityStatus updates city status (admin only)
func (h *Handlers) UpdateCityStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid city ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=active locked"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err = h.DB.Exec(`UPDATE cities SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, req.Status, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "City status updated"})
}

