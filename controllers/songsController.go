package controllers

import (
	"net/http"

	"example/web-service-gin/initializers"
	"example/web-service-gin/models"
	"example/web-service-gin/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AddSongToAlbum adds a song to an album from JSON received in the request body
func AddSongToAlbum(c *gin.Context) {
	albumID := c.Param("id")

	// Verify that the album exists
	var album models.Album
	if err := initializers.DB.First(&album, albumID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "album non trouvé"})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var songInput struct {
		YoutubeURL string `json:"youtube_url"`
		Title      string `json:"title,omitempty"`
	}

	if err := c.BindJSON(&songInput); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate YouTube URL
	if songInput.YoutubeURL == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "URL YouTube requise"})
		return
	}

	// Extract video ID to validate URL format
	_, err := utils.ExtractVideoID(songInput.YoutubeURL)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "URL YouTube invalide"})
		return
	}

	// Get video information from YouTube
	videoInfo, err := utils.GetVideoInfoFromURL(songInput.YoutubeURL)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Impossible de récupérer les informations depuis YouTube: " + err.Error()})
		return
	}

	// Use provided title or fetched title
	title := songInput.Title
	if title == "" {
		title = videoInfo.Title
	}

	// Create the song
	newSong := models.Song{
		Title:        title,
		YoutubeURL:   songInput.YoutubeURL,
		ThumbnailURL: videoInfo.ThumbnailURL,
		ViewCount:    videoInfo.ViewCount,
		AlbumID:      album.ID,
	}

	if err := initializers.DB.Create(&newSong).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, newSong)
}

// GetSongsByAlbum gets all songs for a specific album
func GetSongsByAlbum(c *gin.Context) {
	albumID := c.Param("id")

	// Verify that the album exists
	var album models.Album
	if err := initializers.DB.First(&album, albumID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "album non trouvé"})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var songs []models.Song
	if err := initializers.DB.Where("album_id = ?", albumID).Find(&songs).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, songs)
}

// DeleteSong deletes a song by ID
func DeleteSong(c *gin.Context) {
	songID := c.Param("songId")

	var song models.Song
	if err := initializers.DB.First(&song, songID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "musique non trouvée"})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := initializers.DB.Delete(&song).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "musique supprimée avec succès"})
}
