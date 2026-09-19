import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  brands: string[];
  categories: string[];
  selectedBrand: string;
  selectedCategory: string;
  onSelectBrand: (brand: string) => void;
  onSelectCategory: (category: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  brands,
  categories,
  selectedBrand,
  selectedCategory,
  onSelectBrand,
  onSelectCategory,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-title-group">
          <Filter size={16} aria-hidden="true" />
          <span className="filter-title">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="reset-filters-btn"
            onClick={onReset}
            title="Reset all filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="filter-controls-group">
        {/* Brand Filter */}
        <div className="filter-field">
          <label htmlFor="brand-filter-select" className="filter-label">
            Brand
          </label>
          <select
            id="brand-filter-select"
            className="filter-select"
            value={selectedBrand}
            onChange={(e) => onSelectBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="filter-field">
          <label htmlFor="category-filter-select" className="filter-label">
            Category
          </label>
          <select
            id="category-filter-select"
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
