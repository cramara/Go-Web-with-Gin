import React, { useEffect, useRef } from 'react'

const YouTubePlayer = ({ videoId, onClose, autoplay = false }) => {
  const playerRef = useRef(null)
  const playerIdRef = useRef(`youtube-player-${Date.now()}-${Math.random()}`)

  useEffect(() => {
    if (!videoId) return

    let isMounted = true
    let currentPlayer = null

    const initializePlayer = () => {
      if (!videoId || !window.YT || !window.YT.Player || !playerRef.current) return

      try {
        if (currentPlayer) {
          try {
            currentPlayer.destroy()
          } catch (e) {
            console.error('Erreur lors de la destruction de l\'ancien lecteur:', e)
          }
        }

        currentPlayer = new window.YT.Player(playerRef.current, {
          height: '200',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
          },
          events: {
            onError: (event) => {
              console.error('Erreur YouTube Player:', event.data)
            },
          },
        })
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du lecteur:', error)
      }
    }

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        setTimeout(initializePlayer, 100)
        return
      }

      if (!window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = () => {
          if (isMounted) {
            setTimeout(initializePlayer, 100)
          }
        }

        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      } else {
        const originalCallback = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
          if (originalCallback) originalCallback()
          if (isMounted) {
            setTimeout(initializePlayer, 100)
          }
        }
        setTimeout(initializePlayer, 100)
      }
    }

    loadYouTubeAPI()

    return () => {
      isMounted = false
      if (currentPlayer) {
        try {
          currentPlayer.destroy()
        } catch (e) {
          console.error('Erreur lors de la destruction du lecteur:', e)
        }
      }
    }
  }, [videoId, autoplay])

  if (!videoId) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      padding: '15px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Lecteur audio</h4>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px',
              color: '#666',
              lineHeight: '1',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = '#333'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          >
            ×
          </button>
        )}
      </div>
      
      <div id={playerIdRef.current} ref={playerRef} style={{ borderRadius: '4px', overflow: 'hidden' }}></div>
    </div>
  )
}

export default YouTubePlayer

