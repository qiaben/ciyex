import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, CreditCard, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTestOrders } from '@/components/context/TestOrderContext';
import convertToSubcurrency from '@/lib/convertToSubcurrency';

interface SelfPaymentProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const SelfPayment: React.FC<SelfPaymentProps> = ({ 
  amount, 
  onPaymentSuccess, 
  isProcessing, 
  setIsProcessing 
}) => {
  const router = useRouter();
  const { getOrderById } = useTestOrders();
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>();
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!expDate.trim() || !expDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expDate = 'Please enter a valid expiration date (MM/YY)';
    }
    
    if (!cvv.trim() || cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!cardName.trim()) {
      newErrors.cardName = 'Please enter the name on card';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  const formatExpDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return value;
  };
  
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(undefined);
    
    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: convertToSubcurrency(amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);

      // In a real implementation, you would use Stripe.js to confirm the payment
      // For this example, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use the client secret as the payment ID
      const paymentId = clientSecret.split('_secret_')[0];
      
      setPaymentSuccess(true);
      
      // Call the success callback with the payment ID
      onPaymentSuccess(paymentId);
      
      // Redirect to order confirmation
      router.push(`/order-confirmation?orderId=${paymentId}&amount=${amount}`);
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Payment processing failed. Please try again.');
      setErrors({ form: 'Payment processing failed. Please try again.' });
      setIsProcessing(false);
    }
  };
  
  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
        <p className="text-gray-500">Redirecting to order confirmation...</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handlePayment} className="space-y-6 w-full max-w-lg mx-auto p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Payment method selector - only Credit Card now */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <Button
          type="button"
          variant={'default'}
          className="flex items-center gap-2"
          disabled
        >
          <CreditCard size={18} /> Credit Card
        </Button>
      </div>
      
      {/* Show credit card form */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 mb-4">
          {errorMessage}
        </div>
      )}
      
      {errors.form && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 mb-4">
          {errors.form}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label htmlFor="cardName">Name on Card</Label>
          <Input
            id="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className={errors.cardName ? "border-red-500" : "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"}
            placeholder="John Doe"
            disabled={isProcessing}
          />
          {errors.cardName && (
            <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className={errors.cardNumber ? "border-red-500 pl-10" : "pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              disabled={isProcessing}
            />
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
          </div>
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expDate">Expiration Date</Label>
            <Input
              id="expDate"
              value={expDate}
              onChange={(e) => setExpDate(formatExpDate(e.target.value))}
              className={errors.expDate ? "border-red-500" : "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"}
              placeholder="MM/YY"
              maxLength={5}
              disabled={isProcessing}
            />
            {errors.expDate && (
              <p className="text-red-500 text-sm mt-1">{errors.expDate}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
              type="password"
              className={errors.cvv ? "border-red-500" : "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"}
              placeholder="123"
              maxLength={4}
              disabled={isProcessing}
            />
            {errors.cvv && (
              <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow text-lg py-6"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              Pay ${amount.toFixed(2)} <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
        
        <div className="flex items-center justify-center mt-4">
          <p className="text-sm text-gray-500 flex items-center">
            <CreditCard size={15} className="mr-2" />
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </form>
  );
};

export default SelfPayment;
