"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LabTest } from '@/components/models/LabTest';
import { labTests } from '@/components/data/labTests';
import { useAuth } from '@clerk/nextjs';

export interface TestOrder {
  id: string;
  tests: {
    test: LabTest;
    quantity: number;
  }[];
  orderNumber: string;
  orderDate: string;
  status: 'processing' | 'scheduled' | 'completed' | 'cancelled';
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  results?: {
    testId: string;
    resultValue?: string;
    normalRange?: string;
    unit?: string;
    status: 'pending' | 'processing' | 'completed';
    reviewed?: boolean;
    fileAttachment?: {
      name: string;
      type: string;
      url: string;
    };
  }[];
  userEmail?: string;
  userName?: string;
  // Payment-related fields
  totalAmount?: number;
  paymentStatus?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentDate?: string;
  transactionId?: string;
  // Insurance-related fields
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    primary?: boolean;
    subscriberName?: string;
    subscriberDob?: string;
    relationship?: string;
  };
}

interface TestOrderContextType {
  orders: TestOrder[];
  addOrder: (order: Omit<TestOrder, 'id'>) => TestOrder;
  getOrderById: (id: string) => TestOrder | undefined;
  updateOrderStatus: (id: string, status: TestOrder['status']) => void;
  addReview: (orderId: string, testId: string, rating: number, comment: string) => void;
  // Admin functions
  updateTestResult: (
    orderId: string, 
    testId: string, 
    resultData: { 
      resultValue?: string, 
      normalRange?: string, 
      unit?: string, 
      status: 'pending' | 'processing' | 'completed',
      fileAttachment?: {
        name: string;
        type: string;
        url: string;
      }
    }
  ) => void;
  updateScheduledAppointment: (
    orderId: string,
    scheduledDate: string,
    scheduledTime: string,
    location: string
  ) => void;
  updatePaymentInfo: (
    orderId: string,
    paymentData: {
      totalAmount?: number,
      paymentStatus?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded',
      paymentMethod?: string,
      paymentDate?: string,
      transactionId?: string
    }
  ) => void;
  getAllUserOrders: () => TestOrder[];
}

const TestOrderContext = createContext<TestOrderContextType | undefined>(undefined);

// Next.js safe way to handle localStorage
const getLocalStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

export function TestOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<TestOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();

  const fetchOrders = async () => {
    // Don't fetch if not signed in
    if (!isLoaded || !isSignedIn) {
      setOrders([]);
      return;
    }

      try {
        const response = await fetch('/api/lab-orders', {
        method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response:', await response.text());
          throw new Error('Server returned non-JSON response');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch orders' }));
          throw new Error(errorData.error || 'Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        // Initialize with empty array on error
        setOrders([]);
      }
  };

  useEffect(() => {
    fetchOrders();
  }, [isLoaded, isSignedIn]); // Re-fetch when auth state changes

  // Save orders to localStorage whenever they change (Next.js safe)
  useEffect(() => {
    if (orders.length > 0) {  // Only save if we have orders
      const storedOrders = getLocalStorage('testOrders');
      const parsedStoredOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Only save if orders have actually changed
      if (JSON.stringify(orders) !== JSON.stringify(parsedStoredOrders)) {
        setLocalStorage('testOrders', JSON.stringify(orders));
      }
    }
  }, [orders]);

  const addOrder = (order: Omit<TestOrder, 'id'>) => {
    // Generate a stable ID based on orderNumber if it exists
    const orderId = order.orderNumber || `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Check if order with same ID already exists
    const existingOrder = orders.find(o => o.id === orderId);
    if (existingOrder) {
      return existingOrder;
    }
    
    const newOrder = {
      ...order,
      id: orderId,
    };
    
    setOrders(prev => {
      // Check if order already exists in the array
      const exists = prev.some(o => o.id === orderId);
      if (exists) {
        return prev;
      }
      return [newOrder, ...prev];
    });
    
    return newOrder;
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const updateOrderStatus = (id: string, status: TestOrder['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === id ? { ...order, status } : order
      )
    );
  };

  const addReview = (orderId: string, testId: string, rating: number, comment: string) => {
    // In a real app, we would send the review to a backend API
    console.log('Adding review:', { orderId, testId, rating, comment });
    
    // For now, just mark the test as reviewed
    setOrders(prev => 
      prev.map(order => {
        if (order.id === orderId) {
          const updatedResults = order.results?.map(result => 
            result.testId === testId ? { ...result, reviewed: true } : result
          );
          return { ...order, results: updatedResults };
        }
        return order;
      })
    );
  };

  // Admin functions
  const updateTestResult = (
    orderId: string, 
    testId: string, 
    resultData: { 
      resultValue?: string, 
      normalRange?: string, 
      unit?: string, 
      status: 'pending' | 'processing' | 'completed',
      fileAttachment?: {
        name: string;
        type: string;
        url: string;
      }
    }
  ) => {
    setOrders(prev => 
      prev.map(order => {
        if (order.id === orderId) {
          // Check if results already exist
          if (order.results) {
            // Update existing result
            const updatedResults = order.results.map(result => 
              result.testId === testId 
                ? { ...result, ...resultData } 
                : result
            );
            return { ...order, results: updatedResults };
          } else {
            // Create new results array
            const newResult = {
              testId,
              ...resultData
            };
            return { ...order, results: [newResult] };
          }
        }
        return order;
      })
    );
  };

  const updateScheduledAppointment = (
    orderId: string,
    scheduledDate: string,
    scheduledTime: string,
    location: string
  ) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              scheduledDate, 
              scheduledTime, 
              location,
              status: 'scheduled' as TestOrder['status']
            } 
          : order
      )
    );
  };
  
  // New function to update payment information
  const updatePaymentInfo = (
    orderId: string,
    paymentData: {
      totalAmount?: number,
      paymentStatus?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded',
      paymentMethod?: string,
      paymentDate?: string,
      transactionId?: string
    }
  ) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, ...paymentData } 
          : order
      )
    );
  };

  const getAllUserOrders = () => {
    return orders;
  };

  return (
    <TestOrderContext.Provider value={{
      orders,
      addOrder,
      getOrderById,
      updateOrderStatus,
      addReview,
      updateTestResult,
      updateScheduledAppointment,
      updatePaymentInfo,
      getAllUserOrders
    }}>
      {children}
    </TestOrderContext.Provider>
  );
}

export function useTestOrders() {
  const context = useContext(TestOrderContext);
  if (context === undefined) {
    throw new Error('useTestOrders must be used within a TestOrderProvider');
  }
  return context;
}
