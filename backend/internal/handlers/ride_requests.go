package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetRideRequests returns requests for a ride
func (h *Handlers) GetRideRequests(c *gin.Context) {
	rideID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	rows, err := h.DB.Query(
		`SELECT rr.id, rr.ride_id, rr.user_id, u.name as user_name, rr.seats_requested,
		       rr.comment, rr.status, rr.created_at, rr.updated_at
		 FROM ride_requests rr
		 JOIN users u ON rr.user_id = u.id
		 WHERE rr.ride_id = $1
		 ORDER BY rr.created_at DESC`,
		rideID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var requests []models.RideRequest
	for rows.Next() {
		var req models.RideRequest
		if err := rows.Scan(
			&req.ID, &req.RideID, &req.UserID, &req.UserName, &req.SeatsRequested,
			&req.Comment, &req.Status, &req.CreatedAt, &req.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		requests = append(requests, req)
	}

	c.JSON(http.StatusOK, requests)
}

// CreateRideRequest creates a ride request
func (h *Handlers) CreateRideRequest(c *gin.Context) {
	rideID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var req struct {
		SeatsRequested int    `json:"seats_requested" binding:"required,min=1"`
		Comment        string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if ride exists and has available seats
	var availableSeats int
	var rideUserID int
	err = h.DB.QueryRow(
		`SELECT available_seats, user_id FROM rides WHERE id = $1 AND status IN ('open', 'partially_filled')`,
		rideID,
	).Scan(&availableSeats, &rideUserID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found or not available"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if rideUserID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot request your own ride"})
		return
	}

	if req.SeatsRequested > availableSeats {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough available seats"})
		return
	}

	// Check if user already has a pending/accepted request
	var existingStatus string
	err = h.DB.QueryRow(
		`SELECT status FROM ride_requests WHERE ride_id = $1 AND user_id = $2`,
		rideID, userID,
	).Scan(&existingStatus)

	if err == nil {
		if existingStatus == "pending" || existingStatus == "accepted" {
			c.JSON(http.StatusConflict, gin.H{"error": "You already have a request for this ride"})
			return
		}
	}

	var comment *string
	if req.Comment != "" {
		comment = &req.Comment
	}

	var requestID int
	err = h.DB.QueryRow(
		`INSERT INTO ride_requests (ride_id, user_id, seats_requested, comment, status)
		 VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
		rideID, userID, req.SeatsRequested, comment,
	).Scan(&requestID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": requestID, "message": "Ride request created"})
}

// UpdateRideRequest updates a ride request (accept/reject)
func (h *Handlers) UpdateRideRequest(c *gin.Context) {
	rideID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	requestID, err := strconv.Atoi(c.Param("requestId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var req struct {
		Status string `json:"status" binding:"required,oneof=accepted rejected"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify user owns the ride
	var rideUserID int
	err = h.DB.QueryRow(`SELECT user_id FROM rides WHERE id = $1`, rideID).Scan(&rideUserID)
	if err != nil || rideUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't own this ride"})
		return
	}

	// Get request details
	var seatsRequested int
	var currentStatus string
	err = h.DB.QueryRow(
		`SELECT seats_requested, status FROM ride_requests WHERE id = $1 AND ride_id = $2`,
		requestID, rideID,
	).Scan(&seatsRequested, &currentStatus)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Update request status
	_, err = h.DB.Exec(
		`UPDATE ride_requests SET status = $1, updated_at = CURRENT_TIMESTAMP 
		 WHERE id = $2`,
		req.Status, requestID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request"})
		return
	}

	// Update ride available seats if accepted
	if req.Status == "accepted" && currentStatus != "accepted" {
		_, err = h.DB.Exec(
			`UPDATE rides SET available_seats = available_seats - $1, updated_at = CURRENT_TIMESTAMP
			 WHERE id = $2`,
			seatsRequested, rideID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ride seats"})
			return
		}

		// Update ride status
		h.DB.Exec(`
			UPDATE rides SET status = CASE
				WHEN available_seats = 0 THEN 'full'
				ELSE 'partially_filled'
			END
			WHERE id = $1
		`, rideID)

		// Create payment record
		var pricePerSeat float64
		h.DB.QueryRow(`SELECT price_per_seat FROM rides WHERE id = $1`, rideID).Scan(&pricePerSeat)
		totalAmount := pricePerSeat * float64(seatsRequested)

		var riderID int
		h.DB.QueryRow(`SELECT user_id FROM ride_requests WHERE id = $1`, requestID).Scan(&riderID)

		h.DB.Exec(
			`INSERT INTO payments (ride_id, rider_id, ride_giver_id, amount, rider_status, giver_status)
			 VALUES ($1, $2, $3, $4, 'pending', 'pending')
			 ON CONFLICT (ride_id, rider_id) DO NOTHING`,
			rideID, riderID, userID, totalAmount,
		)
	} else if req.Status == "rejected" && currentStatus == "accepted" {
		// If rejecting an accepted request, restore seats
		_, err = h.DB.Exec(
			`UPDATE rides SET available_seats = available_seats + $1, updated_at = CURRENT_TIMESTAMP
			 WHERE id = $2`,
			seatsRequested, rideID,
		)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request updated"})
}

