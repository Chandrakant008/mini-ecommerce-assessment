export interface Product {
  id: number;
  sku: string;
  barcode?: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  mrp: string | number;
  selling_price: string | number;
  discount_percentage: number;
  stock: number;
  stock_status: 'Out of Stock' | 'Only Few Left' | 'In Stock' | string;
  can_purchase: boolean;
  image: string;
  specifications: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface CartItemType {
  product: Product;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  totalDiscount: number;
  finalPayable: number;
  totalItemCount: number;
}

export interface InventoryCheckResult {
  product_id: number;
  requested_quantity: number;
  available_stock: number;
  can_purchase: boolean;
  stock_status: string;
  message: string;
}

export interface ProductQueryFilters {
  search?: string;
  brand?: string;
  category?: string;
  ordering?: string;
}
