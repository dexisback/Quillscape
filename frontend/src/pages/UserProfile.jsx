import React from 'react';
import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../api/user.api';
import Navbar from '../components/Navbar';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', bio: '' });
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const response = await updateUserProfile(formData);
      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Update failed!');
    }
  }

  if (loading) return (
    <div style={{minHeight: '100vh', backgroundColor: 'white'}}>
      <Navbar />
      <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px', color: '#333'}}>Loading...</div>
    </div>
  );
  
  if (!user) return (
    <div style={{minHeight: '100vh', backgroundColor: 'white'}}>
      <Navbar />
      <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px', color: '#333'}}>User not found</div>
    </div>
  );

  return (
    <div style={{minHeight: '100vh', backgroundColor: 'white'}}>
      <Navbar />
      <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
        <div style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '25px'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '600', color: '#333', margin: '0'}}>User Profile</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              style={{padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          <div>
            {isEditing ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div>
              <label style={{display: 'block', color: '#333', fontSize: '14px', marginBottom: '5px'}}>Username</label>
              <input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box'}}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label style={{display: 'block', color: '#333', fontSize: '14px', marginBottom: '5px'}}>Bio</label>
              <textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', minHeight: '100px', boxSizing: 'border-box', resize: 'vertical'}}
                placeholder="Tell us about yourself"
              />
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                onClick={handleUpdate}
                style={{padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'}}
              >
                Save Changes
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                style={{padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'}}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div style={{backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '15px'}}>
              <p style={{color: '#666', fontSize: '14px', margin: '0 0 5px'}}>Username</p>
              <p style={{color: '#333', margin: '0'}}>{user.username || 'Not set'}</p>
            </div>
            <div style={{backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '15px'}}>
              <p style={{color: '#666', fontSize: '14px', margin: '0 0 5px'}}>Bio</p>
              <p style={{color: '#333', margin: '0'}}>{user.bio || 'No bio yet'}</p>
            </div>
            <div style={{backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '15px'}}>
              <p style={{color: '#666', fontSize: '14px', margin: '0 0 5px'}}>Email</p>
              <p style={{color: '#333', margin: '0'}}>{user.email} <span style={{color: '#666'}}>(Not editable)</span></p>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
