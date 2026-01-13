import { auth } from '../firebase';
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { sendPasswordResetEmail,deleteUser } from 'firebase/auth'
import api from '../api/axios';
//since we are making the user profile to contain the pencil edit feature besides the fields, settings focuses on misc stuff and deleteAcc/changedefaulttheme/changepass
export default function Settings() {
    const {user, logout}= useAuth();
    const passwordResetter = async () =>{
      try {
        await sendPasswordResetEmail(auth, user.email);
        alert("password reset email sent!");
      } catch (err) {
        alert("couldnt send email for some reason")
        console.error("error in resetting pass", err)
        //add functionality later to reset your password
      }
    }
    const accountDeleter = async () => {
        try {
          await api.delete("/users/me");
          await deleteUser(user); //firebase se dlt
          alert("acount yeeted from our backend");
          logout();
        } catch (err) {
          alert("couldnt delete account");
          console.error("error in dlting account", err)
        }
    }
  return (
    <>
        {/* show email */}
        <p>email is -- {user.email}</p>
        <button onClick={passwordResetter}>Change password</button>
        <button onClick={accountDeleter}>Permanently dlt your account</button>
    </>

)
}

