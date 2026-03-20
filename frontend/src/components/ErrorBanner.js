import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ErrorBanner.css';

const ErrorBanner = ({ message, onDismiss }) => (
  <div className="error-banner">
    <div className="container error-inner">
      <AlertTriangle size={18} />
      <p className="error-msg">{message}</p>
      {onDismiss && (
        <button className="error-close" onClick={onDismiss}>
          <X size={16} />
        </button>
      )}
    </div>
  </div>
);

export default ErrorBanner;
