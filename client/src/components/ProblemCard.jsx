import React from 'react';
import { Link } from 'react-router-dom';
import DifficultyBadge from './DifficultyBadge';
import { Code2, ChevronRight } from 'lucide-react';

const ProblemCard = ({ problem }) => {
  return (
    <Link to={`/problems/${problem.code}`} className="problem-card panel">
      <div className="problem-card-content">
        <div className="problem-card-header">
          <Code2 size={20} className="problem-icon" />
          <h3 className="problem-title">{problem.name}</h3>
        </div>
        <div className="problem-card-meta">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="problem-id">#{problem._id.substring(0, 6)}</span>
        </div>
      </div>
      <div className="problem-card-action">
        <ChevronRight size={20} />
      </div>
    </Link>
  );
};

export default ProblemCard;
