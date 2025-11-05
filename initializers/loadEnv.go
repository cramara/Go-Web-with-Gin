package initializers

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnvVariables() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Aucun fichier .env trouvé, utilisation des valeurs par défaut")
	}
}

