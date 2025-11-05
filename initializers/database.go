package initializers

import (
	"log"

	"example/web-service-gin/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("albums.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Impossible de se connecter à la base de données")
	}

	log.Println("Connexion à la base de données réussie")
}

func SyncDatabase() {
	err := DB.AutoMigrate(&models.Album{})
	if err != nil {
		log.Fatal("Erreur lors de la migration de la base de données")
	}

	var count int64
	DB.Model(&models.Album{}).Count(&count)
	if count == 0 {
		seedAlbums := []models.Album{
			{Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
			{Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
			{Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
		}
		DB.Create(&seedAlbums)
		log.Println("Données de seed initialisées")
	}
}

