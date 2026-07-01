import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Code, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          Master Your <span className="text-gradient">Algorithms</span>
        </h1>
        <p className="hero-subtitle">
          CodeArena is the ultimate platform to hone your competitive programming skills.
          Solve problems, execute code in secure Docker containers, and climb the leaderboard.
        </p>
        <div className="hero-actions">
          <Link to="/problems" className="btn-primary btn-lg">Start Coding</Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn-ghost btn-lg">Create Account</Link>
          )}
          {isAuthenticated && (
            <Link to="/leaderboard" className="btn-ghost btn-lg">View Leaderboard</Link>
          )}
        </div>
      </div>
      
      <div className="features-grid">
        <div className="feature-card glass-panel">
          <Terminal size={32} className="feature-icon" />
          <h3>Real-time Execution</h3>
          <p>Your code is compiled and executed in secure, isolated Docker containers instantly.</p>
        </div>
        <div className="feature-card glass-panel">
          <Code size={32} className="feature-icon" />
          <h3>Multiple Languages</h3>
          <p>Full support for C++, Python, and Java with industry-standard versions.</p>
        </div>
        <div className="feature-card glass-panel">
          <Cpu size={32} className="feature-icon" />
          <h3>Robust Infrastructure</h3>
          <p>Powered by BullMQ and Redis to handle thousands of concurrent code submissions.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
