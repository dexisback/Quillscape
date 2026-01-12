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
     <button onClick={async ()=>{
      console.log(email);
      console.log(password);
     
      try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user= result.user;
      // send to mongoDB (the syncing step)
    
      const token=await auth.currentUser.getIdToken(); 
      // console.log(token); //temp, remove this shiii ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
      console.log(user);
        await syncUserWithMongoDB({
        firebaseUid: user.uid,
        email: user.email

      })
        navigate("/dashboard");
      } catch (error) {
        alert("invalid credentials");
        console.log(error);
      }
     
     
     }}>Signin</button>

</>
)
}


function Signup({email, password}) {
  const navigate=useNavigate();
  
    return (
    <>
    <button onClick={async ()=>{
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


    }}>Signup</button>
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
    <>

  {/* mount inputs once and pass values down */}
  <input type="email" placeholder='email' value={email} onChange={e=>{setEmail(e.target.value)}}></input>
  <input type="password" placeholder='password' value={password} onChange={e=>{setPassword(e.target.value)}}></input>

      <Signin email={email} password={password} />
      <Signup email={email} password={password} />

    </>
  )
}
