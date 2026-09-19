import type { CartItemType, CartTotals } from '../types/product';

/**
 * Reusable inventory status evaluation matching assessment rules:
 * Stock = 0: "Out of Stock", canPurchase: false
 * Stock = 1 or 2: "Only Few Left", canPurchase: true
 * Stock >= 3: "In Stock", canPurchase: true
 */
export function getStockStatus(stock: number): { status: string; canPurchase: boolean; badgeVariant: 'danger' | 'warning' | 'success' } {
  if (stock <= 0) {
    return { status: 'Out of Stock', canPurchase: false, badgeVariant: 'danger' };
  } else if (stock === 1 || stock === 2) {
    return { status: 'Only Few Left', canPurchase: true, badgeVariant: 'warning' };
  } else {
    return { status: 'In Stock', canPurchase: true, badgeVariant: 'success' };
  }
}

/**
 * Calculates line total for a single cart item:
 * line_total = selling_price * quantity
 */
export function calculateLineTotal(sellingPrice: number | string, quantity: number): number {
  const price = typeof sellingPrice === 'string' ? parseFloat(sellingPrice) : sellingPrice;
  return Math.max(0, (isNaN(price) ? 0 : price) * Math.max(0, quantity));
}

/**
 * Calculates line discount for a single cart item:
 * line_discount = (MRP - selling_price) * quantity
 */
export function calculateLineDiscount(
  mrp: number | string,
  sellingPrice: number | string,
  quantity: number
): number {
  const m = typeof mrp === 'string' ? parseFloat(mrp) : mrp;
  const sp = typeof sellingPrice === 'string' ? parseFloat(sellingPrice) : sellingPrice;
  const safeMrp = isNaN(m) ? 0 : m;
  const safeSp = isNaN(sp) ? 0 : sp;
  const diff = Math.max(0, safeMrp - safeSp);
  return diff * Math.max(0, quantity);
}

/**
 * Centralized cart total calculation engine:
 * subtotal = sum(line_total)
 * total_discount = sum(line_discount)
 * final_payable = subtotal
 */
export function calculateCartTotals(items: CartItemType[]): CartTotals {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalItemCount = 0;

  for (const item of items) {
    const qty = item.quantity;
    totalItemCount += qty;
    subtotal += calculateLineTotal(item.product.selling_price, qty);
    totalDiscount += calculateLineDiscount(item.product.mrp, item.product.selling_price, qty);
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    finalPayable: Math.round(subtotal * 100) / 100,
    totalItemCount,
  };
}
