import React from 'react';
import { ArrowDownUp } from 'lucide-react';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const SortSelect: React.FC<SortSelectProps> = ({ value, onChange }) => {
  return (
    <div className="sort-select-wrapper">
      <ArrowDownUp size={15} className="sort-icon" aria-hidden="true" />
      <label htmlFor="sort-by-select" className="sr-only">
        Sort Products
      </label>
      <select
        id="sort-by-select"
        className="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Sort: Featured / Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Product Name: A to Z</option>
      </select>
    </div>
  );
};
