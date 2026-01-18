package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetRides returns rides (filtered by various criteria)
func (h *Handlers) GetRides(c *gin.Context) {
	corridorID := c.Query("corridor_id")
	date := c.Query("date")
	status := c.Query("status")
	userIDParam := c.Query("user_id")

	query := `
		SELECT r.id, r.user_id, u.name as user_name, r.corridor_id, c.name as corridor_name,
		       r.vehicle_id, r.ride_date, r.ride_time, r.pickup_point, r.drop_point,
		       r.route_description, r.price_per_seat, r.available_seats, r.total_seats,
		       r.status, r.created_at, r.updated_at
		FROM rides r
		JOIN users u ON r.user_id = u.id
		JOIN corridors c ON r.corridor_id = c.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	if corridorID != "" {
		query += ` AND r.corridor_id = $` + strconv.Itoa(argIndex)
		args = append(args, corridorID)
		argIndex++
	}

	if date != "" {
		query += ` AND r.ride_date = $` + strconv.Itoa(argIndex)
		args = append(args, date)
		argIndex++
	} else {
		// Default to today + next 2 days
		today := time.Now().Format("2006-01-02")
		tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
		dayAfter := time.Now().AddDate(0, 0, 2).Format("2006-01-02")
		query += ` AND r.ride_date IN ($` + strconv.Itoa(argIndex) + `, $` + strconv.Itoa(argIndex+1) + `, $` + strconv.Itoa(argIndex+2) + `)`
		args = append(args, today, tomorrow, dayAfter)
		argIndex += 3
	}

	if status != "" {
		query += ` AND r.status = $` + strconv.Itoa(argIndex)
		args = append(args, status)
		argIndex++
	} else {
		query += ` AND r.status IN ('open', 'partially_filled')`
	}

	if userIDParam != "" {
		query += ` AND r.user_id = $` + strconv.Itoa(argIndex)
		args = append(args, userIDParam)
		argIndex++
	}

	query += ` ORDER BY r.ride_date, r.ride_time`

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var rides []models.Ride
	for rows.Next() {
		var ride models.Ride
		if err := rows.Scan(
			&ride.ID, &ride.UserID, &ride.UserName, &ride.CorridorID, &ride.CorridorName,
			&ride.VehicleID, &ride.RideDate, &ride.RideTime, &ride.PickupPoint, &ride.DropPoint,
			&ride.RouteDescription, &ride.PricePerSeat, &ride.AvailableSeats, &ride.TotalSeats,
			&ride.Status, &ride.CreatedAt, &ride.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		rides = append(rides, ride)
	}

	c.JSON(http.StatusOK, rides)
}

// GetRide returns a single ride with details
func (h *Handlers) GetRide(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	var ride models.Ride
	err = h.DB.QueryRow(
		`SELECT r.id, r.user_id, u.name as user_name, r.corridor_id, c.name as corridor_name,
		       r.vehicle_id, r.ride_date, r.ride_time, r.pickup_point, r.drop_point,
		       r.route_description, r.price_per_seat, r.available_seats, r.total_seats,
		       r.status, r.created_at, r.updated_at
		 FROM rides r
		 JOIN users u ON r.user_id = u.id
		 JOIN corridors c ON r.corridor_id = c.id
		 WHERE r.id = $1`,
		id,
	).Scan(
		&ride.ID, &ride.UserID, &ride.UserName, &ride.CorridorID, &ride.CorridorName,
		&ride.VehicleID, &ride.RideDate, &ride.RideTime, &ride.PickupPoint, &ride.DropPoint,
		&ride.RouteDescription, &ride.PricePerSeat, &ride.AvailableSeats, &ride.TotalSeats,
		&ride.Status, &ride.CreatedAt, &ride.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Get vehicle info if available
	if ride.VehicleID != nil {
		var vehicle models.Vehicle
		err = h.DB.QueryRow(
			`SELECT id, user_id, vehicle_type, make, model, color, vehicle_number,
			       total_seats, default_available_seats
			 FROM vehicles WHERE id = $1`,
			*ride.VehicleID,
		).Scan(
			&vehicle.ID, &vehicle.UserID, &vehicle.VehicleType, &vehicle.Make,
			&vehicle.Model, &vehicle.Color, &vehicle.VehicleNumber,
			&vehicle.TotalSeats, &vehicle.DefaultAvailableSeats,
		)
		if err == nil {
			ride.VehicleInfo = &vehicle
		}
	}

	c.JSON(http.StatusOK, ride)
}

// CreateRide creates a new ride
func (h *Handlers) CreateRide(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		CorridorID       int     `json:"corridor_id" binding:"required"`
		VehicleID        int     `json:"vehicle_id" binding:"required"`
		RideDate         string  `json:"ride_date" binding:"required"`
		RideTime         string  `json:"ride_time" binding:"required"`
		PickupPoint      string  `json:"pickup_point" binding:"required"`
		DropPoint        string  `json:"drop_point" binding:"required"`
		RouteDescription string  `json:"route_description"`
		PricePerSeat     float64 `json:"price_per_seat" binding:"required,min=0"`
		AvailableSeats   int     `json:"available_seats" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate date (today or next 2 days only)
	today := time.Now()
	rideDate, err := time.Parse("2006-01-02", req.RideDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	daysDiff := int(rideDate.Sub(today).Hours() / 24)
	if daysDiff < 0 || daysDiff > 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ride date must be today or within next 2 days"})
		return
	}

	// Get vehicle to get total seats
	var totalSeats int
	err = h.DB.QueryRow(
		`SELECT total_seats FROM vehicles WHERE id = $1 AND user_id = $2`,
		req.VehicleID, userID,
	).Scan(&totalSeats)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if req.AvailableSeats > totalSeats {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Available seats cannot exceed vehicle capacity"})
		return
	}

	// Verify user has access to corridor
	var hasAccess bool
	err = h.DB.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM user_corridors WHERE user_id = $1 AND corridor_id = $2)`,
		userID, req.CorridorID,
	).Scan(&hasAccess)

	if err != nil || !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have access to this corridor"})
		return
	}

	var routeDesc *string
	if req.RouteDescription != "" {
		routeDesc = &req.RouteDescription
	}

	var rideID int
	err = h.DB.QueryRow(
		`INSERT INTO rides (user_id, corridor_id, vehicle_id, ride_date, ride_time,
		                   pickup_point, drop_point, route_description, price_per_seat,
		                   available_seats, total_seats, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'open') RETURNING id`,
		userID, req.CorridorID, req.VehicleID, req.RideDate, req.RideTime,
		req.PickupPoint, req.DropPoint, routeDesc, req.PricePerSeat,
		req.AvailableSeats, totalSeats,
	).Scan(&rideID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ride"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": rideID, "message": "Ride created"})
}

// UpdateRide updates a ride
func (h *Handlers) UpdateRide(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var req struct {
		RideTime         *string  `json:"ride_time"`
		PickupPoint      *string  `json:"pickup_point"`
		DropPoint        *string  `json:"drop_point"`
		RouteDescription *string  `json:"route_description"`
		PricePerSeat     *float64 `json:"price_per_seat"`
		AvailableSeats   *int     `json:"available_seats"`
		Status           *string  `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.RideTime != nil {
		updates = append(updates, "ride_time = $"+strconv.Itoa(argIndex))
		args = append(args, *req.RideTime)
		argIndex++
	}
	if req.PickupPoint != nil {
		updates = append(updates, "pickup_point = $"+strconv.Itoa(argIndex))
		args = append(args, *req.PickupPoint)
		argIndex++
	}
	if req.DropPoint != nil {
		updates = append(updates, "drop_point = $"+strconv.Itoa(argIndex))
		args = append(args, *req.DropPoint)
		argIndex++
	}
	if req.RouteDescription != nil {
		updates = append(updates, "route_description = $"+strconv.Itoa(argIndex))
		args = append(args, *req.RouteDescription)
		argIndex++
	}
	if req.PricePerSeat != nil {
		updates = append(updates, "price_per_seat = $"+strconv.Itoa(argIndex))
		args = append(args, *req.PricePerSeat)
		argIndex++
	}
	if req.AvailableSeats != nil {
		updates = append(updates, "available_seats = $"+strconv.Itoa(argIndex))
		args = append(args, *req.AvailableSeats)
		argIndex++
	}
	if req.Status != nil {
		updates = append(updates, "status = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Status)
		argIndex++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id, userID)

	query := `UPDATE rides SET ` + updates[0]
	for i := 1; i < len(updates); i++ {
		query += `, ` + updates[i]
	}
	query += ` WHERE id = $` + strconv.Itoa(argIndex) + ` AND user_id = $` + strconv.Itoa(argIndex+1)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ride"})
		return
	}

	// Update status based on available seats
	if req.AvailableSeats != nil || req.Status == nil {
		h.DB.Exec(`
			UPDATE rides SET status = CASE
				WHEN available_seats = 0 THEN 'full'
				WHEN available_seats < total_seats THEN 'partially_filled'
				ELSE 'open'
			END
			WHERE id = $1
		`, id)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ride updated"})
}

// CancelRide cancels a ride
func (h *Handlers) CancelRide(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID, _ := c.Get("user_id")

	_, err = h.DB.Exec(
		`UPDATE rides SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
		 WHERE id = $1 AND user_id = $2`,
		id, userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel ride"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ride cancelled"})
}

