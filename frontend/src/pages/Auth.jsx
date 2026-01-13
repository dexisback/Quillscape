import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import { syncUserWithMongoDB } from "../api/user.api";

function Signin({ email, password }){

   //keeping track of email and password
  const navigate=useNavigate();
  return (
    <>
     <button 
       style={{padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', marginBottom: '10px'}}
       onClick={async ()=>{
      console.log(email);
      console.log(password);
     
      try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user= result.user;
    
      const token=await auth.currentUser.getIdToken(); 
      // console.log(token); //temp
        await syncUserWithMongoDB({
        firebaseUid: user.uid,
        email: user.email

      })
        navigate("/dashboard");
      } catch (error) {
        alert("invalid credentials");
        console.log(error);
      }
     
     
     }}>Sign In</button>

</>
)
}


function Signup({email, password}) {
  const navigate=useNavigate();
  
    return (
    <>
    <button 
      style={{padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%'}}
      onClick={async ()=>{
        try {
        const res=await createUserWithEmailAndPassword(auth, email, password);
        const token= await res.user.getIdToken();
        await syncUserWithMongoDB({
      firebaseUid: res.user.uid,
      email: res.user.email
    });
        navigate("/dashboard");

        } catch (error) {
            alert("Signup failed, user exists already")
            console.log(error);
        }


    }}>Sign Up</button>
    {/* <InputBoxes email={email} setEmail={setEmail} password={password} setPassword={setPassword}></InputBoxes> */}
    
    </>
  )
}


//main component:
export default function Auth(){
    const [email, setEmail]= useState("");
    const [password, setPassword]= useState("");
    const navigate= useNavigate();


  return (
    <div style={{minHeight: '100vh', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
      <div style={{width: '100%', maxWidth: '400px', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        {/* Logo and Title */}
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div style={{width: '60px', height: '60px', backgroundColor: '#007bff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white', margin: '0 auto 15px'}}>
            Q
          </div>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', color: '#333', margin: '0 0 10px'}}>Quillscape</h1>
          <p style={{color: '#666', margin: '0'}}>Your thoughts, your space</p>
        </div>

        {/* Form fields */}
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', color: '#333', fontSize: '14px', marginBottom: '5px'}}>Email</label>
          <input 
            type="email" 
            placeholder='Enter your email' 
            value={email} 
            onChange={e=>{setEmail(e.target.value)}}
            style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', marginBottom: '15px', boxSizing: 'border-box'}}
          />
          
          <label style={{display: 'block', color: '#333', fontSize: '14px', marginBottom: '5px'}}>Password</label>
          <input 
            type="password" 
            placeholder='Enter your password' 
            value={password} 
            onChange={e=>{setPassword(e.target.value)}}
            style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box'}}
          />
        </div>

        {/* Buttons */}
        <div style={{marginTop: '20px'}}>
          <Signin email={email} password={password} />
          <div style={{textAlign: 'center', color: '#666', margin: '10px 0'}}>or</div>
          <Signup email={email} password={password} />
        </div>
      </div>
    </div>
  )
}

