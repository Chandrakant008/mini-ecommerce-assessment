import React from 'react';
import type { Product } from '../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onNotify?: (text: string, type: 'success' | 'warning') => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onNotify }) => {
  return (
    <div className="product-grid" role="list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onNotify={onNotify} />
      ))}
    </div>
  );
};
