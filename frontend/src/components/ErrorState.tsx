import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load products',
  message = 'Something went wrong while connecting to the backend service. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="state-container error-state" role="alert">
      <div className="state-icon-wrapper error-icon-wrapper">
        <AlertCircle size={44} className="error-icon" />
      </div>
      <h2 className="state-title">{title}</h2>
      <p className="state-message">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary state-action-btn" onClick={onRetry}>
          <RotateCcw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
