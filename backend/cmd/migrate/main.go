package main

import (
	"cpool.ai/backend/internal/config"
	"cpool.ai/backend/internal/db"
	"log"
	"os"
)

func main() {
	cfg := config.Load()

	database, err := db.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	if err := db.RunMigrations(database); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	log.Println("Migrations completed successfully!")
	os.Exit(0)
}

