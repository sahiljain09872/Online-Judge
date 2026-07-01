import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { CheckCircle2, Clock, Code2, Target, CalendarDays, Activity } from 'lucide-react';
import SubmissionTable from '../components/SubmissionTable';

const Profile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile(id);
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!profileData) return <div className="page-container"><h2>User not found</h2></div>;

  const { user, stats, recentSubmissions } = profileData;

  return (
    <div className="page-container profile-page">
      <div className="profile-header card">
        <div className="profile-avatar">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user.fullName}</h1>
          <p className="text-muted flex items-center gap-2">
            <CalendarDays size={16} /> 
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="stats-grid mt-6">
        <div className="stat-card">
          <div className="stat-icon text-success"><CheckCircle2 size={24} /></div>
          <div className="stat-details">
            <div className="stat-value">{stats.problemsSolved}</div>
            <div className="stat-label">Problems Solved</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon text-primary"><Activity size={24} /></div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalSubmissions}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon text-warning"><Target size={24} /></div>
          <div className="stat-details">
            <div className="stat-value">{stats.acceptanceRate}%</div>
            <div className="stat-label">Acceptance Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon text-muted"><Code2 size={24} /></div>
          <div className="stat-details">
            <div className="stat-value" style={{ textTransform: 'capitalize' }}>
              {stats.favoriteLanguage}
            </div>
            <div className="stat-label">Favorite Language</div>
          </div>
        </div>
      </div>

      <div className="profile-content-grid mt-8">
        <div className="difficulty-card card">
          <h3 className="mb-4">Difficulty Breakdown</h3>
          
          <div className="diff-bar-container">
            <div className="diff-label">Easy</div>
            <div className="diff-bar-wrapper">
              <div className="diff-bar bg-success" style={{ width: `${Math.min(100, (stats.difficultyBreakdown?.Easy || 0) * 10)}%` }}></div>
            </div>
            <div className="diff-count">{stats.difficultyBreakdown?.Easy || 0}</div>
          </div>

          <div className="diff-bar-container">
            <div className="diff-label">Medium</div>
            <div className="diff-bar-wrapper">
              <div className="diff-bar bg-warning" style={{ width: `${Math.min(100, (stats.difficultyBreakdown?.Medium || 0) * 10)}%` }}></div>
            </div>
            <div className="diff-count">{stats.difficultyBreakdown?.Medium || 0}</div>
          </div>

          <div className="diff-bar-container">
            <div className="diff-label">Hard</div>
            <div className="diff-bar-wrapper">
              <div className="diff-bar bg-error" style={{ width: `${Math.min(100, (stats.difficultyBreakdown?.Hard || 0) * 10)}%` }}></div>
            </div>
            <div className="diff-count">{stats.difficultyBreakdown?.Hard || 0}</div>
          </div>
        </div>

        <div className="recent-submissions-card card">
          <h3 className="mb-4">Recent Submissions</h3>
          <SubmissionTable submissions={recentSubmissions} showProblem={true} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
