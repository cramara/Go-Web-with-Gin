package models

// Album represents data about a record album.
type Album struct {
	ID     uint    `gorm:"primaryKey" json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`

	// One-to-many relation: A user can have multiple albums
	UserID *uint `json:"user_id,omitempty"`
	User   User  `gorm:"foreignKey:UserID" json:"user,omitempty"`

	// Many-to-many relation: An album can have multiple tags
	Tags []Tag `gorm:"many2many:album_tags;" json:"tags,omitempty"`

	// One-to-many relation: An album can have multiple songs
	Songs []Song `gorm:"foreignKey:AlbumID" json:"songs,omitempty"`
}
