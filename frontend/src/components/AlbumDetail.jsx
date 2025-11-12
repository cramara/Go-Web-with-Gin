import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { albumsAPI } from '../services/api'

const AlbumDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAlbum()
  }, [id])

  const loadAlbum = async () => {
    try {
      setLoading(true)
      const data = await albumsAPI.getById(id)
      setAlbum(data)
      setError('')
    } catch (err) {
      setError('Erreur lors du chargement de l\'album')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  if (error || !album) {
    return (
      <div className="container">
        <div className="card">
          <div className="error">{error || 'Album non trouvé'}</div>
          <Link to="/albums" className="btn btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <Link to="/albums" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block', textDecoration: 'none' }}>
        ← Retour à la liste
      </Link>

      <div className="card">
        <h2>{album.title}</h2>
        
        <div style={{ marginTop: '20px' }}>
          <p><strong>Artiste:</strong> {album.artist}</p>
          <p><strong>Prix:</strong> {album.price.toFixed(2)} €</p>
          
          {album.user && (
            <p><strong>Créé par:</strong> {album.user.name || album.user.email}</p>
          )}

          {album.tags && album.tags.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <strong>Tags:</strong>
              <div className="tags" style={{ marginTop: '10px' }}>
                {album.tags.map((tag) => (
                  <span key={tag.id} className="tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlbumDetail

