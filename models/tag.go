package models

import "gorm.io/gorm"

// Tag represents a tag/category that can be associated with albums
type Tag struct {
	gorm.Model
	Name   string  `gorm:"uniqueIndex;not null" json:"name"`
	
	// Many-to-many relation: A tag can be associated with multiple albums
	Albums []Album `gorm:"many2many:album_tags;" json:"albums,omitempty"`
}

