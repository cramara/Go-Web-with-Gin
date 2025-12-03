package main

import (
	"example/web-service-gin/controllers"
	"example/web-service-gin/initializers"
	"example/web-service-gin/middleware"

	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectDB()
	initializers.SyncDatabase()
}

func main() {
	router := gin.Default()

	// CORS configuration to allow requests from the frontend
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Public routes
	router.POST("/register", controllers.Register)
	router.POST("/login", controllers.Login)

	// Routes protected by authentication
	protected := router.Group("/")
	protected.Use(middleware.RequireAuth())
	{
		protected.GET("/albums", controllers.GetAlbums)
		protected.GET("/albums/:id", controllers.GetAlbumByID)
		protected.POST("/albums", controllers.PostAlbums)
		protected.GET("/profile", controllers.GetProfile)

		// Tag routes
		protected.GET("/tags", controllers.GetTags)
		protected.POST("/tags", controllers.CreateTag)

		// Song routes
		protected.POST("/albums/:id/songs", controllers.AddSongToAlbum)
		protected.GET("/albums/:id/songs", controllers.GetSongsByAlbum)
		protected.DELETE("/albums/:id/songs/:songId", controllers.DeleteSong)
	}

	router.Run("localhost:8082")
}
