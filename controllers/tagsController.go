package controllers

import (
	"net/http"

	"example/web-service-gin/initializers"
	"example/web-service-gin/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetTags récupère tous les tags disponibles
func GetTags(c *gin.Context) {
	var tags []models.Tag
	if err := initializers.DB.Find(&tags).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, tags)
}

// CreateTag crée un nouveau tag
func CreateTag(c *gin.Context) {
	var tagInput struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.BindJSON(&tagInput); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Vérifier si le tag existe déjà
	var existingTag models.Tag
	if err := initializers.DB.Where("name = ?", tagInput.Name).First(&existingTag).Error; err == nil {
		c.IndentedJSON(http.StatusConflict, gin.H{"error": "Ce tag existe déjà"})
		return
	} else if err != gorm.ErrRecordNotFound {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	newTag := models.Tag{
		Name: tagInput.Name,
	}

	if err := initializers.DB.Create(&newTag).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, newTag)
}

