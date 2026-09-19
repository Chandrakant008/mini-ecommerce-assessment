import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  message = 'Try changing your search keywords or clearing active filters.',
  actionText,
  onAction,
}) => {
  return (
    <div className="state-container empty-state">
      <div className="state-icon-wrapper">
        <PackageOpen size={48} className="empty-icon" />
      </div>
      <h2 className="state-title">{title}</h2>
      <p className="state-message">{message}</p>
      {actionText && onAction && (
        <button type="button" className="btn btn-primary state-action-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
