package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"cpool.ai/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Register handles user registration
func (h *Handlers) Register(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Name     string `json:"name" binding:"required"`
		Phone    string `json:"phone"`
		City     string `json:"city"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Insert user
	var userID int
	var phone, city *string
	if req.Phone != "" {
		phone = &req.Phone
	}
	if req.City != "" {
		city = &req.City
	}

	err = h.DB.QueryRow(
		`INSERT INTO users (email, password_hash, name, phone, city, role) 
		 VALUES ($1, $2, $3, $4, $5, 'user') RETURNING id`,
		req.Email, hashedPassword, req.Name, phone, city,
	).Scan(&userID)

	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	// Generate token
	token, err := h.generateToken(userID, req.Email, "user")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user": gin.H{
			"id":    userID,
			"email": req.Email,
			"name":  req.Name,
			"role":  "user",
		},
	})
}

// Login handles user login
func (h *Handlers) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user
	var user models.User
	var passwordHash string
	err := h.DB.QueryRow(
		`SELECT id, email, password_hash, name, phone, city, role, carbon_credits, upi_id 
		 FROM users WHERE email = $1`,
		req.Email,
	).Scan(
		&user.ID, &user.Email, &passwordHash, &user.Name,
		&user.Phone, &user.City, &user.Role, &user.CarbCredits, &user.UPIID,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate token
	token, err := h.generateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}

// GetProfile returns current user profile
func (h *Handlers) GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	err := h.DB.QueryRow(
		`SELECT id, email, name, phone, city, role, carbon_credits, upi_id, created_at, updated_at 
		 FROM users WHERE id = $1`,
		userID,
	).Scan(
		&user.ID, &user.Email, &user.Name, &user.Phone, &user.City,
		&user.Role, &user.CarbCredits, &user.UPIID, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// generateToken creates a JWT token
func (h *Handlers) generateToken(userID int, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.Config.JWTSecret))
}

