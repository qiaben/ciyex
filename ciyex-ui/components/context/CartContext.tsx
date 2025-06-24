"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { LabTest } from '../models/LabTest';
import { DRAW_FEE } from '../data/labTests';
import { toast } from "sonner";

interface CartItem {
  test: LabTest;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (test: LabTest) => void;
  removeFromCart: (testId: string) => void;
  updateQuantity: (testId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      setItems(savedCart ? JSON.parse(savedCart) : []);
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = useCallback((test: LabTest) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.test.id === test.id);
      let newItems;
      
      if (existingItem) {
        newItems = prevItems.map(item => 
          item.test.id === test.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        newItems = [...prevItems, { test, quantity: 1 }];
      }
      return newItems;
    });
    toast(`${test.name} has been added to your cart.`, { duration: 2000 });
  }, []);

  const removeFromCart = useCallback((testId: string) => {
    setItems(prevItems => prevItems.filter(item => item.test.id !== testId));
  }, []);

  const updateQuantity = useCallback((testId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prevItems => prevItems.map(item => 
      item.test.id === testId 
        ? { ...item, quantity } 
        : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.test.price * item.quantity), 0);
  }, [items]);

  const getTotal = useCallback(() => {
    if (items.length === 0) return 0;
    return getSubtotal() + DRAW_FEE;
  }, [items, getSubtotal]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotal,
    itemCount
  };

  if (!isLoaded) return null;

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
