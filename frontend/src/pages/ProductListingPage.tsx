import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchBrands, fetchCategories } from '../api/productApi';
import type { Product } from '../types/product';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { SortSelect } from '../components/SortSelect';
import { ProductGrid } from '../components/ProductGrid';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Toast, type ToastMessage } from '../components/Toast';

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query state
  const searchQuery = searchParams.get('search') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedOrdering = searchParams.get('ordering') || '';

  // Local state
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Search input with debounce support
  const [searchInput, setSearchInput] = useState<string>(searchQuery);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Load brands and categories once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadMeta() {
      try {
        const [brandList, catList] = await Promise.all([fetchBrands(), fetchCategories()]);
        if (isMounted) {
          setBrands(brandList);
          setCategories(catList);
        }
      } catch (err) {
        console.warn('Could not load brand/category lists:', err);
      }
    }
    loadMeta();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce search query update in URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateFilter('search', searchInput);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Update query params in URL
  const updateFilter = useCallback(
    (key: string, value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value && value.trim()) {
            next.set(key, value.trim());
          } else {
            next.delete(key);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Fetch products whenever filters change
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        search: searchQuery,
        brand: selectedBrand,
        category: selectedCategory,
        ordering: selectedOrdering,
      });
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(
        err.response?.data?.message || 'Unable to connect to product catalog. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedBrand, selectedCategory, selectedOrdering]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const showNotification = (text: string, type: 'success' | 'warning') => {
    setToast({ id: Date.now().toString(), text, type });
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedBrand || selectedCategory || selectedOrdering
  );

  return (
    <div className="catalog-page-container">
      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Hero Header Area */}
      <section className="catalog-hero">
        <div className="hero-text-content">
          <h1 className="hero-heading">Explore Cutting-Edge Tech</h1>
          <p className="hero-subheading">
            Browse our verified inventory of premium electronics, audio gear, wearables, and accessories.
          </p>
        </div>
      </section>

      {/* Controls Bar: Search, Filters, Sort */}
      <section className="catalog-toolbar" aria-label="Catalog search and filters">
        <div className="toolbar-top-row">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by product title, brand, or SKU..."
          />
          <SortSelect
            value={selectedOrdering}
            onChange={(val) => updateFilter('ordering', val)}
          />
        </div>

        <div className="toolbar-bottom-row">
          <FilterPanel
            brands={brands}
            categories={categories}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            onSelectBrand={(val) => updateFilter('brand', val)}
            onSelectCategory={(val) => updateFilter('category', val)}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </section>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <section className="active-filter-chips-bar" aria-label="Active filters">
          <span className="chips-label">Active filters:</span>
          {searchQuery && (
            <span className="filter-chip">
              Search: "{searchQuery}"
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilter('search', '');
                }}
                aria-label="Remove search filter"
              >
                ×
              </button>
            </span>
          )}
          {selectedBrand && (
            <span className="filter-chip">
              Brand: {selectedBrand}
              <button
                type="button"
                onClick={() => updateFilter('brand', '')}
                aria-label="Remove brand filter"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="filter-chip">
              Category: {selectedCategory}
              <button
                type="button"
                onClick={() => updateFilter('category', '')}
                aria-label="Remove category filter"
              >
                ×
              </button>
            </span>
          )}
          {selectedOrdering && (
            <span className="filter-chip">
              Sort: {selectedOrdering.replace('_', ' ')}
              <button
                type="button"
                onClick={() => updateFilter('ordering', '')}
                aria-label="Reset sorting"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            className="clear-all-chips-btn"
            onClick={handleResetFilters}
          >
            Clear all
          </button>
        </section>
      )}

      {/* Main Catalog View States */}
      <main className="catalog-content-area" id="catalog-products">
        {isLoading ? (
          <LoadingState message="Fetching live catalog from database..." />
        ) : error ? (
          <ErrorState
            title="Unable to load catalog"
            message={error}
            onRetry={loadProducts}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No matching products found"
            message="No products match your current search and filter combination. Try adjusting your keywords or clearing filters."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="catalog-results-wrapper">
            <div className="results-count-bar">
              <span className="count-text">
                Showing <strong>{products.length}</strong> product{products.length === 1 ? '' : 's'}
              </span>
            </div>
            <ProductGrid products={products} onNotify={showNotification} />
          </div>
        )}
      </main>
    </div>
  );
};
