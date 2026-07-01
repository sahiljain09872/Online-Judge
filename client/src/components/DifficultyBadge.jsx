import React from 'react';

const DifficultyBadge = ({ difficulty }) => {
  let colorClass = '';
  switch (difficulty) {
    case 'Easy':
      colorClass = 'badge-success';
      break;
    case 'Medium':
      colorClass = 'badge-warning';
      break;
    case 'Hard':
      colorClass = 'badge-error';
      break;
    default:
      colorClass = 'badge-neutral';
  }

  return (
    <span className={`badge ${colorClass}`}>
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;
