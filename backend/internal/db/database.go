package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

// Initialize creates a new database connection
func Initialize(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connection established")
	return db, nil
}

// RunMigrations runs database migrations
func RunMigrations(db *sql.DB) error {
	migrations := []string{
		createUsersTable,
		createCitiesTable,
		createCorridorsTable,
		createUserCorridorsTable,
		createVehiclesTable,
		createRidesTable,
		createRideRequestsTable,
		createMessagesTable,
		createPaymentsTable,
		createCarbonCreditsTable,
		createFeatureFlagsTable,
		insertInitialData,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	log.Println("Database migrations completed")
	return nil
}

