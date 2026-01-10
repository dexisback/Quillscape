import { useState, useEffect } from 'react'

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import axios from "axios";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// signInWithEmailAndPassword for singin and createUserWithEmailAndPassword for signup 
import { auth } from './firebase';
import './App.css'
//import InputBoxes from '../components/InputBoxes';
// import Signin from '../components/Signin';
// import Signup from '../components/Signup';

//refactored:
// import AuthComponent from '../components/AuthComponent';
import Auth from './pages/Auth';


export default function App() {
 
  return(
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Auth></Auth>}></Route>
          <Route path="/dashboard" element={<Dashboard></Dashboard>}></Route>
          

        </Routes>
      </Router>
    </>
  )

  
}



