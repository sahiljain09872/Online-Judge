import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Terminal, LogOut, User, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Terminal size={24} className="nav-logo-icon" />
          <span>CodeArena</span>
        </Link>

        <div className="nav-links">
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          {isAuthenticated ? (
            <>
              {/* TEMPORARILY HIDDEN
               user?.role === 'admin' && (
                <Link to="/admin" className="nav-item text-warning" style={{ fontWeight: 'bold' }}>Admin Panel</Link>
              )*/}
              <Link to="/leaderboard" className="nav-item">Leaderboard</Link>
              <Link to="/problems" className="nav-item">Problems</Link>
              <div className="nav-user">
                <Link to={`/profile/${user.id}`} className="nav-user-profile-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                  <User size={18} />
                  <span>{user?.fullName}</span>
                </Link>
                <button onClick={handleLogout} className="btn-logout">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
