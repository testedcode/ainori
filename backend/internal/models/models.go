package models

import "time"

// User represents a user in the system
type User struct {
	ID            int       `json:"id"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	Phone         *string   `json:"phone"`
	City          *string   `json:"city"`
	Role          string    `json:"role"`
	CarbCredits   int       `json:"carbon_credits"`
	UPIID         *string   `json:"upi_id"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// City represents a city
type City struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Corridor represents a corridor
type Corridor struct {
	ID              int       `json:"id"`
	CityID          int       `json:"city_id"`
	CityName        string    `json:"city_name,omitempty"`
	Name            string    `json:"name"`
	LocationFrom    string    `json:"location_from"`
	LocationTo      string    `json:"location_to"`
	PickupPoints    *string   `json:"pickup_points"`
	TermsConditions *string   `json:"terms_conditions"`
	IsActive        bool      `json:"is_active"`
	MapEnabled      bool      `json:"map_enabled"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Vehicle represents a vehicle
type Vehicle struct {
	ID                    int       `json:"id"`
	UserID                int       `json:"user_id"`
	VehicleType           string    `json:"vehicle_type"`
	Make                  string    `json:"make"`
	Model                 string    `json:"model"`
	Color                 *string   `json:"color"`
	VehicleNumber         string    `json:"vehicle_number"`
	TotalSeats            int       `json:"total_seats"`
	DefaultAvailableSeats int       `json:"default_available_seats"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

// Ride represents a ride
type Ride struct {
	ID               int       `json:"id"`
	UserID           int       `json:"user_id"`
	UserName         string    `json:"user_name,omitempty"`
	CorridorID       int       `json:"corridor_id"`
	CorridorName     string    `json:"corridor_name,omitempty"`
	VehicleID        *int      `json:"vehicle_id"`
	VehicleInfo      *Vehicle  `json:"vehicle_info,omitempty"`
	RideDate         string    `json:"ride_date"`
	RideTime         string    `json:"ride_time"`
	PickupPoint      string    `json:"pickup_point"`
	DropPoint        string    `json:"drop_point"`
	RouteDescription *string   `json:"route_description"`
	PricePerSeat     float64   `json:"price_per_seat"`
	AvailableSeats   int       `json:"available_seats"`
	TotalSeats        int       `json:"total_seats"`
	Status            string    `json:"status"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// RideRequest represents a ride request
type RideRequest struct {
	ID             int       `json:"id"`
	RideID         int       `json:"ride_id"`
	UserID         int       `json:"user_id"`
	UserName       string    `json:"user_name,omitempty"`
	SeatsRequested int       `json:"seats_requested"`
	Comment        *string   `json:"comment"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// Message represents a chat message
type Message struct {
	ID        int       `json:"id"`
	RideID    int       `json:"ride_id"`
	UserID    int       `json:"user_id"`
	UserName  string    `json:"user_name,omitempty"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// Payment represents a payment
type Payment struct {
	ID           int       `json:"id"`
	RideID       int       `json:"ride_id"`
	RiderID      int       `json:"rider_id"`
	RiderName    string    `json:"rider_name,omitempty"`
	RideGiverID  int       `json:"ride_giver_id"`
	GiverName    string    `json:"giver_name,omitempty"`
	Amount       float64   `json:"amount"`
	RiderStatus  string    `json:"rider_status"`
	GiverStatus  string    `json:"giver_status"`
	AdminOverride bool     `json:"admin_override"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CarbonCredit represents carbon credits
type CarbonCredit struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	RideID    *int      `json:"ride_id"`
	Credits   int       `json:"credits"`
	Reason    *string   `json:"reason"`
	CreatedAt time.Time `json:"created_at"`
}

// FeatureFlag represents a feature flag
type FeatureFlag struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Enabled     bool      `json:"enabled"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

