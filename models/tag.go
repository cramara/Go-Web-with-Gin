package models

import "gorm.io/gorm"

// Tag represents a tag/category that can be associated with albums
type Tag struct {
	gorm.Model
	Name   string  `gorm:"uniqueIndex;not null" json:"name"`
	
	// Relation many-to-many: Un tag peut être associé à plusieurs albums
	Albums []Album `gorm:"many2many:album_tags;" json:"albums,omitempty"`
}

