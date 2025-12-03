package initializers

import (
	"log"

	"example/web-service-gin/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("albums.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Unable to connect to database")
	}

	log.Println("Database connection successful")
}

func SyncDatabase() {
	err := DB.AutoMigrate(&models.Album{}, &models.User{}, &models.Tag{}, &models.Song{})
	if err != nil {
		log.Fatal("Error during database migration")
	}

	// Create a default user if it doesn't exist
	var defaultUser models.User
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)

	if userCount == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal("Error hashing default password")
		}

		defaultUser = models.User{
			Email:    "admin@example.com",
			Password: string(hashedPassword),
			Name:     "Administrator",
		}

		if err := DB.Create(&defaultUser).Error; err != nil {
			log.Fatal("Error creating default user")
		}
		log.Println("Default user created: admin@example.com / admin123")
	} else {
		// Retrieve the first user as default user
		if err := DB.First(&defaultUser).Error; err != nil {
			log.Fatal("Error retrieving default user")
		}
	}

	// Update existing albums without UserID to associate them with the default user
	userID := defaultUser.ID
	DB.Model(&models.Album{}).Where("user_id IS NULL").Update("user_id", userID)

	// Create seed albums if they don't exist
	var count int64
	DB.Model(&models.Album{}).Count(&count)
	if count == 0 {
		seedAlbums := []models.Album{
			{Title: "Blue Train", Artist: "John Coltrane", Price: 56.99, UserID: &userID},
			{Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99, UserID: &userID},
			{Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99, UserID: &userID},
		}
		if err := DB.Create(&seedAlbums).Error; err != nil {
			log.Fatal("Error creating seed data")
		}
		log.Println("Seed data initialized with default user")
	}
}
