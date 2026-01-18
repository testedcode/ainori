package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetVehicles returns vehicles for current user
func (h *Handlers) GetVehicles(c *gin.Context) {
	userID, _ := c.Get("user_id")

	rows, err := h.DB.Query(
		`SELECT id, user_id, vehicle_type, make, model, color, vehicle_number, 
		       total_seats, default_available_seats, created_at, updated_at
		 FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var vehicles []models.Vehicle
	for rows.Next() {
		var vehicle models.Vehicle
		if err := rows.Scan(
			&vehicle.ID, &vehicle.UserID, &vehicle.VehicleType, &vehicle.Make,
			&vehicle.Model, &vehicle.Color, &vehicle.VehicleNumber,
			&vehicle.TotalSeats, &vehicle.DefaultAvailableSeats,
			&vehicle.CreatedAt, &vehicle.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		vehicles = append(vehicles, vehicle)
	}

	c.JSON(http.StatusOK, vehicles)
}

// GetVehicle returns a single vehicle
func (h *Handlers) GetVehicle(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vehicle ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var vehicle models.Vehicle
	err = h.DB.QueryRow(
		`SELECT id, user_id, vehicle_type, make, model, color, vehicle_number, 
		       total_seats, default_available_seats, created_at, updated_at
		 FROM vehicles WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(
		&vehicle.ID, &vehicle.UserID, &vehicle.VehicleType, &vehicle.Make,
		&vehicle.Model, &vehicle.Color, &vehicle.VehicleNumber,
		&vehicle.TotalSeats, &vehicle.DefaultAvailableSeats,
		&vehicle.CreatedAt, &vehicle.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, vehicle)
}

// CreateVehicle creates a new vehicle
func (h *Handlers) CreateVehicle(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		VehicleType           string `json:"vehicle_type" binding:"required,oneof=car bike"`
		Make                  string `json:"make" binding:"required"`
		Model                 string `json:"model" binding:"required"`
		Color                 string `json:"color"`
		VehicleNumber         string `json:"vehicle_number" binding:"required"`
		TotalSeats            int    `json:"total_seats" binding:"required,min=1"`
		DefaultAvailableSeats int    `json:"default_available_seats" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.DefaultAvailableSeats > req.TotalSeats {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Available seats cannot exceed total seats"})
		return
	}

	var color *string
	if req.Color != "" {
		color = &req.Color
	}

	var vehicleID int
	err := h.DB.QueryRow(
		`INSERT INTO vehicles (user_id, vehicle_type, make, model, color, vehicle_number, 
		                       total_seats, default_available_seats)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		userID, req.VehicleType, req.Make, req.Model, color,
		req.VehicleNumber, req.TotalSeats, req.DefaultAvailableSeats,
	).Scan(&vehicleID)

	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Vehicle number already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": vehicleID, "message": "Vehicle created"})
}

// UpdateVehicle updates a vehicle
func (h *Handlers) UpdateVehicle(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vehicle ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var req struct {
		Make                  *string `json:"make"`
		Model                 *string `json:"model"`
		Color                 *string `json:"color"`
		TotalSeats            *int    `json:"total_seats"`
		DefaultAvailableSeats *int    `json:"default_available_seats"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.Make != nil {
		updates = append(updates, "make = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Make)
		argIndex++
	}
	if req.Model != nil {
		updates = append(updates, "model = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Model)
		argIndex++
	}
	if req.Color != nil {
		updates = append(updates, "color = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Color)
		argIndex++
	}
	if req.TotalSeats != nil {
		updates = append(updates, "total_seats = $"+strconv.Itoa(argIndex))
		args = append(args, *req.TotalSeats)
		argIndex++
	}
	if req.DefaultAvailableSeats != nil {
		updates = append(updates, "default_available_seats = $"+strconv.Itoa(argIndex))
		args = append(args, *req.DefaultAvailableSeats)
		argIndex++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id, userID)

	query := `UPDATE vehicles SET ` + updates[0]
	for i := 1; i < len(updates); i++ {
		query += `, ` + updates[i]
	}
	query += ` WHERE id = $` + strconv.Itoa(argIndex) + ` AND user_id = $` + strconv.Itoa(argIndex+1)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vehicle"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vehicle updated"})
}

// DeleteVehicle deletes a vehicle
func (h *Handlers) DeleteVehicle(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vehicle ID"})
		return
	}

	userID, _ := c.Get("user_id")

	_, err = h.DB.Exec(`DELETE FROM vehicles WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vehicle"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vehicle deleted"})
}

