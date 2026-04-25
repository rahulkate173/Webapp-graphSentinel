import React from 'react';
import { BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetaDataPlaceholder = () => (
  <div className="meta-data__placeholder">
    <div className="meta-data__placeholder-visual">
      <motion.div 
        className="ring ring--1"
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="ring ring--2"
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="core"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
    <motion.span 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Awaiting EDI stream...
    </motion.span>
  </div>
);

const MetaDataPanel = ({ metadata }) => {
  return (
    <div className="meta-data">
      <div className="meta-data__header">
        <div className="meta-data__icon">
          <BarChart2 size={18} strokeWidth={3} />
        </div>
        <h2 className="meta-data__title">Meta Data</h2>
      </div>

      <div className="meta-data__content">
        <AnimatePresence mode="wait">
          {metadata ? (
            <motion.div 
              key="metadata"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="meta-data__terminal"
            >
              <div className="meta-data__terminal-header">Metadata:</div>
              <div className="meta-data__terminal-body">
                <div className="meta-data__terminal-row"><span className="key">sender_id:</span> <span className="value">{metadata.sender_id}</span></div>
                <div className="meta-data__terminal-row"><span className="key">receiver_id:</span> <span className="value">{metadata.receiver_id}</span></div>
                <div className="meta-data__terminal-row"><span className="key">interchange_date:</span> <span className="value">{metadata.interchange_date}</span></div>
                <div className="meta-data__terminal-row"><span className="key">receiver_id:</span> <span className="value">{metadata.receiver_id}</span></div>
                <div className="meta-data__terminal-row"><span className="key">interchange_date:</span> <span className="value">{metadata.interchange_date}</span></div>
                <div className="meta-data__terminal-row"><span className="key">gs_functional_group:</span> <span className="value">{metadata.gs_functional_group}</span></div>
                <div className="meta-data__terminal-row"><span className="key">transaction_set_count:</span> <span className="value">{metadata.transaction_set_count}</span></div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '100%' }}
            >
              <MetaDataPlaceholder />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* <div className="meta-data__footer">
        <div className="meta-data__ai-box">
          <div className="meta-data__ai-icon">
            <span>AI</span>
          </div>
          <p className="meta-data__ai-text">
            AI-assisted field detection is active
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default MetaDataPanel;
