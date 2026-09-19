import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading products...',
}) => {
  return (
    <div className="state-container loading-state" role="status" aria-live="polite">
      <div className="spinner-wrapper">
        <Loader2 className="spinning-icon" size={36} />
      </div>
      <p className="state-message">{message}</p>
    </div>
  );
};
