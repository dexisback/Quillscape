import React from 'react'
import { useState, useEffect } from 'react'
import axios from "axios";
import api from '../api/axios';
import { getUserProfile } from '../api/user.api';
import { updateUserProfile } from '../api/user.api';
 
export default function UserProfile() {
  const [user, setUser]= useState(null);
  const [loading, setLoading]= useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', bio: '' });
  
  useEffect(()=>{
    const fetchProfile = async () => {
      try {
        //no need to pass the token or anything since i have written the api file for getBlogs(); and getusers shii:
        // const token = localStorage.getItem("token"); 
        // const response = await axios.get("")
        const response= await getUserProfile();
        setUser(response.data);

      } catch (err) {
        console.error("sorry error in sending the fetch request from frontend", err);
      }
      finally{
        setLoading(false);
      }
    }
  fetchProfile();
  },[]);


  const handleUpdate = async () => {
    try {
      const response = await updateUserProfile(formData);
      setUser(response.data);
      setIsEditing(false);

    } catch (err) {
      console.error("update handler failed in FE", err)
      alert("update failed!")
    }
  }


  if(loading) return(<div>loading...</div>)
  if(!user) return(<div>user not found, how tf did you even bypass the auth</div>)

  return (
    <>
    <div>
      <h2>User profile
                <button onClick={()=>{setIsEditing(!isEditing)}}>Edit button</button>

      </h2>

    </div>
   
   <div>
    {isEditing ? (
        <div className="edit-form">
          <input 
            value={formData.username} 
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
          />
          <textarea 
            value={formData.bio} 
            onChange={(e) => setFormData({...formData, bio: e.target.value})} 
          />
          <button onClick={handleUpdate}>Save Changes</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="view-mode">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Bio:</strong> {user.bio}</p>
          <p><strong>Email:</strong> {user.email} (Not editable)</p>
        </div>
      )}
    </div>
  </>
  );
}






