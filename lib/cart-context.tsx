'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  productId: number;
  productName: string;
  brandName: string;
  logoUrl: string;
  denomination: number;
  currency: string;
  countryCode: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number, denomination: number) => void;
  updateQuantity: (productId: number, denomination: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'impactly_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart from localStorage');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        item => item.productId === newItem.productId && item.denomination === newItem.denomination
      );

      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...current, { ...newItem, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: number, denomination: number) => {
    setItems(current =>
      current.filter(item => !(item.productId === productId && item.denomination === denomination))
    );
  };

  const updateQuantity = (productId: number, denomination: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, denomination);
      return;
    }

    setItems(current => {
      const index = current.findIndex(
        item => item.productId === productId && item.denomination === denomination
      );

      if (index >= 0) {
        const updated = [...current];
        updated[index].quantity = quantity;
        return updated;
      }

      return current;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
