import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ setActiveTab, activeTab }) {
  const { user, logout } = useAuth();

  return (
    <nav style={{width: '100%', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      {/* Left side - Logo and App name */}
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <div style={{width: '40px', height: '40px', backgroundColor: '#007bff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: 'white'}}>
          Q
        </div>
        <span style={{fontSize: '20px', fontWeight: '600', color: '#333'}}>Quillscape</span>
      </div>

      {/* Right side - Navigation items */}
      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
        {/* Settings tab */}
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            cursor: 'pointer',
            backgroundColor: activeTab === 'settings' ? '#007bff' : '#e9ecef',
            color: activeTab === 'settings' ? 'white' : '#333'
          }}
        >
          Settings
        </button>

        {/* User profile tab */}
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            cursor: 'pointer',
            backgroundColor: activeTab === 'profile' ? '#007bff' : '#e9ecef',
            color: activeTab === 'profile' ? 'white' : '#333'
          }}
        >
          Profile
        </button>

        {/* Blogs tab */}
        <button
          onClick={() => setActiveTab('blogs')}
          style={{
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            cursor: 'pointer',
            backgroundColor: activeTab === 'blogs' ? '#007bff' : '#e9ecef',
            color: activeTab === 'blogs' ? 'white' : '#333'
          }}
        >
          Blogs
        </button>

        {/* Signout button */}
        <button
          onClick={logout}
          style={{
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            cursor: 'pointer',
            backgroundColor: '#dc3545',
            color: 'white'
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
