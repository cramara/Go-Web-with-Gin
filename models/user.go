package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Password string `gorm:"not null" json:"-"`
	Name     string `json:"name"`
	
	// Relation one-to-many: Un utilisateur peut avoir plusieurs albums
	Albums []Album `gorm:"foreignKey:UserID" json:"albums,omitempty"`
}
