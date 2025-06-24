"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddService } from '@/components/dialogs/add-service';
import { ServiceSettings } from '@/components/settings/services-settings';
import ServiceManagement from './ServiceManagement';
import ServiceReporting from './ServiceReporting';
import ServicePayments from './ServicePayments';
import ServicesDashboard from './ServicesDashboard';
import ServicesInsuranceProcessing from './ServicesInsuranceProcessing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ServicePayment {
  id: string;
  serviceName: string;
  patientName: string;
  amount: number;
  status: string;
  paymentMethod: string;
}

interface ServiceReport {
  id: string;
  serviceName: string;
  patientName: string;
  status: string;
  reportUrl?: string;
  reportName?: string;
}

interface ServiceRequest {
  id: string;
  serviceName: string;
  patientName: string;
  status: string;
  details: string;
}

// Mock service bookings data
const mockBookings = [
  {
    id: 'b1',
    serviceName: 'General Consultation',
    doctorName: 'Dr. Smith',
    patientName: 'John Doe',
    bookingDate: '2024-06-01',
    bookingTime: '10:00',
    serviceAmount: 50,
    platformFee: 2.99,
    totalAmount: 52.99,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    insuranceStatus: null,
    status: 'completed',
  },
  {
    id: 'b2',
    serviceName: 'Therapy Session',
    doctorName: 'Dr. Jane',
    patientName: 'Alice',
    bookingDate: '2024-06-02',
    bookingTime: '14:00',
    serviceAmount: 80,
    platformFee: 2.99,
    totalAmount: 82.99,
    paymentMethod: 'insurance',
    paymentStatus: 'pending',
    insuranceStatus: 'pending',
    status: 'scheduled',
  },
  {
    id: 'b3',
    serviceName: 'Dental Cleaning',
    doctorName: 'Dr. Smith',
    patientName: 'Bob',
    bookingDate: '2024-06-03',
    bookingTime: '11:00',
    serviceAmount: 120,
    platformFee: 2.99,
    totalAmount: 122.99,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    insuranceStatus: null,
    status: 'completed',
  },
  {
    id: 'b4',
    serviceName: 'General Consultation',
    doctorName: 'Dr. Smith',
    patientName: 'Charlie',
    bookingDate: '2024-06-04',
    bookingTime: '09:30',
    serviceAmount: 50,
    platformFee: 2.99,
    totalAmount: 52.99,
    paymentMethod: 'insurance',
    paymentStatus: 'paid',
    insuranceStatus: 'approved',
    status: 'completed',
  },
  {
    id: 'b5',
    serviceName: 'Therapy Session',
    doctorName: 'Dr. Jane',
    patientName: 'Daisy',
    bookingDate: '2024-06-05',
    bookingTime: '15:00',
    serviceAmount: 80,
    platformFee: 2.99,
    totalAmount: 82.99,
    paymentMethod: 'insurance',
    paymentStatus: 'pending',
    insuranceStatus: 'pending',
    status: 'scheduled',
  },
  {
    id: 'b6',
    serviceName: 'Cardiology Checkup',
    doctorName: 'Dr. Heart',
    patientName: 'Evelyn Insurance',
    bookingDate: '2024-06-06',
    bookingTime: '13:00',
    serviceAmount: 200,
    platformFee: 2.99,
    totalAmount: 202.99,
    paymentMethod: 'insurance',
    paymentStatus: 'pending',
    insuranceStatus: 'pending',
    status: 'scheduled',
  },
];

// Calculate dashboard metrics
const paidBookings = mockBookings.filter(b => b.paymentStatus === 'paid');
const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);
const platformFees = paidBookings.reduce((sum, b) => sum + b.platformFee, 0);
const pendingInsurance = mockBookings.filter(b => b.insuranceStatus === 'pending').length;
const totalBookings = mockBookings.length;
const activeBookings = mockBookings.filter(b => b.status === 'scheduled').length;
const completedBookings = mockBookings.filter(b => b.status === 'completed').length;
const recentBookings = [...mockBookings].reverse().slice(0, 5);
const topServices = Object.entries(
  mockBookings.reduce((acc, b) => {
    acc[b.serviceName] = (acc[b.serviceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

const revenueByService = Object.entries(
  paidBookings.reduce((acc, b) => {
    acc[b.serviceName] = (acc[b.serviceName] || 0) + b.totalAmount;
    return acc;
  }, {} as Record<string, number>)
).map(([name, revenue]) => ({ name, revenue }));

const stats = {
  totalServices: totalBookings,
  activeServices: activeBookings,
  totalRevenue,
  pendingPayments: mockBookings.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.totalAmount, 0),
  recentServices: recentBookings.map(b => ({ id: b.id, name: b.serviceName, price: b.serviceAmount, status: b.status })),
  revenueByService,
  platformFees,
  completedBookings,
  pendingInsurance,
  topServices,
};

const payments: ServicePayment[] = mockBookings.map(b => ({
  id: b.id,
  serviceName: b.serviceName,
  patientName: b.patientName,
  amount: b.totalAmount,
  status: b.paymentStatus,
  paymentMethod: b.paymentMethod,
}));

const reports: ServiceReport[] = mockBookings.map(b => ({
  id: b.id,
  serviceName: b.serviceName,
  patientName: b.patientName,
  status: b.status,
}));

const requests: ServiceRequest[] = mockBookings
  .filter(b => b.insuranceStatus === 'pending')
  .map(b => ({
    id: b.id,
    serviceName: b.serviceName,
    patientName: b.patientName,
    status: b.status,
    details: `Insurance approval needed for ${b.patientName}`,
  }));

const ServicesSection = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPayment, setSelectedPayment] = useState<ServicePayment | null>(null);
  const [selectedReport, setSelectedReport] = useState<ServiceReport | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Payment Details Modal
  function PaymentDetailsModal() {
    if (!selectedPayment) return null;
    // Find the full booking for more info
    const booking = mockBookings.find(b => b.id === selectedPayment.id);
    return (
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Details for payment ID: <b>{selectedPayment.id}</b>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <div><b>Service:</b> {selectedPayment.serviceName}</div>
            <div><b>Patient:</b> {selectedPayment.patientName}</div>
            {booking && <div><b>Doctor:</b> {booking.doctorName}</div>}
            {booking && <div><b>Booking Date:</b> {booking.bookingDate} {booking.bookingTime}</div>}
            <div><b>Amount:</b> ${selectedPayment.amount.toFixed(2)}</div>
            {booking && <div><b>Platform Fee:</b> ${booking.platformFee.toFixed(2)}</div>}
            <div><b>Status:</b> {selectedPayment.status}</div>
            <div><b>Payment Method:</b> {selectedPayment.paymentMethod}</div>
            {booking && booking.paymentMethod === 'insurance' && (
              <div><b>Insurance Status:</b> {booking.insuranceStatus}</div>
            )}
            {booking && <div><b>Booking Status:</b> {booking.status}</div>}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Report Details Modal
  function ReportDetailsModal() {
    if (!selectedReport) return null;
    // Find the full booking for more info
    const booking = mockBookings.find(b => b.id === selectedReport.id);
    return (
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service Report Details</DialogTitle>
            <DialogDescription>
              Details for report ID: <b>{selectedReport.id}</b>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <div><b>Service:</b> {selectedReport.serviceName}</div>
            <div><b>Patient:</b> {selectedReport.patientName}</div>
            {booking && <div><b>Doctor:</b> {booking.doctorName}</div>}
            {booking && <div><b>Booking Date:</b> {booking.bookingDate} {booking.bookingTime}</div>}
            <div><b>Status:</b> {selectedReport.status}</div>
            {selectedReport.reportName && <div><b>Report File:</b> {selectedReport.reportName}</div>}
            {selectedReport.reportUrl && <div><a href={selectedReport.reportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Report File</a></div>}
            {booking && booking.paymentMethod === 'insurance' && (
              <div><b>Insurance Status:</b> {booking.insuranceStatus}</div>
            )}
            {booking && <div><b>Booking Status:</b> {booking.status}</div>}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Services Management</h2>
        <AddService />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="services">All Services</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reporting">Service Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ServicesDashboard stats={stats} />
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <ServicesInsuranceProcessing bookings={mockBookings} />
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Service Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">#{payment.id}</TableCell>
                      <TableCell>{payment.serviceName}</TableCell>
                      <TableCell>{payment.patientName}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>{payment.status}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(payment); setPaymentModalOpen(true); }}>View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaymentDetailsModal />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting">
          <Card>
            <CardHeader>
              <CardTitle>Service Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Report File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">#{report.id}</TableCell>
                      <TableCell>{report.serviceName}</TableCell>
                      <TableCell>{report.patientName}</TableCell>
                      <TableCell>{report.status}</TableCell>
                      <TableCell>{report.reportName || 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedReport(report); setReportModalOpen(true); }}>View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ReportDetailsModal />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServicesSection; 