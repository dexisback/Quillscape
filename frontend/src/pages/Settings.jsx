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
    <div style={{minHeight: '100vh', backgroundColor: 'white'}}>
      <Navbar />
      <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
        <div style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '25px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px'}}>Settings</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
            <div style={{backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '15px'}}>
              <p style={{color: '#666', fontSize: '14px', margin: '0 0 5px'}}>Current Email</p>
              <p style={{color: '#333', margin: '0'}}>{user.email}</p>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <button 
                onClick={passwordResetter}
                style={{width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '16px', cursor: 'pointer'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Change Password
              </button>
              
              <button 
                onClick={accountDeleter}
                style={{width: '100%', padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '16px', cursor: 'pointer'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
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

