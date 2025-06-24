"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function BookingFailed() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!searchParams) return;
    const error = searchParams.get('error') || 'An error occurred during the booking process';
    setErrorMessage(error);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#fee2e2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Failed</h1>
              <p className="text-gray-600">We couldn't complete your booking at this time.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-red-900 mb-4">What Happened?</h2>
                <p className="text-red-800">{errorMessage}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What You Can Do</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Check if your payment method is valid and has sufficient funds</li>
                  <li>Try using a different payment method</li>
                  <li>Contact our support team if the problem persists</li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4 pt-6">
                <Link href="/providers">
                  <Button variant="outline" className="min-w-[120px]">
                    Try Again
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="min-w-[120px]">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 