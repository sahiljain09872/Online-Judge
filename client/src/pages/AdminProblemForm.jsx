import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { adminService } from '../services/adminService';
import { PlusCircle, Trash2, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProblemForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = slug && slug !== 'new';
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [problemId, setProblemId] = useState(null);

  // Problem Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    statement: '',
    difficulty: 'Medium',
    sampleInput: '',
    sampleOutput: '',
    constraints: ''
  });

  // Test Cases State
  const [testCases, setTestCases] = useState([]);
  
  // New test case input state
  const [newTestCase, setNewTestCase] = useState({
    input: '',
    output: '',
    isHidden: true
  });

  useEffect(() => {
    if (isEditing) {
      const fetchProblemDetails = async () => {
        try {
          const problem = await problemService.getProblem(slug);
          setProblemId(problem._id);
          setFormData({
            name: problem.name,
            code: problem.code,
            statement: problem.statement,
            difficulty: problem.difficulty,
            sampleInput: problem.sampleInput || '',
            sampleOutput: problem.sampleOutput || '',
            constraints: problem.constraints || ''
          });

          // Fetch test cases
          const tcs = await adminService.getTestCases(problem._id);
          setTestCases(tcs);
        } catch (error) {
          toast.error('Failed to load problem details');
          navigate('/admin');
        } finally {
          setLoading(false);
        }
      };
      fetchProblemDetails();
    }
  }, [slug, navigate, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTestCase = () => {
    if (!newTestCase.input || !newTestCase.output) {
      toast.error('Test case input and output are required');
      return;
    }
    setTestCases([...testCases, { ...newTestCase }]);
    setNewTestCase({ input: '', output: '', isHidden: true });
  };

  const handleRemoveTestCase = (indexToRemove) => {
    setTestCases(testCases.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let currentProblemId = problemId;

      // 1. Create or Update Problem
      if (isEditing) {
        await adminService.updateProblem(problemId, formData);
        toast.success('Problem updated successfully');
      } else {
        const newProblem = await adminService.createProblem(formData);
        currentProblemId = newProblem.data._id;
        toast.success('Problem created successfully');
      }

      // 2. We skip updating existing test cases for simplicity in V1 
      // (a real system would diff them, but here we just add new ones that lack an _id)
      const newTcs = testCases.filter(tc => !tc._id);
      
      for (const tc of newTcs) {
        await adminService.addTestCase(currentProblemId, tc);
      }
      
      if (newTcs.length > 0) {
        toast.success(`Added ${newTcs.length} new test cases`);
      }

      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save problem');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn-ghost mb-6" onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="card">
        <h1 className="mb-6">{isEditing ? 'Edit Problem' : 'Create New Problem'}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="form-label">Problem Name *</label>
            <input 
              type="text" 
              className="form-control" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
              placeholder="e.g. Two Sum"
            />
          </div>

          <div className="form-group mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Unique Code (Slug) *</label>
              <input 
                type="text" 
                className="form-control" 
                name="code" 
                value={formData.code} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. two-sum"
                disabled={isEditing} // usually don't change slug after creation
              />
            </div>
            <div>
              <label className="form-label">Difficulty *</label>
              <select 
                className="form-control" 
                name="difficulty" 
                value={formData.difficulty} 
                onChange={handleInputChange}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Problem Statement (Markdown) *</label>
            <textarea 
              className="form-control" 
              name="statement" 
              value={formData.statement} 
              onChange={handleInputChange} 
              required 
              rows="8"
              placeholder="Describe the problem here..."
            />
          </div>

          <div className="form-group mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Sample Input</label>
              <textarea 
                className="form-control" 
                name="sampleInput" 
                value={formData.sampleInput} 
                onChange={handleInputChange} 
                rows="3"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label className="form-label">Sample Output</label>
              <textarea 
                className="form-control" 
                name="sampleOutput" 
                value={formData.sampleOutput} 
                onChange={handleInputChange} 
                rows="3"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div className="form-group mb-8">
            <label className="form-label">Constraints</label>
            <input 
              type="text" 
              className="form-control" 
              name="constraints" 
              value={formData.constraints} 
              onChange={handleInputChange} 
              placeholder="e.g. 1 <= N <= 10^5"
            />
          </div>

          <hr className="mb-8" style={{ borderColor: 'var(--border)' }} />

          {/* Test Cases Section */}
          <h2 className="mb-4">Test Cases</h2>
          
          <div className="test-cases-list mb-6">
            {testCases.length === 0 ? (
              <p className="text-muted italic">No test cases added yet. Add at least one.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {testCases.map((tc, index) => (
                  <div key={index} style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative' }}>
                    <button 
                      type="button"
                      onClick={() => handleRemoveTestCase(index)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                      title="Remove Test Case"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="mb-2 font-bold flex items-center gap-2">
                      Test Case #{index + 1} 
                      {tc.isHidden ? <span className="badge badge-warning" style={{fontSize:'0.7rem'}}>Hidden</span> : <span className="badge badge-success" style={{fontSize:'0.7rem'}}>Visible</span>}
                      {tc._id && <span className="text-muted" style={{fontSize:'0.7rem'}}>(Saved)</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <pre style={{ margin: 0, padding: '0.5rem', background: 'var(--background)', borderRadius: '4px', fontSize: '0.875rem' }}>{tc.input}</pre>
                      <pre style={{ margin: 0, padding: '0.5rem', background: 'var(--background)', borderRadius: '4px', fontSize: '0.875rem' }}>{tc.output}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="add-test-case-box" style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '8px', border: '1px dashed var(--border)', marginBottom: '2rem' }}>
            <h4 className="mb-3">Add New Test Case</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.875rem' }}>Input</label>
                <textarea 
                  className="form-control" 
                  value={newTestCase.input} 
                  onChange={(e) => setNewTestCase({...newTestCase, input: e.target.value})}
                  rows="3"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.875rem' }}>Expected Output</label>
                <textarea 
                  className="form-control" 
                  value={newTestCase.output} 
                  onChange={(e) => setNewTestCase({...newTestCase, output: e.target.value})}
                  rows="3"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={newTestCase.isHidden}
                  onChange={(e) => setNewTestCase({...newTestCase, isHidden: e.target.checked})}
                />
                Hidden Test Case (Don't show to users)
              </label>
              <button type="button" className="btn-secondary" onClick={handleAddTestCase} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={16} /> Add Test Case
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
            <Save size={18} />
            {submitting ? 'Saving...' : (isEditing ? 'Update Problem' : 'Publish Problem')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProblemForm;
