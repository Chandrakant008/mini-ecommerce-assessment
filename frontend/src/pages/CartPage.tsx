import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/CartItem';
import { CartSummary } from '../components/CartSummary';
import { EmptyState } from '../components/EmptyState';
import { Toast, type ToastMessage } from '../components/Toast';

export const CartPage: React.FC = () => {
  const {
    items,
    totals,
    removeFromCart,
    setQuantity,
    clearCart,
  } = useCart();

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleSetQuantity = (id: number, qty: number) => {
    const res = setQuantity(id, qty);
    if (!res.success) {
      setToast({ id: Date.now().toString(), text: res.message, type: 'warning' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page-container empty-cart-wrapper">
        <EmptyState
          title="Your cart is empty"
          message="Looks like you haven't added any items to your shopping cart yet."
          actionText="Start Shopping"
          onAction={() => {
            window.location.href = '/';
          }}
        />
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Cart Page Header */}
      <div className="cart-page-header">
        <div className="cart-header-left">
          <Link to="/" className="btn-back-shopping">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="cart-title">
            Shopping Cart <span className="cart-item-count">({totals.totalItemCount} items)</span>
          </h1>
        </div>
      </div>

      {/* Cart Two-Column Layout */}
      <div className="cart-grid-layout">
        {/* Left: Cart Items List */}
        <div className="cart-items-column">
          <div className="cart-items-card">
            <div className="cart-list-header desktop-only">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
            </div>

            <div className="cart-items-list">
              {items.map((item) => (
                <CartItem
                  key={item.product.id}
                  item={item}
                  onSetQuantity={handleSetQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="cart-summary-column">
          <CartSummary totals={totals} onClearCart={clearCart} />
        </div>
      </div>
    </div>
  );
};
