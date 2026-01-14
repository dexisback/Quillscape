import { auth } from '../firebase';
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { sendPasswordResetEmail,deleteUser } from 'firebase/auth'
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Settings() {
    const {user, logout}= useAuth();
    const passwordResetter = async () =>{
      try {
        await sendPasswordResetEmail(auth, user.email);
        alert("password reset email sent!");
      } catch (err) {
        alert("couldnt send email for some reason")
        console.error("error in resetting pass", err)
      }
    }
    const accountDeleter = async () => {
        try {
          await api.delete("/users/me");
          await deleteUser(user);
          alert("acount yeeted from our backend");
          logout();
        } catch (err) {
          alert("couldnt delete account");
          console.error("error in dlting account", err)
        }
    }
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-5">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <p className="text-gray-500 text-sm mb-1">Current Email</p>
              <p className="text-gray-800 m-0">{user.email}</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={passwordResetter}
                className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
              >
                Change Password
              </button>
              
              <button 
                onClick={accountDeleter}
                className="w-full py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
              >
                Delete Account Permanently
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

