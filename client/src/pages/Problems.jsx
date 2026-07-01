import React, { useState, useEffect } from 'react';
import { problemService } from '../services/problemService';
import ProblemCard from '../components/ProblemCard';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await problemService.getProblems();
        setProblems(res.data);
      } catch (error) {
        console.error('Failed to fetch problems', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Coding Challenges</h1>
        <p className="text-muted">Solve problems, test your skills, and climb the leaderboard.</p>
      </div>

      <div className="problems-list">
        {problems.length === 0 ? (
          <div className="empty-state panel">
            <p>No problems found. Run the seed script to add problems.</p>
          </div>
        ) : (
          problems.map(problem => (
            <ProblemCard key={problem._id} problem={problem} />
          ))
        )}
      </div>
    </div>
  );
};

export default Problems;
