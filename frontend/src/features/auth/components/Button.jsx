import React from 'react';

const Button = ({ children, loading, disabled, ...props }) => {
  return (
    <button 
      className="btn-primary" 
      disabled={loading || disabled} 
      {...props}
    >
      {loading && <div className="btn-spinner"></div>}
      {children}
    </button>
  );
};

export default Button;
