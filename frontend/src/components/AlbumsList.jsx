import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { albumsAPI } from '../services/api'

const AlbumsList = () => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const data = await albumsAPI.getAll()
      setAlbums(data)
      setError('')
    } catch (err) {
      setError('Erreur lors du chargement des albums')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement des albums...</div>
  }

  if (error) {
    return <div className="error" style={{ textAlign: 'center', padding: '20px' }}>{error}</div>
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Liste des Albums</h2>
        <Link to="/albums/new" className="btn btn-primary">
          Nouvel Album
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>
            Aucun album disponible. Créez votre premier album !
          </p>
        </div>
      ) : (
        <div className="grid">
          {albums.map((album) => (
            <div key={album.id} className="album-card">
              <h3>{album.title}</h3>
              <p><strong>Artiste:</strong> {album.artist}</p>
              <p><strong>Prix:</strong> {album.price.toFixed(2)} €</p>
              
              {album.user && (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  Créé par: {album.user.name || album.user.email}
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
                Voir les détails
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlbumsList

