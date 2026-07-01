import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Allotment } from 'allotment';
import ReactMarkdown from 'react-markdown';
import 'allotment/dist/style.css';

import { problemService } from '../services/problemService';
import { submissionService } from '../services/submissionService';
import { codeTemplates } from '../utils/codeTemplates';

import DifficultyBadge from '../components/DifficultyBadge';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import SubmitButton from '../components/SubmitButton';
import VerdictDisplay from '../components/VerdictDisplay';
import SubmissionTable from '../components/SubmissionTable';

import { ArrowLeft, FileText, Code2 } from 'lucide-react';

const ProblemDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Problem state
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(codeTemplates['cpp']);
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  
  // Left pane tabs
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fetchSubmissions = async () => {
    if (!problem) return;
    setLoadingSubmissions(true);
    try {
      const res = await submissionService.getProblemSubmissions(problem._id);
      setPastSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Failed to fetch past submissions', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (activeLeftTab === 'submissions' && problem) {
      fetchSubmissions();
    }
  }, [activeLeftTab, problem]);

  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        const probRes = await problemService.getProblemBySlug(slug);
        setProblem(probRes.data);
      } catch (error) {
        console.error('Failed to fetch problem detail', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblemData();
  }, [slug]);

  const handleLanguageChange = (newLang) => {
    // Only warn if they changed the template
    if (code !== codeTemplates[language]) {
      if (!window.confirm('Switching language will replace your current code with the default template. Continue?')) {
        return;
      }
    }
    setLanguage(newLang);
    setCode(codeTemplates[newLang]);
  };

  const handleSubmit = async (mode = 'submit') => {
    if (isSubmitting || !code.trim()) return;
    
    setIsSubmitting(mode);
    setSubmission({ status: 'queued' });
    
    try {
      // 1. Submit code
      let response;
      if (mode === 'run') {
        const inputToPass = useCustomInput ? customInput : null;
        response = await submissionService.runCode(problem._id, code, language, inputToPass);
      } else {
        response = await submissionService.submitCode(problem._id, code, language);
      }
      const submissionId = response.submissionId;
      
      // 2. Start polling for results
      const timer = setInterval(async () => {
        try {
          const result = await submissionService.getSubmission(submissionId);
          setSubmission(result);
          
          if (['completed', 'failed'].includes(result.status)) {
            clearInterval(timer);
            setIsSubmitting(false);
            if (activeLeftTab === 'submissions') {
              fetchSubmissions();
            }
          }
        } catch (err) {
          clearInterval(timer);
          setIsSubmitting(false);
          setSubmission({ 
            status: 'failed', 
            verdict: 'System Error', 
            error: 'Failed to fetch submission status' 
          });
        }
      }, 1500);

    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Failed to connect to execution server';
      const isRateLimit = error.response?.status === 429;
      
      setSubmission({ 
        status: 'completed', 
        verdict: isRateLimit ? 'Rate Limit Exceeded' : 'System Error', 
        error: errorMessage 
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  if (!problem) {
    return (
      <div className="page-container">
        <h2>Problem not found</h2>
        <button className="btn-ghost" onClick={() => navigate('/problems')}>Back to Problems</button>
      </div>
    );
  }

  return (
    <div className="problem-workspace">
      {/* Top Navbar for the workspace */}
      <div className="workspace-header">
        <div className="header-left">
          <button className="btn-ghost btn-sm" onClick={() => navigate('/problems')}>
            <ArrowLeft size={16} /> Problems
          </button>
          <div className="problem-title-wrapper">
            <h2>{problem.name}</h2>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
        </div>
      </div>

      <div className="workspace-main">
        <Allotment>
          {/* Left Pane: Problem Description / Submissions */}
          <Allotment.Pane minSize={300}>
            <div className="pane-content problem-statement-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="panel-header" style={{ padding: '0', borderBottom: '1px solid var(--border-color)', display: 'flex' }}>
                <button 
                  className={`tab-btn ${activeLeftTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveLeftTab('description')}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeLeftTab === 'description' ? '2px solid var(--primary-color)' : '2px solid transparent',
                    color: activeLeftTab === 'description' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: activeLeftTab === 'description' ? 'bold' : 'normal'
                  }}
                >
                  <FileText size={16} />
                  Description
                </button>
                <button 
                  className={`tab-btn ${activeLeftTab === 'submissions' ? 'active' : ''}`}
                  onClick={() => setActiveLeftTab('submissions')}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeLeftTab === 'submissions' ? '2px solid var(--primary-color)' : '2px solid transparent',
                    color: activeLeftTab === 'submissions' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: activeLeftTab === 'submissions' ? 'bold' : 'normal'
                  }}
                >
                  <Code2 size={16} />
                  Submissions
                </button>
              </div>
              
              <div className="panel-scroll-area" style={{ flex: 1, overflowY: 'auto' }}>
                {activeLeftTab === 'description' && (
                  <>
                    <div className="prose">
                      <ReactMarkdown>{problem.statement}</ReactMarkdown>
                    </div>
                    
                    <div className="sample-cases">
                      <h4>Sample Input</h4>
                      <pre className="code-block">{problem.sampleInput}</pre>
                      
                      <h4>Sample Output</h4>
                      <pre className="code-block">{problem.sampleOutput}</pre>
                    </div>

                    <div className="constraints">
                      <h4>Constraints</h4>
                      <div className="prose">
                        <ReactMarkdown>{problem.constraints}</ReactMarkdown>
                      </div>
                    </div>
                  </>
                )}

                {activeLeftTab === 'submissions' && (
                  <div style={{ padding: '1rem' }}>
                    {loadingSubmissions ? (
                      <div className="flex justify-center py-8"><div className="spinner"></div></div>
                    ) : (
                      <SubmissionTable submissions={pastSubmissions} showProblem={false} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </Allotment.Pane>

          {/* Right Pane: Editor & Console */}
          <Allotment.Pane minSize={400}>
            <div className="pane-content editor-panel-container">
              <Allotment vertical>
                {/* Editor Area */}
                <Allotment.Pane minSize={200}>
                  <div className="editor-section">
                    <div className="panel-header editor-header">
                      <div className="header-left">
                        <Code2 size={18} />
                        <h3>Code</h3>
                      </div>
                      <LanguageSelector value={language} onChange={handleLanguageChange} />
                    </div>
                    <div className="editor-wrapper">
                      <CodeEditor 
                        value={code} 
                        onChange={setCode} 
                        language={language} 
                      />
                    </div>
                  </div>
                </Allotment.Pane>

                {/* Console / Verdict Area */}
                <Allotment.Pane preferredSize="200" minSize={100}>
                  <div className="console-section">
                    <div className="panel-header console-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <h3>Test Results</h3>
                        <div className="console-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn-ghost" 
                            onClick={() => handleSubmit('run')}
                            disabled={!code.trim() || !!isSubmitting}
                            style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                          >
                            {isSubmitting === 'run' ? 'Running...' : 'Run Code'}
                          </button>
                          <SubmitButton 
                            onSubmit={() => handleSubmit('submit')} 
                            loading={isSubmitting === 'submit'} 
                            disabled={!code.trim() || !!isSubmitting} 
                          />
                        </div>
                      </div>
                      
                      <div className="custom-testcase-toggle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="checkbox" 
                          id="useCustomInput" 
                          checked={useCustomInput}
                          onChange={(e) => setUseCustomInput(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <label htmlFor="useCustomInput" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Use Custom Testcase</label>
                      </div>
                    </div>
                    <div className="console-content">
                      {useCustomInput && (
                        <div className="custom-input-area" style={{ marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Custom Input:</h4>
                          <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Type your custom input here..."
                            style={{
                              width: '100%',
                              minHeight: '100px',
                              background: 'var(--bg-main)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              padding: '0.75rem',
                              fontFamily: 'monospace',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      )}
                      <VerdictDisplay submission={submission} />
                    </div>
                  </div>
                </Allotment.Pane>
              </Allotment>
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};

export default ProblemDetail;
