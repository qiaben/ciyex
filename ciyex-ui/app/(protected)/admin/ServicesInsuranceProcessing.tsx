"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Shield } from 'lucide-react';

// Accept bookings as a prop for flexibility
interface Booking {
  id: string;
  serviceName: string;
  doctorName: string;
  patientName: string;
  bookingDate: string;
  bookingTime: string;
  serviceAmount: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  insuranceStatus: string | null;
  status: string;
}

interface ServicesInsuranceProcessingProps {
  bookings: Booking[];
}

const ServicesInsuranceProcessing: React.FC<ServicesInsuranceProcessingProps> = ({ bookings }) => {
  // Local state for demo (in real app, update backend)
  const [localBookings, setLocalBookings] = useState(bookings);

  const insuranceBookings = localBookings.filter(
    b => b.paymentMethod === 'insurance' && b.insuranceStatus === 'pending'
  );

  const handleApprove = (id: string) => {
    setLocalBookings(prev => prev.map(b =>
      b.id === id
        ? { ...b, insuranceStatus: 'approved', paymentStatus: 'paid', status: 'scheduled' }
        : b
    ));
  };

  const handleReject = (id: string) => {
    setLocalBookings(prev => prev.map(b =>
      b.id === id
        ? { ...b, insuranceStatus: 'rejected', paymentStatus: 'failed', status: 'cancelled' }
        : b
    ));
  };

  if (insuranceBookings.length === 0) {
    return (
      <div className="text-center py-10">
        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No Insurance Bookings</h3>
        <p className="text-gray-500">There are no service bookings requiring insurance approval.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Approval for Service Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insuranceBookings.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.id}</TableCell>
                <TableCell>{b.serviceName}</TableCell>
                <TableCell>{b.patientName}</TableCell>
                <TableCell>{b.doctorName}</TableCell>
                <TableCell>{b.bookingDate}</TableCell>
                <TableCell>${b.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline">Pending</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" onClick={() => handleApprove(b.id)}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800" onClick={() => handleReject(b.id)}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ServicesInsuranceProcessing; 