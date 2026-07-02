import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

const SubmissionTable = ({ submissions, showProblem = true }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => {
            const rowId = sub._id || sub.id;
            const isExpanded = expandedRow === rowId;
            return (
              <React.Fragment key={rowId}>
                <tr 
                  onClick={() => toggleRow(rowId)}
                  style={{ cursor: 'pointer' }}
                  className={isExpanded ? 'active-row' : ''}
                >
                  {showProblem && (
                    <td>
                      <Link to={`/problems/${sub.problem?.code}`} className="user-link font-medium" onClick={(e) => e.stopPropagation()}>
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
                  <td className="text-center text-muted">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={showProblem ? 7 : 6} style={{ padding: 0 }}>
                      <div style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', padding: '1rem' }}>
                        <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Submitted Code:
                        </div>
                        <pre className="code-block" style={{ margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                          {sub.code || 'Code not available (Old submission)'}
                        </pre>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;
