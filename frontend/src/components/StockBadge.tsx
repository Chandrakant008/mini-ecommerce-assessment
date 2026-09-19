import React from 'react';
import { getStockStatus } from '../utils/cartCalculations';

interface StockBadgeProps {
  stock: number;
  showCount?: boolean;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock, showCount = false }) => {
  const { status, badgeVariant } = getStockStatus(stock);

  let variantClass = 'stock-badge-success';
  if (badgeVariant === 'warning') {
    variantClass = 'stock-badge-warning';
  } else if (badgeVariant === 'danger') {
    variantClass = 'stock-badge-danger';
  }

  return (
    <span
      className={`stock-badge ${variantClass}`}
      role="status"
      aria-label={`Stock availability: ${status}`}
    >
      <span className="stock-dot" aria-hidden="true" />
      <span className="stock-text">{status}</span>
      {showCount && stock > 0 && stock <= 2 && (
        <span className="stock-count-label">({stock} left)</span>
      )}
    </span>
  );
};
