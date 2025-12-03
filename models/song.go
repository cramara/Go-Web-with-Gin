package models

// Song represents a music track in an album
type Song struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	Title        string `json:"title"`
	YoutubeURL   string `json:"youtube_url"`
	ThumbnailURL string `json:"thumbnail_url"`
	ViewCount    int64  `json:"view_count"`

	// One-to-many relation: An album can have multiple songs
	AlbumID uint  `json:"album_id"`
	Album   Album `gorm:"foreignKey:AlbumID" json:"album,omitempty"`
}
