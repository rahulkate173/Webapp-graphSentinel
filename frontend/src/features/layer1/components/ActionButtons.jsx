import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActionButtons = () => {
  const navigate = useNavigate();
  return (
    <div className="action-buttons">
      <div className="action-buttons__container">
        <button className="action-buttons__purple">
          <Sparkles size={24} fill="white" className="text-white" />
        </button>
        
        <button onClick={() => navigate('/parsing-layer')} className="action-buttons__green">
          <Zap size={20} fill="white" />
          <span>Go to parser</span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
