import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import axios from "axios";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

import './App.css'
function Login(){
   //keeping track of email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate();
  return (
    <>
    <input type="email" placeholder='email' onChange={e=>{setEmail(e.target.value)}}></input>
    <input type="password" placeholder='password' onChange={e=>{setPassword(e.target.value)}}></input>
     {/* login button */}
     <button onClick={async ()=>{
      //check if user ke credentials are correct, if they are log him in and re route to another page
      console.log(email);
      console.log(password);
      //send this payload of email and pass to BE:
      //instead of jwt.sign() we use this for firebase (same step and working, firebase signs a jwt under the hood and creates a token for us)
      //token created and received via getIdToken from firebase auth. this token contains uid, now frontend has uid and i want to hit the backend with this uid and the backend will verify if uid is correct or not
      //if uid is correct, backend returns status 200, and when frontend receives status 200 it redirects to the dashboard
      //if uid is incorrect, backend returns status 404 or something, and then frontend prints out "invalid credentials"
      //we are doing this by putting the whole thing in a try-catch block, the stack automatically understands 404 error is there and implements whatever is inside of catch(err)
      //reroute to dashboard
      try {
      await signInWithEmailAndPassword(auth, email, password)
      const token=await auth.currentUser.getIdToken(); 
      console.log(token);
      
      await axios.post("http://localhost:3000/test", {}, {headers:{ Authorization: `Bearer ${token}`}});
      
        //reroute here, kyuki agar status 404 aaya hoga to it will automatically get redirected to catch block
        navigate("/dashboard");
      } catch (error) {
        alert("invalid credentials");
        console.log(error);
      }
     
      
     }}>Login</button>

{/* 
     testing if firebase works or not
     <button onClick={async () => {
  try {
    const res = await createUserWithEmailAndPassword(
      auth,
      "test123@gmail.com",
      "password123"
    );

    console.log("Firebase working ✅");
    console.log("UID:", res.user.uid);
  } catch (err) {
    console.error("Firebase NOT working ❌", err.code, err.message);
  }
}}>
  Test Firebase
</button> */}
</>
)
}


export default function App() {
 
  return(
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login></Login>}></Route>
          <Route path="/dashboard" element={<Dashboard></Dashboard>}></Route>

        </Routes>
      </Router>
    </>
  )

  
}



