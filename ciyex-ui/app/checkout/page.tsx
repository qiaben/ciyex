"use client"
import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/context/CartContext';
import { useTestOrders } from '@/components/context/TestOrderContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { DRAW_FEE } from '@/components/data/labTests';
import PatientInfoForm from './PatientInfoForm';
import OrderSummary from './OrderSummary';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, X, User, FileText } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutPage from '@/components/CheckoutPage';

export type PatientInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const Checkout = () => {
  const { items, getSubtotal, getTotal, clearCart } = useCart();
  const { addOrder } = useTestOrders();
  const router = useRouter();
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const role = (user?.publicMetadata?.role as string)?.toLowerCase();
    if (role !== 'patient') {
      router.push('/');
    }
  }, [isSignedIn, user, router]);

  useEffect(() => {
    if (items.length > 0) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(getTotal() * 100) }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [items, getTotal]);

  const [patientInfo, setPatientInfo] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  const [isPatientInfoComplete, setIsPatientInfoComplete] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  // Handle patient info submission
  const handlePatientInfoSubmit = (info: PatientInfo) => {
    setPatientInfo(info);
    setIsPatientInfoComplete(true);
    toast({
      title: "Information saved",
      description: "Your personal information has been saved.",
    });
  };
  
  // Cancel checkout and go back
  const handleCancel = () => {
    router.push('/');
  };

  // Handle payment success: create order and redirect
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      console.log('Creating lab order with payment intent:', paymentIntentId);
      console.log('Order details:', {
        tests: items,
        patientInfo,
        totalAmount: getTotal(),
        transactionId: paymentIntentId
      });

      // Create order in backend
      const response = await fetch('/api/lab-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: paymentIntentId,
          tests: items.map(item => ({
            test: {
              id: parseInt(item.test.id),
              name: item.test.name,
              code: item.test.code || '',
              description: item.test.description || '',
              price: item.test.price
            },
            quantity: item.quantity
          })),
          patientInfo: {
            firstName: patientInfo.firstName,
            lastName: patientInfo.lastName,
            email: patientInfo.email,
            phone: patientInfo.phone,
            dob: patientInfo.dob,
            gender: patientInfo.gender,
            address: patientInfo.address,
            city: patientInfo.city,
            state: patientInfo.state,
            zipCode: patientInfo.zipCode,
          },
          totalAmount: getTotal(),
          transactionId: paymentIntentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lab order creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || 'Failed to create order');
      }

      const order = await response.json();
      console.log('Lab order created successfully:', order);

      // Add order to local state for immediate UI update
      addOrder({
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        status: order.status.toLowerCase(),
        tests: items,
        userEmail: patientInfo.email,
        userName: `${patientInfo.firstName} ${patientInfo.lastName}`,
        totalAmount: getTotal(),
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        paymentDate: new Date().toISOString(),
        transactionId: paymentIntentId,
      });

      clearCart();
      
      // Store the order ID in sessionStorage to handle the Stripe redirect
      sessionStorage.setItem('lastOrderId', order.id.toString());
      
      // Redirect to order confirmation with our order ID
      window.location.href = `/order-confirmation?orderId=${order.id}&amount=${getTotal()}`;
    } catch (error) {
      console.error('Error creating lab order:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // Show error message to user
      setError('Failed to create order. Please contact support.');
    }
  };

  // If no items in cart, show message
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full p-8 rounded-2xl shadow-xl bg-white/90 dark:bg-neutral-800 border border-blue-100 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 dark:text-gray-100">
              <FileText className="text-blue-600 dark:text-blue-400" size={28} />
              Your cart is empty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-200 mb-4">You have no items in your cart.</p>
            <Button 
              onClick={() => router.push('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
            >
              Browse Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-2 sm:px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Form fields */}
        <div className="md:col-span-2">
          <Card className="rounded-2xl shadow-xl bg-white/90 dark:bg-neutral-800 border border-blue-100 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-2 dark:text-gray-100">
                <User className="text-blue-600 dark:text-blue-400" size={28} />
                Checkout
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isPatientInfoComplete ? (
                <PatientInfoForm 
                  initialData={patientInfo} 
                  onSubmit={handlePatientInfoSubmit} 
                />
              ) : (
                <div>
                  <div className="p-4 bg-blue-50 dark:bg-neutral-900/60 rounded-lg mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium flex items-center gap-2 text-blue-800 dark:text-blue-200"><User size={18} /> Patient Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-200">
                        {patientInfo.firstName} {patientInfo.lastName}, {patientInfo.email}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsPatientInfoComplete(false)}>
                      Edit
                    </Button>
                  </div>
                  {/* Payment Method Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <ArrowRight size={18} /> Payment Method
                    </h3>
                    {clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutPage amount={getTotal()} onPaymentSuccess={handlePaymentSuccess} />
                      </Elements>
                    ) : (
                      <div>Loading payment form…</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-6">
              <Button variant="outline" className="px-7 py-3 text-base w-full sm:w-auto" onClick={handleCancel}>
                <X size={18} className="mr-2" />
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right column: Order summary */}
        <div className="w-full md:w-auto">
          <OrderSummary 
            items={items} 
            subtotal={getSubtotal()} 
            drawFee={DRAW_FEE} 
            total={getTotal()} 
            paymentMethod={"self-pay"} 
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
