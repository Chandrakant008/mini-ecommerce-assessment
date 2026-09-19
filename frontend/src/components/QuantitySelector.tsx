import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  maxStock,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const isMin = quantity <= 1;
  const isMax = quantity >= maxStock || maxStock <= 0;

  const handleDecrement = () => {
    if (!isMin && !disabled) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (!isMax && !disabled) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className={`quantity-selector quantity-selector-${size}`}>
      <button
        type="button"
        className="qty-btn qty-btn-minus"
        onClick={handleDecrement}
        disabled={isMin || disabled}
        aria-label="Decrease quantity"
        title={isMin ? 'Minimum quantity is 1' : 'Decrease quantity'}
      >
        <Minus size={size === 'sm' ? 14 : 16} />
      </button>

      <span className="qty-value" aria-live="polite" aria-label={`Selected quantity ${quantity}`}>
        {quantity}
      </span>

      <button
        type="button"
        className="qty-btn qty-btn-plus"
        onClick={handleIncrement}
        disabled={isMax || disabled}
        aria-label="Increase quantity"
        title={isMax ? `Maximum available stock is ${maxStock}` : 'Increase quantity'}
      >
        <Plus size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  );
};
