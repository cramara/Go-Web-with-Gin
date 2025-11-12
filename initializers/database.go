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
		log.Fatal("Impossible de se connecter à la base de données")
	}

	log.Println("Connexion à la base de données réussie")
}

func SyncDatabase() {
	err := DB.AutoMigrate(&models.Album{}, &models.User{}, &models.Tag{})
	if err != nil {
		log.Fatal("Erreur lors de la migration de la base de données")
	}

	// Créer un utilisateur par défaut s'il n'existe pas
	var defaultUser models.User
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)

	if userCount == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal("Erreur lors du hashage du mot de passe par défaut")
		}

		defaultUser = models.User{
			Email:    "admin@example.com",
			Password: string(hashedPassword),
			Name:     "Administrateur",
		}

		if err := DB.Create(&defaultUser).Error; err != nil {
			log.Fatal("Erreur lors de la création de l'utilisateur par défaut")
		}
		log.Println("Utilisateur par défaut créé: admin@example.com / admin123")
	} else {
		// Récupérer le premier utilisateur comme utilisateur par défaut
		if err := DB.First(&defaultUser).Error; err != nil {
			log.Fatal("Erreur lors de la récupération de l'utilisateur par défaut")
		}
	}

	// Mettre à jour les albums existants sans UserID pour les associer à l'utilisateur par défaut
	userID := defaultUser.ID
	DB.Model(&models.Album{}).Where("user_id IS NULL").Update("user_id", userID)

	// Créer les albums de seed s'ils n'existent pas
	var count int64
	DB.Model(&models.Album{}).Count(&count)
	if count == 0 {
		seedAlbums := []models.Album{
			{Title: "Blue Train", Artist: "John Coltrane", Price: 56.99, UserID: &userID},
			{Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99, UserID: &userID},
			{Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99, UserID: &userID},
		}
		if err := DB.Create(&seedAlbums).Error; err != nil {
			log.Fatal("Erreur lors de la création des données de seed")
		}
		log.Println("Données de seed initialisées avec l'utilisateur par défaut")
	}
}
