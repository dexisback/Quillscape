import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-gray-100 border-b border-gray-300 px-5 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center font-bold text-lg text-white">
          Q
        </div>
        <span className="text-xl font-semibold text-gray-800">Quillscape</span>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/feed">
          <button className={`px-4 py-2 rounded border-none cursor-pointer ${isActive('/feed') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            Feed
          </button>
        </Link>

        <Link to="/dashboard">
          <button className={`px-4 py-2 rounded border-none cursor-pointer ${isActive('/dashboard') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            Dashboard
          </button>
        </Link>

        <Link to="/user-settings">
          <button className={`px-4 py-2 rounded border-none cursor-pointer ${isActive('/user-settings') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            Settings
          </button>
        </Link>

        <Link to="/user-profile">
          <button className={`px-4 py-2 rounded border-none cursor-pointer ${isActive('/user-profile') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            Profile
          </button>
        </Link>

        <button
          onClick={logout}
          className="px-4 py-2 rounded border-none cursor-pointer bg-red-500 text-white hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
