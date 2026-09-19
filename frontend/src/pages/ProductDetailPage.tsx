import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCw,
  Package,
} from 'lucide-react';
import { fetchProductById, checkInventory } from '../api/productApi';
import type { Product } from '../types/product';
import { StockBadge } from '../components/StockBadge';
import { QuantitySelector } from '../components/QuantitySelector';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../hooks/useCart';
import { Toast, type ToastMessage } from '../components/Toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { items, addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(id);
        if (isMounted) {
          setProduct(data);
          setQuantity(data.stock > 0 ? 1 : 0);
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.response?.status === 404) {
            setError('Product not found. The item may have been removed or does not exist.');
          } else {
            setError(
              err.response?.data?.message || 'Failed to load product details. Please try again.'
            );
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <LoadingState message="Loading detailed product specifications..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-wrapper">
        <ErrorState
          title="Product Unavailable"
          message={error || 'Unable to display this product.'}
        />
        <div className="back-link-wrapper">
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate cart state for this item
  const inCartItem = items.find((i) => i.product.id === product.id);
  const cartQty = inCartItem ? inCartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const remainingStock = Math.max(0, product.stock - cartQty);
  const isMaxInCart = product.stock > 0 && cartQty >= product.stock;

  const handleAddToCart = async () => {
    if (isOutOfStock || isMaxInCart || isAdding) return;

    setIsAdding(true);
    try {
      // 1. Authoritative Backend Inventory Verification
      const checkRes = await checkInventory(product.id, quantity);
      if (!checkRes.can_purchase) {
        setToast({
          id: Date.now().toString(),
          type: 'warning',
          text: checkRes.message || 'Inventory check failed.',
        });
        setIsAdding(false);
        return;
      }

      // 2. Add to Local Cart Context
      const result = addToCart(product, quantity);
      if (result.success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          text: result.message,
        });
      } else {
        setToast({
          id: Date.now().toString(),
          type: 'warning',
          text: result.message,
        });
      }
    } catch (err: any) {
      console.error('Inventory verification failed:', err);
      // Fallback: add locally if network glitch on check endpoint
      const result = addToCart(product, quantity);
      setToast({
        id: Date.now().toString(),
        type: result.success ? 'success' : 'warning',
        text: result.message,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const specsList = Object.entries(product.specifications || {});

  return (
    <div className="product-detail-page">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Breadcrumb / Back Navigation */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="breadcrumb-back-link">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-category">{product.category}</span>
        {product.subcategory && (
          <>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-subcategory">{product.subcategory}</span>
          </>
        )}
      </nav>

      {/* Two-Column Detail Layout */}
      <div className="product-detail-layout">
        {/* Left Column: Product Image */}
        <div className="detail-media-column">
          <div className="detail-image-card">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="detail-large-image"
              />
            ) : (
              <div className="detail-image-placeholder">
                <Package size={64} />
                <span>No product image available</span>
              </div>
            )}
            {product.discount_percentage > 0 && (
              <span className="detail-discount-badge">
                {product.discount_percentage}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Information & Purchase Area */}
        <div className="detail-info-column">
          <div className="detail-brand-row">
            <span className="detail-brand-badge">{product.brand}</span>
            <span className="detail-sku-badge">SKU: {product.sku}</span>
          </div>

          <h1 className="detail-product-title">{product.name}</h1>

          {/* Stock Badge & Availability */}
          <div className="detail-stock-row">
            <StockBadge stock={product.stock} showCount />
            <span className="stock-units-info">
              {product.stock === 0 ? (
                <span className="text-danger font-medium">Currently unavailable</span>
              ) : (
                <span>
                  <strong>{product.stock}</strong> units currently in warehouse
                </span>
              )}
            </span>
          </div>

          {/* Pricing Box */}
          <div className="detail-pricing-box">
            <div className="detail-price-main">
              <span className="detail-selling-price">
                {formatCurrency(product.selling_price)}
              </span>
              {Number(product.mrp) > Number(product.selling_price) && (
                <div className="detail-mrp-group">
                  <span className="detail-mrp-label">MRP:</span>
                  <span className="detail-mrp-strikethrough">
                    {formatCurrency(product.mrp)}
                  </span>
                </div>
              )}
            </div>
            {product.discount_percentage > 0 && (
              <p className="detail-savings-text">
                You save{' '}
                <strong>
                  {formatCurrency(Number(product.mrp) - Number(product.selling_price))}
                </strong>{' '}
                ({product.discount_percentage}% discount)
              </p>
            )}
          </div>

          {/* Purchase Control Area */}
          <div className="detail-actions-card">
            <div className="quantity-selection-group">
              <label className="quantity-label" htmlFor="product-qty-stepper">
                Quantity:
              </label>
              {isOutOfStock ? (
                <span className="text-muted">Item is out of stock</span>
              ) : (
                <div className="qty-picker-container" id="product-qty-stepper">
                  <QuantitySelector
                    quantity={quantity}
                    maxStock={remainingStock > 0 ? remainingStock : product.stock}
                    onChange={setQuantity}
                    disabled={isOutOfStock || isMaxInCart}
                    size="lg"
                  />
                  {isMaxInCart && (
                    <span className="qty-limit-warning">
                      Max available stock ({product.stock}) already in your cart!
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="action-button-group">
              <button
                type="button"
                className={`btn btn-lg btn-detail-add ${
                  isOutOfStock
                    ? 'btn-disabled'
                    : isMaxInCart
                    ? 'btn-max-reached'
                    : justAdded
                    ? 'btn-just-added'
                    : 'btn-primary'
                }`}
                onClick={handleAddToCart}
                disabled={isOutOfStock || isMaxInCart || isAdding}
                aria-label={
                  isOutOfStock
                    ? 'Out of stock'
                    : isMaxInCart
                    ? 'Maximum stock reached in cart'
                    : 'Add to Cart'
                }
              >
                {isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : justAdded ? (
                  <>
                    <Check size={20} />
                    <span>Added to Cart!</span>
                  </>
                ) : isMaxInCart ? (
                  <span>Max Quantity in Cart</span>
                ) : isAdding ? (
                  <span>Verifying Stock...</span>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <Link to="/cart" className="btn btn-lg btn-secondary">
                View Cart ({cartQty} in cart)
              </Link>
            </div>
          </div>

          {/* Value Props / Assurance */}
          <div className="detail-guarantees-grid">
            <div className="guarantee-item">
              <Truck size={18} className="guarantee-icon" />
              <div>
                <span className="guarantee-title">Express Delivery</span>
                <span className="guarantee-desc">Dispatched within 24 hours</span>
              </div>
            </div>
            <div className="guarantee-item">
              <ShieldCheck size={18} className="guarantee-icon" />
              <div>
                <span className="guarantee-title">100% Genuine</span>
                <span className="guarantee-desc">Direct from authorized brands</span>
              </div>
            </div>
            <div className="guarantee-item">
              <RotateCw size={18} className="guarantee-icon" />
              <div>
                <span className="guarantee-title">7-Day Return</span>
                <span className="guarantee-desc">Hassle-free replacement</span>
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          {specsList.length > 0 && (
            <div className="detail-specs-card">
              <h2 className="specs-heading">Product Specifications</h2>
              <table className="specs-table">
                <tbody>
                  {specsList.map(([key, value]) => (
                    <tr key={key} className="specs-row">
                      <th className="specs-key">{key}</th>
                      <td className="specs-value">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
