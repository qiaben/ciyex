import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Shield } from 'lucide-react';
import { LabTest } from '@/components/models/LabTest';

interface OrderSummaryProps {
  items: { test: LabTest; quantity: number }[];
  subtotal: number;
  drawFee: number;
  total: number;
  paymentMethod: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  items, 
  subtotal, 
  drawFee, 
  total,
  paymentMethod
}) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 rounded-2xl shadow-xl w-full">
      <CardHeader className="bg-gray-50 dark:bg-gray-900/80">
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.test.id} className="flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <p className="font-medium dark:text-gray-100">{item.test.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">{item.test.code}</Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</span>
                </div>
              </div>
              <p className="font-medium dark:text-gray-100">${(item.test.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
            <span className="dark:text-gray-100">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Draw Fee</span>
            <span className="dark:text-gray-100">${drawFee.toFixed(2)}</span>
          </div>
          <Separator className="my-2 dark:bg-gray-700" />
          <div className="flex justify-between text-lg font-bold">
            <span className="dark:text-gray-100">Total</span>
            <span className="dark:text-gray-100">${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="bg-gray-50 dark:bg-gray-900/80 p-4 rounded-md">
            <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Payment Method</h4>
            {paymentMethod === 'self-pay' ? (
              <div className="flex items-center">
                <CreditCard size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
                <span className="dark:text-gray-100">Self Pay - Credit Card</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Shield size={18} className="mr-2 text-green-600 dark:text-green-400" />
                <span className="dark:text-gray-100">Insurance</span>
              </div>
            )}
            {paymentMethod === 'insurance' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Your insurance will be verified before processing. You may be responsible for a portion of the charges.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
