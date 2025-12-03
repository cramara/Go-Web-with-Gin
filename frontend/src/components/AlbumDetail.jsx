import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { albumsAPI, songsAPI } from '../services/api'
import YouTubePlayer from './YouTubePlayer'

const AlbumDetail = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [songError, setSongError] = useState('')
  const [showAddSong, setShowAddSong] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [songTitle, setSongTitle] = useState('')
  const [addingSong, setAddingSong] = useState(false)
  const [playingVideoId, setPlayingVideoId] = useState(null)

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
      setError('Error loading album')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSong = async (e) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) {
      setSongError('Veuillez entrer une URL YouTube')
      return
    }

    try {
      setAddingSong(true)
      setSongError('')
      await songsAPI.addToAlbum(id, youtubeUrl.trim(), songTitle.trim() || undefined)
      setYoutubeUrl('')
      setSongTitle('')
      setShowAddSong(false)
      await loadAlbum()
    } catch (err) {
      setSongError(err.response?.data?.error || 'Erreur lors de l\'ajout de la musique')
      console.error(err)
    } finally {
      setAddingSong(false)
    }
  }

  const handleDeleteSong = async (songId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette musique ?')) {
      return
    }

    try {
      await songsAPI.delete(id, songId)
      await loadAlbum()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression de la musique')
      console.error(err)
    }
  }

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const handlePlaySong = (youtubeUrl) => {
    const videoId = extractVideoId(youtubeUrl)
    if (videoId) {
      setPlayingVideoId(videoId)
    } else {
      setError('Impossible d\'extraire l\'ID de la vidéo YouTube')
    }
  }

  const handleClosePlayer = () => {
    setPlayingVideoId(null)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error || !album) {
    return (
      <div className="container">
        <div className="card">
          <div className="error">{error || 'Album not found'}</div>
          <Link to="/albums" className="btn btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Back to list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <Link to="/albums" className="btn btn-secondary" style={{ marginBottom: '20px', display: 'inline-block', textDecoration: 'none' }}>
        ← Back to list
      </Link>

      <div className="card">
        <h2>{album.title}</h2>
        
        <div style={{ marginTop: '20px' }}>
          <p><strong>Artist:</strong> {album.artist}</p>
          <p><strong>Price:</strong> {album.price.toFixed(2)} €</p>
          
          {album.user && (
            <p><strong>Created by:</strong> {album.user.name || album.user.email}</p>
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

        <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Musiques</h3>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddSong(!showAddSong)}
              style={{ padding: '8px 16px' }}
            >
              {showAddSong ? 'Annuler' : '+ Ajouter une musique'}
            </button>
          </div>

          {showAddSong && (
            <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
              <form onSubmit={handleAddSong}>
                {songError && (
                  <div className="error" style={{ marginBottom: '15px', color: '#dc3545' }}>
                    {songError}
                  </div>
                )}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    URL YouTube *
                  </label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value)
                      setSongError('')
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    required
                  />
                  <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    Le titre sera récupéré automatiquement depuis YouTube
                  </small>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Titre (optionnel)
                  </label>
                  <input
                    type="text"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Laissez vide pour utiliser le titre YouTube"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={addingSong}
                  style={{ marginRight: '10px' }}
                >
                  {addingSong ? 'Ajout en cours...' : 'Ajouter'}
                </button>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddSong(false)
                    setYoutubeUrl('')
                    setSongTitle('')
                    setSongError('')
                  }}
                >
                  Annuler
                </button>
              </form>
            </div>
          )}

          {album.songs && album.songs.length > 0 ? (
            <div>
              {album.songs.map((song) => (
                <div 
                  key={song.id} 
                  className="card" 
                  style={{ 
                    marginBottom: '15px', 
                    padding: '15px',
                    display: 'flex',
                    gap: '15px'
                  }}
                >
                  {song.thumbnail_url && (
                    <div style={{ flexShrink: 0 }}>
                      <img 
                        src={song.thumbnail_url} 
                        alt={song.title}
                        style={{
                          width: '120px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(song.youtube_url, '_blank')}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{song.title}</h4>
                    <div style={{ marginBottom: '8px' }}>
                      <a 
                        href={song.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}
                      >
                        {song.youtube_url}
                      </a>
                    </div>
                    {song.view_count !== undefined && song.view_count > 0 && (
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        <strong>{song.view_count.toLocaleString()}</strong> vues
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePlaySong(song.youtube_url)}
                      style={{ padding: '6px 12px' }}
                    >
                      ▶ Lire
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteSong(song.id)}
                      style={{ padding: '6px 12px' }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>Aucune musique dans cet album</p>
          )}
        </div>
      </div>

      {playingVideoId && (
        <YouTubePlayer
          videoId={playingVideoId}
          onClose={handleClosePlayer}
          autoplay={true}
        />
      )}
    </div>
  )
}

export default AlbumDetail

