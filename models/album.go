package models

// Album represents data about a record album.
type Album struct {
	ID     uint    `gorm:"primaryKey" json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
	
	// Relation one-to-many: Un utilisateur peut avoir plusieurs albums
	UserID *uint  `json:"user_id,omitempty"`
	User   User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	
	// Relation many-to-many: Un album peut avoir plusieurs tags
	Tags []Tag `gorm:"many2many:album_tags;" json:"tags,omitempty"`
}

