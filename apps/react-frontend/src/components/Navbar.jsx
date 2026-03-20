import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full glass-nav border-b border-border/30 px-5 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <defs>
              <mask id="nav-cut">
                <rect width="100" height="100" fill="white" />
                <circle cx="52" cy="35" r="18" fill="black" />
                <circle cx="65" cy="65" r="10" fill="black" />
              </mask>
            </defs>
            <circle cx="50" cy="50" r="40" fill="currentColor" mask="url(#nav-cut)" className="text-primary-foreground" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/home">
          <button className={`px-4 py-2 rounded-full border-none cursor-pointer text-sm font-medium transition-all ${isActive('/home') ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            Home
          </button>
        </Link>

        <Link to="/post-blogs">
          <button className={`px-4 py-2 rounded-full border-none cursor-pointer text-sm font-medium transition-all ${isActive('/post-blogs') ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            Post
          </button>
        </Link>

        <Link to="/user-settings">
          <button className={`px-4 py-2 rounded-full border-none cursor-pointer text-sm font-medium transition-all ${isActive('/user-settings') ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            Settings
          </button>
        </Link>

        <Link to="/user-profile">
          <button className={`px-4 py-2 rounded-full border-none cursor-pointer text-sm font-medium transition-all ${isActive('/user-profile') ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            Profile
          </button>
        </Link>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-full border-none cursor-pointer text-sm font-medium hover:shadow-lg transition-all"
          style={{ backgroundColor: '#3d3d3d', color: '#ffffff' }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
