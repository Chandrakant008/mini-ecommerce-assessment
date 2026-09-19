import axios from 'axios';
import type { Product, ProductQueryFilters, InventoryCheckResult } from '../types/product';

const defaultHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${defaultHost}:8000/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Fetch list of products with optional combinable filters (search, brand, category, ordering).
 */
export async function fetchProducts(filters: ProductQueryFilters = {}): Promise<Product[]> {
  const params: Record<string, string> = {};

  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.brand && filters.brand !== 'All' && filters.brand !== 'All Brands') {
    params.brand = filters.brand;
  }
  if (filters.category && filters.category !== 'All' && filters.category !== 'All Categories') {
    params.category = filters.category;
  }
  if (filters.ordering) {
    params.ordering = filters.ordering;
  }

  const response = await apiClient.get<Product[]>('/products/', { params });
  return response.data;
}

/**
 * Fetch an individual product by ID.
 */
export async function fetchProductById(id: number | string): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${id}/`);
  return response.data;
}

/**
 * Fetch distinct brands for filter options.
 */
export async function fetchBrands(): Promise<string[]> {
  const response = await apiClient.get<string[]>('/brands/');
  return response.data;
}

/**
 * Fetch distinct categories for filter options.
 */
export async function fetchCategories(): Promise<string[]> {
  const response = await apiClient.get<string[]>('/categories/');
  return response.data;
}

/**
 * Authoritative backend check for inventory availability.
 */
export async function checkInventory(
  productId: number,
  quantity: number
): Promise<InventoryCheckResult> {
  const response = await apiClient.post<InventoryCheckResult>('/inventory/check/', {
    product_id: productId,
    quantity,
  });
  return response.data;
}
