import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Create';
import Feed from './pages/Feed';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

export default function App() {
  return(
    <>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>  
              <Route path="/" element={<Auth />} />
              <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/user-settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}






