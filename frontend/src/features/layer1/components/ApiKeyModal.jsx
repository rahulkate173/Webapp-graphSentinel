import React, { useState, useEffect } from 'react';
import { KeyRound, X, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getApiKey } from '../../auth/services/auth.api';
import './ApiKeyModal.css';

const ApiKeyModal = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await getApiKey();
        setApiKey(res.data.api_key);
      } catch (err) {
        setError('Failed to load your API key. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchKey();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = apiKey ? `${apiKey.substring(0, 8)}${'•'.repeat(24)}${apiKey.substring(apiKey.length - 8)}` : '';

  return (
    <div className="api-modal-overlay" onClick={onClose}>
      <div className="api-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="api-modal__header">
          <div className="api-modal__header-left">
            <div className="api-modal__icon-wrapper">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="api-modal__title">Your API Key</h2>
              <p className="api-modal__subtitle">Use this key to authenticate your API requests</p>
            </div>
          </div>
          <button className="api-modal__close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="api-modal__body">
          {loading ? (
            <div className="api-modal__loading">
              <div className="api-modal__spinner" />
              <span>Fetching your API key...</span>
            </div>
          ) : error ? (
            <div className="api-modal__error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div className="api-modal__warning">
                <AlertCircle size={15} />
                <span>Keep your API key secret. Do not expose it in client-side code or public repositories.</span>
              </div>

              <label className="api-modal__label">API Key</label>
              <div className="api-modal__key-row">
                <div className="api-modal__key-display">
                  <KeyRound size={14} className="api-modal__key-prefix-icon" />
                  <span className="api-modal__key-text">
                    {visible ? apiKey : maskedKey}
                  </span>
                </div>
                <button
                  className="api-modal__action-btn"
                  onClick={() => setVisible(!visible)}
                  title={visible ? 'Hide key' : 'Reveal key'}
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  className={`api-modal__action-btn api-modal__copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="api-modal__usage">
                <p className="api-modal__usage-title">Usage Example</p>
                <div className="api-modal__code-block">
                  <span className="api-code__comment">// HTTP Header</span>
                  <span>x-api-key: <span className="api-code__value">{visible ? apiKey : maskedKey}</span></span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="api-modal__footer">
          <button className="api-modal__done-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
