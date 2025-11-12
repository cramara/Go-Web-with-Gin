import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Login from './components/Login'
import Register from './components/Register'
import AlbumsList from './components/AlbumsList'
import AlbumDetail from './components/AlbumDetail'
import CreateAlbum from './components/CreateAlbum'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/albums"
            element={
              <ProtectedRoute>
                <AlbumsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/albums/new"
            element={
              <ProtectedRoute>
                <CreateAlbum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/albums/:id"
            element={
              <ProtectedRoute>
                <AlbumDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/albums" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

