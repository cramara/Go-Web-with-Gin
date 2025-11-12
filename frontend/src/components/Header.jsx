import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="header">
      <h1>Gestion d'Albums</h1>
      <nav className="nav">
        <Link to="/albums">Albums</Link>
        {user && (
          <span style={{ padding: '8px 15px', color: '#666' }}>
            {user.name || user.email}
          </span>
        )}
        <button onClick={handleLogout} className="btn btn-danger">
          Déconnexion
        </button>
      </nav>
    </div>
  )
}

export default Header

