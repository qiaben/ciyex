import React, { useEffect, useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote, Check, Calendar, ShieldCheck, Info, Timer, FileText, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createNewAppointment } from '@/app/actions/appointment';
import { PulseLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PaymentProcessProps {
  intakeData: any; // Replace with your actual type
  onPaymentSuccess: () => void;
  serviceDetails: {
    name: string;
    provider: string;
    date: string;
    time: string;
    duration?: string;
    price: number;
    tax: number;
    total: number;
  };
}

const PaymentForm: React.FC<{
  clientSecret: string;
  amount: number;
  servicePrice: number;
  onPaymentSuccess: () => void;
  serviceDetails: {
    name: string;
    provider: string;
    date: string;
    time: string;
  };
  intakeData: any;
}> = ({ clientSecret, amount, servicePrice, onPaymentSuccess, serviceDetails, intakeData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!stripe || !elements) {
      setErrorMessage("Payment system is not ready. Please try again.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-failed?error=${encodeURIComponent("Payment was not completed")}`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        setErrorMessage(error.message || "Payment failed.");
        toast({
          title: "Payment Failed",
          description: error.message || "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
        router.push(`/booking-failed?error=${encodeURIComponent(error.message || "Payment failed")}`);
        return;
      }

      if (!paymentIntent) {
        const errorMsg = "No payment intent received";
        console.error("Payment error:", errorMsg);
        setErrorMessage(errorMsg);
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive",
        });
        router.push(`/booking-failed?error=${encodeURIComponent(errorMsg)}`);
        return;
      }

      if (paymentIntent.status !== "succeeded") {
        const errorMsg = `Payment status: ${paymentIntent.status}`;
        console.error("Payment error:", errorMsg);
        setErrorMessage(errorMsg);
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive",
        });
        router.push(`/booking-failed?error=${encodeURIComponent(errorMsg)}`);
        return;
      }

      // Create appointment only after successful payment
      console.log('Creating appointment with data:', {
        ...intakeData,
        payment_intent_id: paymentIntent.id,
      });
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...intakeData,
          payment_intent_id: paymentIntent.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Appointment creation failed:', errorData);
        const errorMsg = errorData.message || "Failed to create appointment";
        setErrorMessage(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        router.push(`/booking-failed?error=${encodeURIComponent(errorMsg)}`);
        return;
      }

      const appointmentData = await response.json();
      
      // Show success toast
      toast({
        title: "Payment Successful",
        description: "Your appointment has been confirmed.",
      });

      // Redirect to success page with appointment details
      router.push(
        `/booking-success?service=${encodeURIComponent(serviceDetails.name)}&provider=${encodeURIComponent(serviceDetails.provider)}&date=${encodeURIComponent(serviceDetails.date)}&time=${encodeURIComponent(serviceDetails.time)}&appointmentId=${encodeURIComponent(appointmentData.id)}&paymentId=${encodeURIComponent(paymentIntent.id)}`
      );
    } catch (error) {
      console.error("Payment error:", error);
      const errorMsg = error instanceof Error ? error.message : "An error occurred during payment";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      router.push(`/booking-failed?error=${encodeURIComponent(errorMsg)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {/* Payment breakdown */}
      <div className="mt-4 mb-2 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between mb-1 text-gray-700 dark:text-gray-200">
          <span>Service Price</span>
          <span>${servicePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t dark:border-gray-700 pt-2 mt-2 text-gray-900 dark:text-white">
          <span>Total</span>
          <span>${servicePrice.toFixed(2)}</span>
        </div>
      </div>
      {errorMessage && <div className="text-red-500 dark:text-red-400 mt-2">{errorMessage}</div>}
      <Button
        type="submit"
        className="w-full bg-[#10b981] dark:bg-emerald-500 hover:bg-[#0e9e6e] dark:hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg text-lg py-4 px-8 mt-8 transition-all duration-200"
        disabled={loading || !stripe || !elements}
      >
        {loading ? "Processing..." : `Pay $${servicePrice.toFixed(2)}`}
      </Button>
    </form>
  );
};

const PaymentProcess: React.FC<PaymentProcessProps> = ({ intakeData, onPaymentSuccess, serviceDetails = { total: 0, price: 0 } }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Calculate total: only service price
  const servicePrice = serviceDetails.price || 0;
  const totalAmount = servicePrice;

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Convert amount to cents and ensure it's at least 50 cents
        const amountInCents = Math.round(totalAmount * 100);
        if (amountInCents < 50) {
          throw new Error('Payment amount must be at least $0.50');
        }

        console.log('Creating payment intent with amount:', amountInCents);

        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-user-email": intakeData.email || ""
          },
          body: JSON.stringify({ 
            amount: amountInCents,
            currency: "usd"
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Payment intent error response:", {
            status: response.status,
            statusText: response.statusText,
            data
          });
          throw new Error(data.error || 'Failed to create payment intent');
        }

        if (!data.clientSecret) {
          console.error("No client secret in response:", data);
          throw new Error('No client secret received from server');
        }

        console.log('Payment intent created successfully');
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Payment intent error:", err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(errorMessage);
        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive"
        });

        // If it's an authentication error, redirect to sign in
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication')) {
          router.push('/sign-in');
        }
      }
    };

    if (totalAmount > 0) {
      createPaymentIntent();
    }
  }, [totalAmount, toast, intakeData.email, router]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing payment...</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-2 md:px-8 bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-gray-900 dark:to-gray-800 min-h-[80vh]">
      <Card className="mb-6 max-w-xl mx-auto dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Complete Your Payment</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Secure your appointment with a payment method</p>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              clientSecret={clientSecret}
              amount={servicePrice}
              servicePrice={servicePrice}
              onPaymentSuccess={onPaymentSuccess}
              serviceDetails={{
                name: serviceDetails.name || "",
                provider: serviceDetails.provider || "",
                date: serviceDetails.date || "",
                time: serviceDetails.time || "",
              }}
              intakeData={intakeData}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcess;
