import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import type { Product } from '../types/product';
import { StockBadge } from './StockBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: Product;
  onNotify?: (text: string, type: 'success' | 'warning') => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNotify }) => {
  const { items, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  // Check how many of this product are currently in the cart
  const cartItem = items.find((i) => i.product.id === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = cartQty >= product.stock && product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const result = addToCart(product, 1);
    if (result.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
      if (onNotify) onNotify(result.message, 'success');
    } else {
      if (onNotify) onNotify(result.message, 'warning');
    }
  };

  return (
    <article className={`product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}>
      {/* Product Image Area */}
      <Link to={`/products/${product.id}`} className="card-image-link" tabIndex={-1}>
        <div className="card-image-container">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
              loading="lazy"
              onError={(e) => {
                // Fallback placeholder on image load failure
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="image-placeholder">
              <span>No image</span>
            </div>
          )}

          {/* Discount Badge overlay */}
          {product.discount_percentage > 0 && (
            <span className="card-discount-badge">
              {product.discount_percentage}% OFF
            </span>
          )}
        </div>
      </Link>

      {/* Product Info Area */}
      <div className="card-content">
        <div className="card-meta">
          <span className="product-brand">{product.brand}</span>
          <StockBadge stock={product.stock} />
        </div>

        <h3 className="product-title">
          <Link to={`/products/${product.id}`} className="product-title-link">
            {product.name}
          </Link>
        </h3>

        {/* Pricing Area */}
        <div className="pricing-row">
          <div className="price-group">
            <span className="selling-price">{formatCurrency(product.selling_price)}</span>
            {Number(product.mrp) > Number(product.selling_price) && (
              <span className="mrp-price">{formatCurrency(product.mrp)}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="card-action-row">
          <button
            type="button"
            className={`btn btn-add-to-cart ${
              isOutOfStock
                ? 'btn-disabled'
                : isMaxInCart
                ? 'btn-max-reached'
                : justAdded
                ? 'btn-just-added'
                : 'btn-primary'
            }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxInCart}
            aria-label={
              isOutOfStock
                ? `${product.name} is out of stock`
                : isMaxInCart
                ? `${product.name} max quantity reached in cart`
                : `Add ${product.name} to cart`
            }
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : justAdded ? (
              <>
                <Check size={16} />
                <span>Added!</span>
              </>
            ) : isMaxInCart ? (
              <span>Max in Cart ({cartQty})</span>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
