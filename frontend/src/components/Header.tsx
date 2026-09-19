import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Layers } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export const Header: React.FC = () => {
  const { totals } = useCart();
  const location = useLocation();

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="brand-logo" aria-label="Home page">
          <div className="brand-icon-wrapper">
            <Layers className="brand-icon" size={22} />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">ApexStore</span>
            <span className="brand-tagline">Premium Tech Catalog</span>
          </div>
        </Link>

        <nav className="header-nav" aria-label="Main Navigation">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Products
          </Link>

          <Link
            to="/cart"
            className={`cart-button-link ${location.pathname === '/cart' ? 'active' : ''}`}
            aria-label={`Shopping cart with ${totals.totalItemCount} items`}
          >
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} />
              {totals.totalItemCount > 0 && (
                <span className="cart-badge" aria-hidden="true">
                  {totals.totalItemCount}
                </span>
              )}
            </div>
            <span className="cart-label">Cart</span>
            {totals.finalPayable > 0 && (
              <span className="cart-total-preview">
                ₹{totals.finalPayable.toLocaleString('en-IN')}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};
