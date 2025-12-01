import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { albumsAPI, tagsAPI } from '../services/api'

const CreateAlbum = () => {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [price, setPrice] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [tags, setTags] = useState([])
  const [newTagName, setNewTagName] = useState('')
  const [showNewTagInput, setShowNewTagInput] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingTags, setLoadingTags] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoadingTags(true)
      const data = await tagsAPI.getAll()
      setTags(data)
    } catch (err) {
      console.error('Error loading tags:', err)
    } finally {
      setLoadingTags(false)
    }
  }

  const handleTagToggle = (tagId) => {
    const tagIdNum = typeof tagId === 'number' ? tagId : parseInt(tagId, 10)
    
    if (isNaN(tagIdNum)) {
      console.error('Invalid tag ID:', tagId)
      return
    }
    
    setSelectedTags(prev => {
      const isSelected = prev.some(id => Number(id) === Number(tagIdNum))
      
      if (isSelected) {
        return prev.filter(id => Number(id) !== Number(tagIdNum))
      } else {
        return [...prev, tagIdNum]
      }
    })
  }

  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) {
      setError('Tag name cannot be empty')
      return
    }

    try {
      const newTag = await tagsAPI.create(newTagName.trim())
      const newTagId = typeof newTag.id === 'number' ? newTag.id : parseInt(newTag.id, 10)
      setTags([...tags, newTag])
      setSelectedTags([...selectedTags, newTagId])
      setNewTagName('')
      setShowNewTagInput(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating tag')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a positive number')
      return
    }

    setLoading(true)

    try {
      const albumData = {
        title,
        artist,
        price: priceNum,
      }

      if (selectedTags.length > 0) {
        albumData.tag_ids = selectedTags
      }

      await albumsAPI.create(albumData)
      setSuccess('Album created successfully!')
      setTimeout(() => {
        navigate('/albums')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating album')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '20px auto' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Create a new album</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Album title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="artist">Artist *</label>
              <input
                type="text"
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                placeholder="Artist name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (€) *</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              {loadingTags ? (
                <div style={{ padding: '10px', color: '#666' }}>Loading tags...</div>
              ) : (
                <>
                  <div style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '5px', 
                    padding: '15px', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    backgroundColor: '#f9f9f9'
                  }}>
                    {tags.length === 0 ? (
                      <div style={{ color: '#666', fontStyle: 'italic' }}>
                        No tags available
                      </div>
                    ) : (
                      tags.map((tag) => {
                        const tagId = tag.ID || tag.id
                        return (
                          <div
                            key={tagId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px',
                              cursor: 'pointer',
                              borderRadius: '3px',
                              marginBottom: '5px',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <input
                              type="checkbox"
                              id={`tag-${tagId}`}
                              checked={selectedTags.some(id => Number(id) === Number(tagId))}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleTagToggle(tagId)
                              }}
                              style={{
                                marginRight: '10px',
                                cursor: 'pointer',
                                width: '18px',
                                height: '18px'
                              }}
                            />
                            <label
                              htmlFor={`tag-${tagId}`}
                              style={{
                                cursor: 'pointer',
                                flex: 1,
                                margin: 0
                              }}
                            >
                              {tag.name}
                            </label>
                          </div>
                        )
                      })
                    )}
                  </div>
                  
                  {!showNewTagInput ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ marginTop: '10px' }}
                      onClick={() => setShowNewTagInput(true)}
                    >
                      + Create a new tag
                    </button>
                  ) : (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="New tag name"
                        style={{ flex: 1 }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateTag(e)
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleCreateTag}
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowNewTagInput(false)
                          setNewTagName('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create album'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/albums')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAlbum

