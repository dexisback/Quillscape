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
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-5 text-gray-800">Loading...</div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-5 text-gray-800">User not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto p-5">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 m-0">User Profile</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          <div>
            {isEditing ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-800 text-sm mb-1">Username</label>
              <input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-md text-base box-border"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-gray-800 text-sm mb-1">Bio</label>
              <textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-md text-base min-h-[100px] box-border resize-y"
                placeholder="Tell us about yourself"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <p className="text-gray-500 text-sm mb-1">Username</p>
              <p className="text-gray-800 m-0">{user.username || 'Not set'}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <p className="text-gray-500 text-sm mb-1">Bio</p>
              <p className="text-gray-800 m-0">{user.bio || 'No bio yet'}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <p className="text-gray-500 text-sm mb-1">Email</p>
              <p className="text-gray-800 m-0">{user.email} <span className="text-gray-500">(Not editable)</span></p>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
