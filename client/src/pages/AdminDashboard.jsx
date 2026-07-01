import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { problemService } from '../services/problemService';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      const res = await problemService.getProblems();
      setProblems(res.data || []);
    } catch (error) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will also delete all associated test cases and submissions.`)) {
      try {
        await adminService.deleteProblem(id);
        toast.success('Problem deleted successfully');
        fetchProblems(); // Refresh the list
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete problem');
      }
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted">Manage platform problems and test cases.</p>
        </div>
        <Link to="/admin/problem/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} />
          Create New Problem
        </Link>
      </div>

      <div className="table-container mt-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Problem Name</th>
              <th>Difficulty</th>
              <th>Created At</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">No problems found.</td>
              </tr>
            ) : (
              problems.map((problem) => (
                <tr key={problem._id}>
                  <td>
                    <Link to={`/problems/${problem.code}`} className="user-link font-bold">
                      {problem.name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td>{new Date(problem.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <Link to={`/admin/problem/${problem.code}`} className="btn-ghost" style={{ padding: '0.5rem', marginRight: '0.5rem' }} title="Edit">
                      <Edit size={18} className="text-primary" />
                    </Link>
                    <button onClick={() => handleDelete(problem._id, problem.name)} className="btn-ghost" style={{ padding: '0.5rem' }} title="Delete">
                      <Trash2 size={18} className="text-error" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
