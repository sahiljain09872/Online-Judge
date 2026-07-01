import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react';

const SubmissionTable = ({ submissions, showProblem = true }) => {
  const getVerdictIcon = (verdict) => {
    if (verdict === 'Accepted') return <CheckCircle2 size={18} />;
    if (verdict === 'Wrong Answer') return <XCircle size={18} />;
    if (verdict === 'TLE' || verdict === 'MLE') return <Clock size={18} />;
    return <Terminal size={18} />;
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'Accepted') return 'text-success';
    if (verdict === 'Wrong Answer') return 'text-error';
    if (verdict === 'TLE' || verdict === 'MLE') return 'text-warning';
    return 'text-error';
  };

  if (!submissions || submissions.length === 0) {
    return <p className="text-muted py-4">No submissions found.</p>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {showProblem && <th>Problem</th>}
            <th>Language</th>
            <th>Verdict</th>
            <th className="text-right">Time</th>
            <th className="text-right">Memory</th>
            <th className="text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub._id || sub.id}>
              {showProblem && (
                <td>
                  <Link to={`/problems/${sub.problem?.code}`} className="user-link font-medium">
                    {sub.problem?.name || 'Unknown'}
                  </Link>
                </td>
              )}
              <td style={{ textTransform: 'capitalize' }} className="font-medium">{sub.language}</td>
              <td>
                <div className={`flex items-center gap-2 font-bold ${getVerdictColor(sub.verdict)}`}>
                  {getVerdictIcon(sub.verdict)}
                  <span>{sub.verdict}</span>
                </div>
              </td>
              <td className="text-right whitespace-nowrap">{sub.executionTime ? `${sub.executionTime} ms` : '-'}</td>
              <td className="text-right whitespace-nowrap">{sub.memoryUsed ? `${(sub.memoryUsed / 1024).toFixed(1)} MB` : '-'}</td>
              <td className="text-right text-muted text-sm whitespace-nowrap">
                {new Date(sub.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;
