"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, User, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface BookingSuccessProps {
  service: string;
  provider: string;
  date: string;
  time: string;
  appointmentId: string;
  paymentId: string;
}

export default function BookingSuccess() {
  const searchParams = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState<BookingSuccessProps | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    
    const details = {
      service: searchParams.get('service') || '',
      provider: searchParams.get('provider') || '',
      date: searchParams.get('date') || '',
      time: searchParams.get('time') || '',
      appointmentId: searchParams.get('appointmentId') || '',
      paymentId: searchParams.get('paymentId') || '',
    };
    setBookingDetails(details);
  }, [searchParams]);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700 rounded-2xl shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600 dark:text-gray-300">Your appointment has been successfully scheduled.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900/80 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Appointment Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Provider</p>
                      <p className="font-medium dark:text-gray-100">{bookingDetails.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium dark:text-gray-100">{bookingDetails.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                      <p className="font-medium dark:text-gray-100">{bookingDetails.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Payment ID</p>
                      <p className="font-medium dark:text-gray-100">{bookingDetails.paymentId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">What's Next?</h3>
                <ul className="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-2">
                  <li>You will receive a confirmation SMS or Email with all the details and Link to the appointment</li>
                  <li>Please join 15 minutes before your scheduled time</li>
                  <li>Prepare any relevant medical records or documents with you during the appointment</li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4 pt-6">
                <Link href="/patient">
                  <Button variant="outline" className="min-w-[120px] dark:border-gray-600 dark:text-gray-200">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/providers">
                  <Button className="min-w-[120px] dark:bg-emerald-600 dark:hover:bg-emerald-700">
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