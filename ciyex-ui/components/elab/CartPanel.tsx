import React from 'react';
import { useCart } from '@/components/context/CartContext';
import { Button } from "@/components/ui/button";
import { Trash, Minus, Plus, ShoppingCart, ArrowRight, InfoIcon, Loader2 } from "lucide-react";
import { DRAW_FEE } from '@/components/data/labTests';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { labTests } from '@/components/data/labTests';
import { useRouter } from 'next/navigation';

interface CartPanelProps {
  onClose?: () => void;
  fullPage?: boolean;
}

const CartPanel: React.FC<CartPanelProps> = ({ onClose, fullPage = false }) => {
  const { items, removeFromCart, updateQuantity, getSubtotal, getTotal, itemCount, addToCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Function to get recommended tests based on cart items
  const getRecommendedTests = () => {
    if (!items.length) return [];
    
    const cartCategories = items.map(item => item.test.category);
    const cartIds = items.map(item => item.test.id);
    
    // Find tests in the same categories but not already in cart
    return labTests
      .filter(test => 
        cartCategories.includes(test.category) && 
        !cartIds.includes(test.id)
      )
      .slice(0, 3); // Limit to 3 recommendations
  };
  
  const recommendedTests = getRecommendedTests();
  
  if (items.length === 0) {
    return (
      <div className={`${fullPage ? 'container mx-auto px-4 py-8' : ''}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl mb-4 text-gray-600">Your cart is empty</p>
            <Button 
              className="bg-elab-medical-blue hover:bg-blue-600"
              onClick={() => fullPage ? router.push('/') : onClose && onClose()}
            >
              Browse Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${fullPage ? 'container mx-auto px-4 py-8' : ''}`}>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader className="dark:bg-gray-900">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </CardTitle>
        </CardHeader>
        <CardContent className="dark:bg-gray-900">
          {items.map((item) => (
            <div key={item.test.id} className="py-4 border-b last:border-0 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
                    {item.test.name}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon size={14} className="ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs dark:bg-gray-900 dark:text-gray-100">
                          <p>{item.test.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h4>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-300">Code: {item.test.code}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">${(item.test.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                    onClick={() => updateQuantity(item.test.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-gray-900 dark:text-gray-100">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                    onClick={() => updateQuantity(item.test.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 p-1 h-8"
                  onClick={() => removeFromCart(item.test.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
              <span className="text-gray-900 dark:text-gray-100">${getSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300 flex items-center">
                Draw Fee
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon size={14} className="ml-1 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="dark:bg-gray-900 dark:text-gray-100">
                      <p>One-time fee for collecting your samples</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="text-gray-900 dark:text-gray-100">${DRAW_FEE.toFixed(2)}</span>
            </div>
            <Separator className="my-2 dark:bg-gray-700" />
            <div className="flex justify-between items-center font-bold">
              <span className="text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-gray-900 dark:text-gray-100">${getTotal().toFixed(2)}</span>
            </div>
          </div>

          {recommendedTests.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Recommended Tests</h4>
              <div className="space-y-2">
                {recommendedTests.map((test) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium">{test.name}</p>
                        <p className="text-xs text-gray-500">${test.price.toFixed(2)}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => addToCart(test)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-2 dark:bg-gray-900">
          <Button variant="outline" className="w-full dark:border-gray-700 dark:text-gray-100 dark:bg-gray-900" onClick={() => router.push('/Elabs')}>Continue Shopping</Button>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center"
            onClick={async () => {
              setIsLoading(true);
              await router.push('/checkout');
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : null}
            Checkout <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CartPanel;
