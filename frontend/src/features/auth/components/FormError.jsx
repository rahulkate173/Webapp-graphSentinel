import React from 'react';

const FormError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="global-error">
      {message}
    </div>
  );
};

export default FormError;
