import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { albumsAPI } from '../services/api'

const AllAlbumsList = () => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const data = await albumsAPI.getAllAlbums()
      setAlbums(data)
      setError('')
    } catch (err) {
      setError('Error loading albums')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading albums...</div>
  }

  if (error) {
    return <div className="error" style={{ textAlign: 'center', padding: '20px' }}>{error}</div>
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>All Albums</h2>
        <Link to="/albums/new" className="btn btn-primary">
          New Album
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>
            No albums available. Create your first album!
          </p>
        </div>
      ) : (
        <div className="grid">
          {albums.map((album) => (
            <div key={album.id} className="album-card">
              <h3>{album.title}</h3>
              <p><strong>Artist:</strong> {album.artist}</p>
              <p><strong>Price:</strong> {album.price.toFixed(2)} €</p>
              
              {album.user && (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  Created by: {album.user.name || album.user.email}
                </p>
              )}

              {album.tags && album.tags.length > 0 && (
                <div className="tags">
                  {album.tags.map((tag) => (
                    <span key={tag.id} className="tag">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <Link
                to={`/albums/${album.id}`}
                className="btn btn-secondary"
                style={{ marginTop: '15px', display: 'inline-block', textDecoration: 'none' }}
              >
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllAlbumsList

