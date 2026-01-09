import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../src/firebase';
import axios from "axios";

function Signin({ email, password }){
   //keeping track of email and password
  const navigate=useNavigate();
  return (
    <>
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
    //   console.log(token);

      await axios.post("http://localhost:3000/test", {}, {headers:{ Authorization: `Bearer ${token}`}});
      
        //reroute here, kyuki agar status 404 aaya hoga to it will automatically get redirected to catch block
        navigate("/dashboard");
      } catch (error) {
        alert("invalid credentials");
        console.log(error);
      }
     
     
     }}>Signin</button>

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


function Signup({email, password}) {
  const navigate=useNavigate();
  
    return (
    <>
    <button onClick={async ()=>{
        try {
        const res=await createUserWithEmailAndPassword(auth, email, password);
        const token= await res.user.getIdToken();
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
export default function AuthComponent(){
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
