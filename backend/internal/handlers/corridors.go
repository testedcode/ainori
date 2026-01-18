package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetCorridors returns all corridors (filtered by city if provided)
func (h *Handlers) GetCorridors(c *gin.Context) {
	cityID := c.Query("city_id")
	activeOnly := c.Query("active") == "true"

	query := `
		SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, 
		       c.location_to, c.pickup_points, c.terms_conditions, c.is_active, 
		       c.map_enabled, c.created_at, c.updated_at
		FROM corridors c
		JOIN cities ci ON c.city_id = ci.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	if cityID != "" {
		query += ` AND c.city_id = $` + strconv.Itoa(argIndex)
		args = append(args, cityID)
		argIndex++
	}

	if activeOnly {
		query += ` AND c.is_active = true`
	}

	query += ` ORDER BY c.name`

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var corridors []models.Corridor
	for rows.Next() {
		var corridor models.Corridor
		if err := rows.Scan(
			&corridor.ID, &corridor.CityID, &corridor.CityName, &corridor.Name,
			&corridor.LocationFrom, &corridor.LocationTo, &corridor.PickupPoints,
			&corridor.TermsConditions, &corridor.IsActive, &corridor.MapEnabled,
			&corridor.CreatedAt, &corridor.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		corridors = append(corridors, corridor)
	}

	c.JSON(http.StatusOK, corridors)
}

// GetCorridor returns a single corridor
func (h *Handlers) GetCorridor(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid corridor ID"})
		return
	}

	var corridor models.Corridor
	err = h.DB.QueryRow(
		`SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, 
		       c.location_to, c.pickup_points, c.terms_conditions, c.is_active, 
		       c.map_enabled, c.created_at, c.updated_at
		 FROM corridors c
		 JOIN cities ci ON c.city_id = ci.id
		 WHERE c.id = $1`,
		id,
	).Scan(
		&corridor.ID, &corridor.CityID, &corridor.CityName, &corridor.Name,
		&corridor.LocationFrom, &corridor.LocationTo, &corridor.PickupPoints,
		&corridor.TermsConditions, &corridor.IsActive, &corridor.MapEnabled,
		&corridor.CreatedAt, &corridor.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Corridor not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, corridor)
}

// CreateCorridor creates a new corridor (admin only)
func (h *Handlers) CreateCorridor(c *gin.Context) {
	var req struct {
		CityID          int    `json:"city_id" binding:"required"`
		Name            string `json:"name" binding:"required"`
		LocationFrom    string `json:"location_from" binding:"required"`
		LocationTo      string `json:"location_to" binding:"required"`
		PickupPoints    string `json:"pickup_points"`
		TermsConditions string `json:"terms_conditions"`
		IsActive        bool   `json:"is_active"`
		MapEnabled      bool   `json:"map_enabled"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var corridorID int
	err := h.DB.QueryRow(
		`INSERT INTO corridors (city_id, name, location_from, location_to, pickup_points, 
		                        terms_conditions, is_active, map_enabled)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		req.CityID, req.Name, req.LocationFrom, req.LocationTo,
		req.PickupPoints, req.TermsConditions, req.IsActive, req.MapEnabled,
	).Scan(&corridorID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create corridor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": corridorID, "message": "Corridor created"})
}

// UpdateCorridor updates a corridor (admin only)
func (h *Handlers) UpdateCorridor(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid corridor ID"})
		return
	}

	var req struct {
		Name            *string `json:"name"`
		LocationFrom    *string `json:"location_from"`
		LocationTo      *string `json:"location_to"`
		PickupPoints    *string `json:"pickup_points"`
		TermsConditions *string `json:"terms_conditions"`
		IsActive        *bool   `json:"is_active"`
		MapEnabled      *bool   `json:"map_enabled"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Build update query dynamically
	updates := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.Name != nil {
		updates = append(updates, "name = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Name)
		argIndex++
	}
	if req.LocationFrom != nil {
		updates = append(updates, "location_from = $"+strconv.Itoa(argIndex))
		args = append(args, *req.LocationFrom)
		argIndex++
	}
	if req.LocationTo != nil {
		updates = append(updates, "location_to = $"+strconv.Itoa(argIndex))
		args = append(args, *req.LocationTo)
		argIndex++
	}
	if req.PickupPoints != nil {
		updates = append(updates, "pickup_points = $"+strconv.Itoa(argIndex))
		args = append(args, *req.PickupPoints)
		argIndex++
	}
	if req.TermsConditions != nil {
		updates = append(updates, "terms_conditions = $"+strconv.Itoa(argIndex))
		args = append(args, *req.TermsConditions)
		argIndex++
	}
	if req.IsActive != nil {
		updates = append(updates, "is_active = $"+strconv.Itoa(argIndex))
		args = append(args, *req.IsActive)
		argIndex++
	}
	if req.MapEnabled != nil {
		updates = append(updates, "map_enabled = $"+strconv.Itoa(argIndex))
		args = append(args, *req.MapEnabled)
		argIndex++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id)

	query := `UPDATE corridors SET ` + updates[0]
	for i := 1; i < len(updates); i++ {
		query += `, ` + updates[i]
	}
	query += ` WHERE id = $` + strconv.Itoa(argIndex)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update corridor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Corridor updated"})
}

// DeleteCorridor deletes a corridor (admin only)
func (h *Handlers) DeleteCorridor(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid corridor ID"})
		return
	}

	_, err = h.DB.Exec(`DELETE FROM corridors WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete corridor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Corridor deleted"})
}

// GetUserCorridors returns corridors assigned to current user
func (h *Handlers) GetUserCorridors(c *gin.Context) {
	userID, _ := c.Get("user_id")

	rows, err := h.DB.Query(
		`SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, 
		       c.location_to, c.pickup_points, c.terms_conditions, c.is_active, 
		       c.map_enabled, c.created_at, c.updated_at
		 FROM user_corridors uc
		 JOIN corridors c ON uc.corridor_id = c.id
		 JOIN cities ci ON c.city_id = ci.id
		 WHERE uc.user_id = $1 AND c.is_active = true
		 ORDER BY c.name`,
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var corridors []models.Corridor
	for rows.Next() {
		var corridor models.Corridor
		if err := rows.Scan(
			&corridor.ID, &corridor.CityID, &corridor.CityName, &corridor.Name,
			&corridor.LocationFrom, &corridor.LocationTo, &corridor.PickupPoints,
			&corridor.TermsConditions, &corridor.IsActive, &corridor.MapEnabled,
			&corridor.CreatedAt, &corridor.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		corridors = append(corridors, corridor)
	}

	c.JSON(http.StatusOK, corridors)
}

// AssignCorridor assigns a corridor to a user (admin only)
func (h *Handlers) AssignCorridor(c *gin.Context) {
	var req struct {
		UserID    int `json:"user_id" binding:"required"`
		CorridorID int `json:"corridor_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.DB.Exec(
		`INSERT INTO user_corridors (user_id, corridor_id) VALUES ($1, $2)
		 ON CONFLICT (user_id, corridor_id) DO NOTHING`,
		req.UserID, req.CorridorID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign corridor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Corridor assigned"})
}

