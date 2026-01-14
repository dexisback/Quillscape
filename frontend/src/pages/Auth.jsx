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
       className="w-full py-3 bg-blue-600 text-white rounded-md mb-2 hover:bg-blue-700"
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
        navigate("/home");
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
      className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
      onClick={async ()=>{
        try {
        const res=await createUserWithEmailAndPassword(auth, email, password);
        const token= await res.user.getIdToken();
        await syncUserWithMongoDB({
      firebaseUid: res.user.uid,
      email: res.user.email
    });
        navigate("/home");

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
    <div className="min-h-screen bg-white flex items-center justify-center p-5">
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-lg bg-white shadow-sm">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-md flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">Q</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Quillscape</h1>
          <p className="text-gray-500">Your thoughts, your space</p>
        </div>

        {/* Form fields */}
        <div className="mb-5">
          <label className="block text-gray-800 text-sm mb-1">Email</label>
          <input 
            type="email" 
            placeholder='Enter your email' 
            value={email} 
            onChange={e=>{setEmail(e.target.value)}}
            className="w-full p-3 border border-gray-200 rounded-md text-base mb-4 box-border"
          />
          
          <label className="block text-gray-800 text-sm mb-1">Password</label>
          <input 
            type="password" 
            placeholder='Enter your password' 
            value={password} 
            onChange={e=>{setPassword(e.target.value)}}
            className="w-full p-3 border border-gray-200 rounded-md text-base box-border"
          />
        </div>

        {/* Buttons */}
        <div className="mt-5">
          <Signin email={email} password={password} />
          <div className="text-center text-gray-500 my-3">or</div>
          <Signup email={email} password={password} />
        </div>
      </div>
    </div>
  )
}

