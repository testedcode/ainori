package handlers

import (
	"net/http"
	"strconv"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetPayments returns payments for a ride
func (h *Handlers) GetPayments(c *gin.Context) {
	rideID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	rows, err := h.DB.Query(
		`SELECT p.id, p.ride_id, p.rider_id, u1.name as rider_name, p.ride_giver_id,
		       u2.name as giver_name, p.amount, p.rider_status, p.giver_status,
		       p.admin_override, p.created_at, p.updated_at
		 FROM payments p
		 JOIN users u1 ON p.rider_id = u1.id
		 JOIN users u2 ON p.ride_giver_id = u2.id
		 WHERE p.ride_id = $1
		 ORDER BY p.created_at DESC`,
		rideID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var payments []models.Payment
	for rows.Next() {
		var payment models.Payment
		if err := rows.Scan(
			&payment.ID, &payment.RideID, &payment.RiderID, &payment.RiderName,
			&payment.RideGiverID, &payment.GiverName, &payment.Amount,
			&payment.RiderStatus, &payment.GiverStatus, &payment.AdminOverride,
			&payment.CreatedAt, &payment.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		payments = append(payments, payment)
	}

	c.JSON(http.StatusOK, payments)
}

// CreatePayment creates a payment record (usually done automatically on request acceptance)
func (h *Handlers) CreatePayment(c *gin.Context) {
	rideID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	var req struct {
		RiderID int     `json:"rider_id" binding:"required"`
		Amount  float64 `json:"amount" binding:"required,min=0"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	// Verify user owns the ride
	var rideUserID int
	err = h.DB.QueryRow(`SELECT user_id FROM rides WHERE id = $1`, rideID).Scan(&rideUserID)
	if err != nil || rideUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't own this ride"})
		return
	}

	_, err = h.DB.Exec(
		`INSERT INTO payments (ride_id, rider_id, ride_giver_id, amount, rider_status, giver_status)
		 VALUES ($1, $2, $3, $4, 'pending', 'pending')
		 ON CONFLICT (ride_id, rider_id) DO NOTHING`,
		rideID, req.RiderID, userID, req.Amount,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Payment record created"})
}

// UpdatePaymentStatus updates payment status
func (h *Handlers) UpdatePaymentStatus(c *gin.Context) {
	rideID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userIDParam, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	currentUserID, _ := c.Get("user_id")
	currentUserRole, _ := c.Get("user_role")

	var req struct {
		RiderStatus *string `json:"rider_status"`
		GiverStatus *string `json:"giver_status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get payment record
	var riderID, giverID int
	err = h.DB.QueryRow(
		`SELECT rider_id, ride_giver_id FROM payments WHERE ride_id = $1 AND rider_id = $2`,
		rideID, userIDParam,
	).Scan(&riderID, &giverID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	// Check permissions
	isRider := riderID == currentUserID
	isGiver := giverID == currentUserID
	isAdmin := currentUserRole == "admin"

	if !isRider && !isGiver && !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have permission to update this payment"})
		return
	}

	// Update status based on who is making the request
	updates := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.RiderStatus != nil && (isRider || isAdmin) {
		updates = append(updates, "rider_status = $"+strconv.Itoa(argIndex))
		args = append(args, *req.RiderStatus)
		argIndex++
	}

	if req.GiverStatus != nil && (isGiver || isAdmin) {
		updates = append(updates, "giver_status = $"+strconv.Itoa(argIndex))
		args = append(args, *req.GiverStatus)
		argIndex++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No status to update"})
		return
	}

	if isAdmin {
		updates = append(updates, "admin_override = true")
	}

	updates = append(updates, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, rideID, userIDParam)

	query := `UPDATE payments SET ` + updates[0]
	for i := 1; i < len(updates); i++ {
		query += `, ` + updates[i]
	}
	query += ` WHERE ride_id = $` + strconv.Itoa(argIndex) + ` AND rider_id = $` + strconv.Itoa(argIndex+1)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment status updated"})
}

