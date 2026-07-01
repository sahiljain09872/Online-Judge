import React, { useState } from 'react';
import { Clock, Database, AlertCircle, CheckCircle2, XCircle, Terminal } from 'lucide-react';

const VerdictDisplay = ({ submission }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!submission) {
    return (
      <div className="verdict-display empty">
        <p className="text-muted">Run or submit your code to see results</p>
      </div>
    );
  }

  const { status, verdict, executionTime: time, memoryUsed: memory, errorMessage: error, isRun, testCaseResults } = submission;

  if (status === 'queued') {
    return (
      <div className="verdict-display queued">
        <div className="verdict-status">
          <Clock size={20} className="icon-pulse" />
          <span className="verdict-title">Queued...</span>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="verdict-display processing">
        <div className="verdict-status">
          <div className="spinner small"></div>
          <span className="verdict-title text-primary">Running test cases...</span>
        </div>
      </div>
    );
  }

  // Final verdicts
  let colorClass = '';
  let Icon = AlertCircle;

  switch (verdict) {
    case 'Accepted':
      colorClass = 'verdict-success';
      Icon = CheckCircle2;
      break;
    case 'Wrong Answer':
      colorClass = 'verdict-error';
      Icon = XCircle;
      break;
    case 'TLE':
    case 'MLE':
      colorClass = 'verdict-warning';
      Icon = Clock;
      break;
    default:
      colorClass = 'verdict-error';
      Icon = Terminal;
  }

  return (
    <div className={`verdict-display-wrapper`}>
      <div className={`verdict-display ${colorClass}`}>
        <div className="verdict-status">
          <Icon size={20} />
          <span className="verdict-title">{verdict}</span>
        </div>
        
        {(time || memory) && (
          <div className="verdict-metrics">
            {time && (
              <span className="metric">
                <Clock size={14} /> {time}ms
              </span>
            )}
            {memory && (
              <span className="metric">
                <Database size={14} /> {(memory / 1024).toFixed(2)}MB
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="verdict-error-details">
            <pre>{error}</pre>
          </div>
        )}
      </div>

      {isRun && testCaseResults && testCaseResults.length > 0 && (
        <div className="run-details-container mt-4" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div className="tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {testCaseResults.map((tc, idx) => (
              <button 
                key={idx} 
                className={`btn-ghost ${activeTab === idx ? 'active' : ''}`}
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '4px',
                  backgroundColor: activeTab === idx ? 'var(--bg-tertiary)' : 'transparent',
                  border: activeTab === idx ? '1px solid var(--text-muted)' : '1px solid transparent'
                }}
                onClick={() => setActiveTab(idx)}
              >
                Case {idx + 1}
              </button>
            ))}
          </div>

          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {testCaseResults[activeTab] && (
              <>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Input:</h4>
                  <pre className="code-block" style={{ margin: 0, padding: '0.5rem' }}>{testCaseResults[activeTab].input}</pre>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Your Output:</h4>
                  <pre className="code-block" style={{ margin: 0, padding: '0.5rem', borderColor: testCaseResults[activeTab].isCustom ? 'var(--border-color)' : (testCaseResults[activeTab].verdict === 'Accepted' ? 'var(--success)' : 'var(--error)') }}>
                    {testCaseResults[activeTab].output || (testCaseResults[activeTab].error ? testCaseResults[activeTab].error : 'No output')}
                  </pre>
                </div>
                {!testCaseResults[activeTab].isCustom && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Expected Output:</h4>
                    <pre className="code-block" style={{ margin: 0, padding: '0.5rem' }}>{testCaseResults[activeTab].expected}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerdictDisplay;
