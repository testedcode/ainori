package handlers

import (
	"net/http"
	"strconv"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// GetMessages returns messages for a ride
func (h *Handlers) GetMessages(c *gin.Context) {
	rideID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	// Get last message ID for polling (optional query param)
	lastID := c.Query("last_id")

	query := `
		SELECT m.id, m.ride_id, m.user_id, u.name as user_name, m.message, m.created_at
		FROM messages m
		JOIN users u ON m.user_id = u.id
		WHERE m.ride_id = $1
	`

	args := []interface{}{rideID}
	if lastID != "" {
		query += ` AND m.id > $2`
		args = append(args, lastID)
	}

	query += ` ORDER BY m.created_at ASC`

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var msg models.Message
		if err := rows.Scan(
			&msg.ID, &msg.RideID, &msg.UserID, &msg.UserName, &msg.Message, &msg.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		messages = append(messages, msg)
	}

	c.JSON(http.StatusOK, messages)
}

// CreateMessage creates a new message
func (h *Handlers) CreateMessage(c *gin.Context) {
	rideID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var req struct {
		Message string `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify user is part of the ride (either giver or requester)
	var isParticipant bool
	err = h.DB.QueryRow(
		`SELECT EXISTS(
			SELECT 1 FROM rides WHERE id = $1 AND user_id = $2
			UNION
			SELECT 1 FROM ride_requests WHERE ride_id = $1 AND user_id = $2 AND status = 'accepted'
		)`,
		rideID, userID,
	).Scan(&isParticipant)

	if err != nil || !isParticipant {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not part of this ride"})
		return
	}

	var messageID int
	err = h.DB.QueryRow(
		`INSERT INTO messages (ride_id, user_id, message) VALUES ($1, $2, $3) RETURNING id`,
		rideID, userID, req.Message,
	).Scan(&messageID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create message"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": messageID, "message": "Message sent"})
}

