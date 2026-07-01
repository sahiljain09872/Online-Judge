import React from 'react';
import { Play, Loader2 } from 'lucide-react';

const SubmitButton = ({ onSubmit, loading, disabled }) => {
  return (
    <button 
      className="btn-success submit-btn" 
      onClick={onSubmit}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="spinner-icon" />
          <span>Submitting...</span>
        </>
      ) : (
        <>
          <Play size={16} />
          <span>Submit Code</span>
        </>
      )}
    </button>
  );
};

export default SubmitButton;
