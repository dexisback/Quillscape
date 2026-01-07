import { useState, useEffect } from 'react'
import axios from "axios";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

import './App.css'

export default function App() {
  //keeping track of email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await signInWithEmailAndPassword(auth, email, password)
      const token=await auth.currentUser.getIdToken();
      
     }}>Login</button>


     {/* testing if firebase works or not */}
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
</button>
    </>
  )
}



