import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardService } from '../services/leaderboardService';
import { Trophy, Medal, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardService.getLeaderboard();
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="text-warning" size={20} />; // Gold
    if (rank === 2) return <Medal className="text-muted" size={20} />; // Silver
    if (rank === 3) return <Award style={{ color: '#cd7f32' }} size={20} />; // Bronze
    return <span className="rank-number">{rank}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Global Leaderboard</h1>
        <p className="text-muted">Ranked by unique problems solved.</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th width="80">Rank</th>
              <th>Coder</th>
              <th className="text-right">Solved</th>
              <th className="text-right">Submissions</th>
              <th className="text-right">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-8">No data available yet.</td>
              </tr>
            ) : (
              leaderboard.map((user) => (
                <tr key={user.userId} className={currentUser?.id === user.userId ? 'row-highlight' : ''}>
                  <td className="rank-cell">{getRankIcon(user.rank)}</td>
                  <td>
                    <Link to={`/profile/${user.userId}`} className="user-link font-medium">
                      {user.fullName}
                    </Link>
                    {currentUser?.id === user.userId && <span className="badge badge-primary ml-2">You</span>}
                  </td>
                  <td className="text-right font-bold text-success">{user.problemsSolved}</td>
                  <td className="text-right">{user.totalSubmissions}</td>
                  <td className="text-right">{user.acceptanceRate}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
