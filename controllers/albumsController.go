package controllers

import (
	"net/http"

	"example/web-service-gin/initializers"
	"example/web-service-gin/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetAlbums responds with the list of all albums as JSON.
func GetAlbums(c *gin.Context) {
	var albums []models.Album
	if err := initializers.DB.Preload("User").Preload("Tags").Find(&albums).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, albums)
}

// GetAlbumByID locates the album whose ID value matches the id
// parameter sent by the client, then returns that album as a response.
func GetAlbumByID(c *gin.Context) {
	id := c.Param("id")

	var album models.Album
	if err := initializers.DB.Preload("User").Preload("Tags").First(&album, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album not found"})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, album)
}

// PostAlbums adds an album from JSON received in the request body.
func PostAlbums(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var albumInput struct {
		Title  string  `json:"title"`
		Artist string  `json:"artist"`
		Price  float64 `json:"price"`
		TagIDs []uint  `json:"tag_ids"`
	}

	if err := c.BindJSON(&albumInput); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDUint := userID.(uint)
	newAlbum := models.Album{
		Title:  albumInput.Title,
		Artist: albumInput.Artist,
		Price:  albumInput.Price,
		UserID: &userIDUint,
	}

	// Associate tags if provided
	if len(albumInput.TagIDs) > 0 {
		var tags []models.Tag
		if err := initializers.DB.Where("id IN ?", albumInput.TagIDs).Find(&tags).Error; err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Error retrieving tags"})
			return
		}
		newAlbum.Tags = tags
	}

	if err := initializers.DB.Create(&newAlbum).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Reload with relations for the response
	initializers.DB.Preload("User").Preload("Tags").First(&newAlbum, newAlbum.ID)

	c.IndentedJSON(http.StatusCreated, newAlbum)
}
