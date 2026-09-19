import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Trash } from 'lucide-react';
import type { CartTotals } from '../types/product';
import { formatCurrency } from '../utils/formatCurrency';

interface CartSummaryProps {
  totals: CartTotals;
  onClearCart: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ totals, onClearCart }) => {
  const [checkoutSimulated, setCheckoutSimulated] = useState(false);

  const handleCheckout = () => {
    setCheckoutSimulated(true);
    setTimeout(() => {
      setCheckoutSimulated(false);
      alert('Checkout simulation: In production, this would redirect to payment processing.');
    }, 1200);
  };

  return (
    <div className="cart-summary-card">
      <h3 className="summary-title">Order Summary</h3>

      <div className="summary-rows-group">
        <div className="summary-row">
          <span className="summary-label">Total Items</span>
          <span className="summary-val">{totals.totalItemCount}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Subtotal</span>
          <span className="summary-val">{formatCurrency(totals.subtotal)}</span>
        </div>

        <div className="summary-row summary-discount-row">
          <span className="summary-label">Total Discount</span>
          <span className="summary-val discount-val">
            -{formatCurrency(totals.totalDiscount)}
          </span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Delivery Fee</span>
          <span className="summary-val text-success">FREE</span>
        </div>

        <div className="summary-divider" />

        <div className="summary-row final-payable-row">
          <span className="final-payable-label">Final Payable Amount</span>
          <span className="final-payable-val">{formatCurrency(totals.finalPayable)}</span>
        </div>
      </div>

      <div className="summary-actions">
        <button
          type="button"
          className="btn btn-primary btn-checkout"
          onClick={handleCheckout}
          disabled={totals.totalItemCount === 0 || checkoutSimulated}
        >
          {checkoutSimulated ? (
            <>
              <CheckCircle2 size={18} />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-ghost clear-cart-btn"
          onClick={onClearCart}
          disabled={totals.totalItemCount === 0}
        >
          <Trash size={14} />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="summary-trust-badge">
        <ShieldCheck size={16} className="trust-icon" />
        <span>Authentic Products • Safe Delivery • Easy Returns</span>
      </div>
    </div>
  );
};
