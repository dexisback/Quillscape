import { useState, useEffect } from 'react'

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import axios from "axios";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import './App.css'
import Auth from './pages/Auth';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';


export default function App() {
 
  return(
    <>
      <ThemeProvider>
        <AuthProvider>
                  <Router>
                    <Routes>  
                      <Route path="/" element={<Auth></Auth>}></Route>

                      <Route path="/dashboard" element={<ProtectedRoute>   <Dashboard></Dashboard>   </ProtectedRoute>}></Route>
                    </Routes>
                  </Router>
        </AuthProvider>
      </ThemeProvider>
    </>
  )

  
}






