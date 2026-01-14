import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Feed from './pages/Home';
// import Dashboard from './pages/Dashboard';

import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Post from './pages/Post';
import Home from './pages/Home'
import './App.css'

export default function App() {
  return(
    <>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>  
              <Route path="/" element={<Auth />} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/post-blogs" element={<ProtectedRoute><Post /></ProtectedRoute>} />
              <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/user-settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}






