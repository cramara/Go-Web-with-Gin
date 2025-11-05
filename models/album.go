package models

// Album represents data about a record album.
type Album struct {
	ID     uint    `gorm:"primaryKey" json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

