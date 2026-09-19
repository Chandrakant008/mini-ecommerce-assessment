import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { CartItemType } from '../types/product';
import { QuantitySelector } from './QuantitySelector';
import { StockBadge } from './StockBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateLineTotal, calculateLineDiscount } from '../utils/cartCalculations';

interface CartItemProps {
  item: CartItemType;
  onSetQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onSetQuantity,
  onRemove,
}) => {
  const { product, quantity } = item;
  const lineTotal = calculateLineTotal(product.selling_price, quantity);
  const lineDiscount = calculateLineDiscount(product.mrp, product.selling_price, quantity);

  return (
    <div className="cart-item-row">
      {/* Thumbnail */}
      <Link to={`/products/${product.id}`} className="cart-item-thumb-link">
        <div className="cart-item-thumb-wrapper">
          {product.image ? (
            <img src={product.image} alt={product.name} className="cart-item-thumb" />
          ) : (
            <div className="cart-thumb-placeholder">No Image</div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="cart-item-info">
        <div className="cart-item-header">
          <span className="cart-item-brand">{product.brand}</span>
          <StockBadge stock={product.stock} showCount />
        </div>

        <h4 className="cart-item-title">
          <Link to={`/products/${product.id}`} className="cart-item-title-link">
            {product.name}
          </Link>
        </h4>

        <div className="cart-item-unit-price">
          <span className="unit-price-label">Unit Price:</span>
          <span className="unit-price-val">{formatCurrency(product.selling_price)}</span>
          {Number(product.mrp) > Number(product.selling_price) && (
            <span className="unit-mrp-val">{formatCurrency(product.mrp)}</span>
          )}
        </div>

        {/* Mobile Line Total & Savings */}
        <div className="cart-item-mobile-subtotal">
          <span className="mobile-subtotal-label">Subtotal:</span>
          <span className="mobile-subtotal-val">{formatCurrency(lineTotal)}</span>
          {lineDiscount > 0 && (
            <span className="mobile-discount-val">({formatCurrency(lineDiscount)} off)</span>
          )}
        </div>

        {/* Stepper + Remove on Mobile */}
        <div className="cart-item-controls-mobile">
          <QuantitySelector
            quantity={quantity}
            maxStock={product.stock}
            onChange={(newQty) => onSetQuantity(product.id, newQty)}
            size="sm"
          />
          <button
            type="button"
            className="cart-remove-btn"
            onClick={() => onRemove(product.id)}
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 size={16} />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Desktop Quantity Stepper */}
      <div className="cart-item-quantity-desktop desktop-only">
        <QuantitySelector
          quantity={quantity}
          maxStock={product.stock}
          onChange={(newQty) => onSetQuantity(product.id, newQty)}
          size="md"
        />
        {quantity >= product.stock && product.stock > 0 && (
          <span className="max-stock-hint">Max stock reached</span>
        )}
      </div>

      {/* Line Total & Remove on Desktop */}
      <div className="cart-item-pricing-desktop desktop-only">
        <div className="line-total-amount">{formatCurrency(lineTotal)}</div>
        {lineDiscount > 0 && (
          <div className="line-discount-amount">Saved {formatCurrency(lineDiscount)}</div>
        )}
        <button
          type="button"
          className="cart-remove-btn"
          onClick={() => onRemove(product.id)}
          aria-label={`Remove ${product.name} from cart`}
          title="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
