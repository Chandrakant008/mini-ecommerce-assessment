import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import type { Product, CartItemType, CartTotals } from '../types/product';
import { calculateCartTotals } from '../utils/cartCalculations';

interface CartState {
  items: CartItemType[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'INCREASE_QUANTITY'; payload: { productId: number } }
  | { type: 'DECREASE_QUANTITY'; payload: { productId: number } }
  | { type: 'SET_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { items: CartItemType[] } };

export interface CartContextValue {
  items: CartItemType[];
  totals: CartTotals;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => { success: boolean; message: string };
  decreaseQuantity: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;
}

const CART_STORAGE_KEY = 'mini_ecommerce_cart_v1';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
      return { items: action.payload.items };

    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      if (product.stock <= 0) {
        return state;
      }

      const existingIndex = state.items.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const currentItem = state.items[existingIndex];
        const newQuantity = Math.min(product.stock, currentItem.quantity + quantity);
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...currentItem,
          product, // keep fresh product details
          quantity: newQuantity,
        };
        return { items: updatedItems };
      } else {
        const safeQuantity = Math.min(product.stock, Math.max(1, quantity));
        return {
          items: [...state.items, { product, quantity: safeQuantity }],
        };
      }
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((item) => item.product.id !== action.payload.productId),
      };

    case 'INCREASE_QUANTITY': {
      return {
        items: state.items.map((item) => {
          if (item.product.id === action.payload.productId) {
            if (item.quantity < item.product.stock) {
              return { ...item, quantity: item.quantity + 1 };
            }
          }
          return item;
        }),
      };
    }

    case 'DECREASE_QUANTITY': {
      return {
        items: state.items
          .map((item) => {
            if (item.product.id === action.payload.productId) {
              return { ...item, quantity: item.quantity - 1 };
            }
            return item;
          })
          .filter((item) => item.quantity > 0),
      };
    }

    case 'SET_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.product.id !== productId),
        };
      }
      return {
        items: state.items.map((item) => {
          if (item.product.id === productId) {
            const cappedQty = Math.min(item.product.stock, quantity);
            return { ...item, quantity: cappedQty };
          }
          return item;
        }),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // 1. Initial hydration from localStorage with safety checks
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Validate restored item structure and non-negative stock
          const validItems: CartItemType[] = parsed
            .filter((item: any) => item && item.product && item.product.id && item.quantity > 0)
            .map((item: any) => ({
              product: item.product,
              quantity: Math.min(item.product.stock || 999, item.quantity),
            }))
            .filter((item: CartItemType) => item.product.stock > 0);

          dispatch({ type: 'LOAD_CART', payload: { items: validItems } });
        }
      }
    } catch (e) {
      console.warn('Failed to parse cart from localStorage, initializing empty.', e);
    }
  }, []);

  // 2. Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [state.items]);

  // Centralized calculations
  const totals = useMemo(() => calculateCartTotals(state.items), [state.items]);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (product.stock <= 0) {
      return { success: false, message: `"${product.name}" is out of stock.` };
    }

    const existing = state.items.find((item) => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty >= product.stock) {
      return {
        success: false,
        message: `Cannot add more. You have reached the maximum available stock (${product.stock}).`,
      };
    }

    const availableToAdd = product.stock - currentQty;
    const finalQuantity = Math.min(quantity, availableToAdd);

    dispatch({ type: 'ADD_ITEM', payload: { product, quantity: finalQuantity } });

    if (finalQuantity < quantity) {
      return {
        success: true,
        message: `Added ${finalQuantity} item(s). Max available stock reached.`,
      };
    }

    return {
      success: true,
      message: `Added ${product.name} to cart.`,
    };
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const increaseQuantity = (productId: number): { success: boolean; message: string } => {
    const item = state.items.find((i) => i.product.id === productId);
    if (!item) return { success: false, message: 'Item not found in cart.' };

    if (item.quantity >= item.product.stock) {
      return {
        success: false,
        message: `Cannot add more. Only ${item.product.stock} available in stock.`,
      };
    }

    dispatch({ type: 'INCREASE_QUANTITY', payload: { productId } });
    return { success: true, message: 'Quantity increased.' };
  };

  const decreaseQuantity = (productId: number) => {
    dispatch({ type: 'DECREASE_QUANTITY', payload: { productId } });
  };

  const setQuantity = (productId: number, quantity: number): { success: boolean; message: string } => {
    const item = state.items.find((i) => i.product.id === productId);
    if (!item) return { success: false, message: 'Item not in cart.' };

    if (quantity > item.product.stock) {
      dispatch({ type: 'SET_QUANTITY', payload: { productId, quantity: item.product.stock } });
      return {
        success: false,
        message: `Quantity adjusted to maximum available stock (${item.product.stock}).`,
      };
    }

    dispatch({ type: 'SET_QUANTITY', payload: { productId, quantity } });
    return { success: true, message: 'Quantity updated.' };
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = useMemo(
    () => ({
      items: state.items,
      totals,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      setQuantity,
      clearCart,
    }),
    [state.items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
