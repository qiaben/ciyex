"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, FileText, Calendar, ArrowRight, File, Eye } from 'lucide-react';
import { useTestOrders } from '@/components/context/TestOrderContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TestOrder } from '@/components/context/TestOrderContext';
import { LabTest } from '@/components/models/LabTest';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BackendOrderItem {
  testId: number;
  testName: string;
  testCode: string | null;
  testDescription: string | null;
  testPrice: number;
  quantity: number;
}

interface BackendOrderResult {
  testId: number;
  resultValue: string | null;
  normalRange: string | null;
  unit: string | null;
  status: string;
  reviewed: boolean;
  fileAttachment: any;
}

interface BackendOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  orderItems: BackendOrderItem[];
  results: BackendOrderResult[];
  patientEmail: string;
  patientFirstName: string;
  patientLastName: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  transactionId: string | null;
}

const OrderConfirmation = () => {
  const router = useRouter();
  const { getOrderById, updatePaymentInfo, addOrder, orders } = useTestOrders();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const amount = searchParams?.get('amount');
  const insurancePending = searchParams?.get('insurancePending');
  
  const [order, setOrder] = useState<TestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{name: string, type: string, url: string} | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  
  const DRAW_FEE = 9.99;
  
  useEffect(() => {
    const fetchOrder = async () => {
      // Get the order ID from either the URL or sessionStorage
      const storedOrderId = sessionStorage.getItem('lastOrderId');
      const urlOrderId = searchParams?.get('orderId');
      const finalOrderId = storedOrderId || urlOrderId;

      if (!finalOrderId) {
        setLoading(false);
        setError('No order ID provided');
        return;
      }

      try {
        // First try to get from local state
        let localOrder = getOrderById(finalOrderId);
        
        if (!localOrder) {
          // If not in local state, fetch from backend
          const response = await fetch(`/api/lab-orders/${finalOrderId}`);
          if (!response.ok) {
            if (response.status === 404) {
              // If order not found, check if we have a stored order ID
              const storedId = sessionStorage.getItem('lastOrderId');
              if (storedId && storedId !== finalOrderId) {
                // Try fetching with the stored ID
                const storedResponse = await fetch(`/api/lab-orders/${storedId}`);
                if (storedResponse.ok) {
                  const backendOrder: BackendOrder = await storedResponse.json();
                  // Convert and set order as before...
                  const convertedOrder: TestOrder = {
                    id: backendOrder.id.toString(),
                    orderNumber: backendOrder.orderNumber,
                    orderDate: backendOrder.orderDate,
                    status: backendOrder.status.toLowerCase() as TestOrder['status'],
                    tests: backendOrder.orderItems.map((item: BackendOrderItem) => ({
                      test: {
                        id: item.testId.toString(),
                        name: item.testName,
                        code: item.testCode || '',
                        description: item.testDescription || '',
                        price: item.testPrice,
                        category: 'lab',
                      } as LabTest,
                      quantity: item.quantity,
                    })),
                    userEmail: backendOrder.patientEmail,
                    userName: `${backendOrder.patientFirstName} ${backendOrder.patientLastName}`,
                    totalAmount: backendOrder.totalAmount,
                    paymentStatus: backendOrder.paymentStatus.toLowerCase() as TestOrder['paymentStatus'],
                    paymentMethod: backendOrder.paymentMethod.toLowerCase(),
                    paymentDate: backendOrder.paymentDate,
                    transactionId: backendOrder.transactionId || undefined,
                    results: backendOrder.results.map((result: BackendOrderResult) => ({
                      testId: result.testId.toString(),
                      resultValue: result.resultValue || undefined,
                      normalRange: result.normalRange || undefined,
                      unit: result.unit || undefined,
                      status: (result.status.toLowerCase() === 'processing' ? 'processing' : 
                              result.status.toLowerCase() === 'completed' ? 'completed' : 
                              'pending') as 'processing' | 'completed' | 'pending',
                      reviewed: result.reviewed,
                      fileAttachment: result.fileAttachment,
                    })),
                  };
                  addOrder(convertedOrder);
                  setOrder(convertedOrder);
                  sessionStorage.removeItem('lastOrderId');
                  return;
                }
              }
              throw new Error('Order not found. Please check the order ID and try again.');
            }
            throw new Error('Failed to fetch order');
          }
          
          const backendOrder: BackendOrder = await response.json();
          
          // Convert backend order to TestOrder format
          const convertedOrder: TestOrder = {
            id: backendOrder.id.toString(),
            orderNumber: backendOrder.orderNumber,
            orderDate: backendOrder.orderDate,
            status: backendOrder.status.toLowerCase() as TestOrder['status'],
            tests: backendOrder.orderItems.map((item: BackendOrderItem) => ({
              test: {
                id: item.testId.toString(),
                name: item.testName,
                code: item.testCode || '',
                description: item.testDescription || '',
                price: item.testPrice,
                category: 'lab',
              } as LabTest,
              quantity: item.quantity,
            })),
            userEmail: backendOrder.patientEmail,
            userName: `${backendOrder.patientFirstName} ${backendOrder.patientLastName}`,
            totalAmount: backendOrder.totalAmount,
            paymentStatus: backendOrder.paymentStatus.toLowerCase() as TestOrder['paymentStatus'],
            paymentMethod: backendOrder.paymentMethod.toLowerCase(),
            paymentDate: backendOrder.paymentDate,
            transactionId: backendOrder.transactionId || undefined,
            results: backendOrder.results.map((result: BackendOrderResult) => ({
              testId: result.testId.toString(),
              resultValue: result.resultValue || undefined,
              normalRange: result.normalRange || undefined,
              unit: result.unit || undefined,
              status: (result.status.toLowerCase() === 'processing' ? 'processing' : 
                      result.status.toLowerCase() === 'completed' ? 'completed' : 
                      'pending') as 'processing' | 'completed' | 'pending',
              reviewed: result.reviewed,
              fileAttachment: result.fileAttachment,
            })),
          };
          
          // Add to local state
          addOrder(convertedOrder);
          setOrder(convertedOrder);
          
          // Clear the stored order ID
          sessionStorage.removeItem('lastOrderId');
        } else {
          setOrder(localOrder);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error instanceof Error ? error.message : 'Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [searchParams, getOrderById, addOrder]);
  
  useEffect(() => {
    if (!order && !orderId && !loading) {
      // If no order found and no orderId, redirect to homepage
      router.push('/');
    }
  }, [order, orderId, loading, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => router.push('/')}
            className="mt-4"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <p className="text-gray-600">We couldn't find your order. Please check your email for confirmation or contact support.</p>
          <Button 
            onClick={() => router.push('/')}
            className="mt-4"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }
  
  const hasResultFiles = order.results?.some(result => result.fileAttachment);
  
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return null;
    
    if (fileType.includes('image')) {
      return <File className="h-4 w-4 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const handleViewFile = (file: {name: string, type: string, url: string}) => {
    setSelectedFile(file);
    setFileViewerOpen(true);
  };
  
  const generateInvoicePDF = () => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text('OurTopClinic', 20, 20);
    doc.setFontSize(10);
    doc.text('SE 6th St Ste 200-V', 20, 30);
    doc.text('FL 33483, United States', 20, 35);
    doc.text('Phone: +1 888-932-4771', 20, 40);
    
    // Add invoice details
    doc.setFontSize(16);
    doc.text(`Invoice #INV-${order.orderNumber}`, 20, 60);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 70);
    if (order.transactionId) {
      doc.text(`Transaction ID: ${order.transactionId}`, 20, 75);
    }
    
    // Add patient information
    doc.text('Bill To:', 20, 90);
    doc.text(order.userName || 'Patient', 20, 100);
    doc.text(order.userEmail || 'No email provided', 20, 105);
    
    // Add items table
    const tableData = order.tests.map(item => [
      item.test.name,
      item.quantity.toString(),
      `$${item.test.price.toFixed(2)}`,
      `$${(item.test.price * item.quantity).toFixed(2)}`
    ]);
    // Add draw fee as a separate row
    tableData.push([
      'Draw Fee',
      '',
      '',
      `$${DRAW_FEE.toFixed(2)}`
    ]);
    autoTable(doc, {
      startY: 120,
      head: [['Test', 'Quantity', 'Unit Price', 'Amount']],
      body: tableData,
      foot: [['', '', 'Total', `$${order.totalAmount?.toFixed(2)}`]],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Add payment information
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.text('Payment Information:', 20, finalY + 20);
    doc.text(`Method: ${order.paymentMethod === 'credit_card' ? 'Credit Card' : 'Insurance'}`, 20, finalY + 30);
    doc.text(`Status: ${order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}`, 20, finalY + 35);
    if (order.paymentDate) {
      doc.text(`Date: ${new Date(order.paymentDate).toLocaleDateString()}`, 20, finalY + 40);
    }
    
    // Add footer
    doc.setFontSize(8);
    doc.text('Thank you for choosing OurTopClinic for your healthcare needs.', 20, finalY + 60);
    doc.text('This is a computer-generated document and does not require a signature.', 20, finalY + 65);
    
    return doc;
  };

  const handleDownloadInvoice = () => {
    const doc = generateInvoicePDF();
    doc.save(`invoice-${order.orderNumber}.pdf`);
  };

  const handleViewInvoice = () => {
    const doc = generateInvoicePDF();
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };
  
  return (
    <div className="container mx-auto px-4 py-12 bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Order Placed Successfully!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Order #{order.orderNumber} has been placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        
        <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700 rounded-2xl shadow-2xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/80">
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Ordered Tests</h3>
                <div className="space-y-3">
                  {order.tests.map(item => (
                    <div key={item.test.id} className="flex justify-between">
                      <div>
                        <p className="dark:text-gray-100">{item.test.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                            {item.test.code}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <p className="font-medium dark:text-gray-100">${(item.test.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                    <p className="dark:text-gray-100">{order.paymentMethod === 'credit_card' ? 'Credit Card' : 'Insurance'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
                    <div>
                      {order.paymentStatus === 'paid' ? (
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800">
                          {order.paymentStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {order.paymentMethod === 'credit_card' && order.transactionId && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Stripe Transaction ID</p>
                      <p className="font-mono text-sm dark:text-gray-100">{order.transactionId}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="text-lg font-bold dark:text-gray-100">${order.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {order.paymentStatus === 'paid' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => setInvoiceOpen(true)}>
                      <FileText size={18} className="mr-2" />
                      <span>View Invoice</span>
                    </div>
                    <Button variant="outline" className="dark:border-gray-600 dark:text-gray-200" onClick={() => setInvoiceOpen(true)}>
                      Download
                    </Button>
                  </div>
                </>
              )}
              
              {order.paymentMethod === 'insurance' && order.paymentStatus !== 'paid' && (
                <>
                  <Separator />
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Insurance Verification Pending</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Your order has been placed with insurance. We will verify your insurance coverage and contact you if there are any issues. 
                      You will receive an email notification when your insurance has been verified.
                    </p>
                  </div>
                </>
              )}
              
              {hasResultFiles && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Test Result Files</h3>
                    <div className="space-y-2">
                      {order.results?.filter(result => result.fileAttachment).map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/80 rounded-md">
                          <div className="flex items-center">
                            {getFileIcon(result.fileAttachment?.type)}
                            <span className="ml-2 dark:text-gray-100">{result.fileAttachment?.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="dark:text-blue-400"
                            onClick={() => handleViewFile(result.fileAttachment!)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {order.status === 'scheduled' || order.scheduledDate ? (
          <Card className="mb-8 dark:bg-blue-900/30 dark:border-blue-700 rounded-2xl shadow-xl">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
              <CardTitle className="text-lg text-blue-700 dark:text-blue-200 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {order.scheduledDate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium dark:text-gray-100">{order.scheduledDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-medium dark:text-gray-100">{order.scheduledTime}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium dark:text-gray-100">{order.location}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  You can view your appointment details in your account in "My Tests" section.
                </p>
              )}
            </CardContent>
          </Card>
        ) : insurancePending ? (
          <Card className="mb-8 dark:bg-blue-900/30 dark:border-blue-700 rounded-2xl shadow-xl">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/40">
              <CardTitle className="text-lg text-blue-700 dark:text-blue-200">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Once your insurance has been verified, we will contact you to schedule your appointment.
              </p>
            </CardContent>
          </Card>
        ) : null}
        
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            className="dark:border-gray-600 dark:text-gray-200"
            onClick={() => router.push('/')}
          >
            Continue Shopping
          </Button>
          <Button 
            className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => router.push('/my-tests')}
          >
            View My Orders
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
      
      {/* Invoice Viewer Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice #{order.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">OurTopClinic</h3>
                <p className="text-sm text-gray-500">SE 6th St Ste 200-V</p>
                <p className="text-sm text-gray-500">FL 33483, United States</p>
                <p className="text-sm text-gray-500">Phone: +1 888-932-4771</p>
              </div>
              <div className="text-right">
                <h4 className="font-semibold">Invoice</h4>
                <p className="text-sm">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                <p className="text-sm">Invoice #: INV-{order.orderNumber}</p>
                {order.transactionId && (
                  <p className="text-sm">Stripe Transaction ID: {order.transactionId}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Bill To:</h4>
              <p>{order.userName || 'Patient'}</p>
              <p className="text-sm text-gray-500">{order.userEmail || 'No email provided'}</p>
            </div>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Test</th>
                  <th className="p-2 text-center">Quantity</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.tests.map(item => (
                  <tr key={item.test.id} className="border-b">
                    <td className="p-2">
                      <div>
                        <p>{item.test.name}</p>
                        <p className="text-xs text-gray-500">Code: {item.test.code}</p>
                      </div>
                    </td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">${item.test.price.toFixed(2)}</td>
                    <td className="p-2 text-right">${(item.test.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Draw Fee row */}
                <tr className="border-b">
                  <td className="p-2">Draw Fee</td>
                  <td className="p-2 text-center"></td>
                  <td className="p-2 text-right"></td>
                  <td className="p-2 text-right">${DRAW_FEE.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="p-2" colSpan={3}>Total</td>
                  <td className="p-2 text-right">${order.totalAmount?.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div className="text-sm">
              <h4 className="font-semibold mb-1">Payment Information:</h4>
              <p>Method: {order.paymentMethod === 'credit_card' ? 'Credit Card' : 'Insurance'}</p>
              <p>Status: {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}</p>
              {order.transactionId && (
                <p>Stripe Transaction ID: {order.transactionId}</p>
              )}
              {order.paymentDate && (
                <p>Date: {new Date(order.paymentDate).toLocaleDateString()}</p>
              )}
            </div>
            
            <div className="text-sm text-gray-500 text-center mt-8">
              <p>Thank you for choosing OurTopClinic for your healthcare needs.</p>
              <p>This is a computer-generated document and does not require a signature.</p>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline"
                onClick={handleViewInvoice}
              >
                <FileText className="h-4 w-4 mr-2" />
                View PDF
              </Button>
              <Button 
                onClick={handleDownloadInvoice}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* File Viewer */}
      <Sheet open={fileViewerOpen} onOpenChange={setFileViewerOpen}>
        <SheetContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {selectedFile?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 h-[80vh] overflow-auto">
            {selectedFile?.type?.includes('image') ? (
              <div className="flex flex-col items-center">
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.name}
                  className="max-w-full object-contain rounded-md shadow-md"
                />
                <a 
                  href={selectedFile.url} 
                  download={selectedFile.name}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download Image
                </a>
              </div>
            ) : selectedFile?.type?.includes('pdf') ? (
              <div className="flex flex-col items-center">
                <iframe 
                  src={selectedFile.url} 
                  title={selectedFile.name}
                  className="w-full h-[70vh] border rounded-md shadow-md"
                />
                <a 
                  href={selectedFile.url} 
                  download={selectedFile.name}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download PDF
                </a>
              </div>
            ) : (
              <div className="text-center p-8 border rounded-md">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium">This file type cannot be previewed</p>
                <a 
                  href={selectedFile?.url} 
                  download={selectedFile?.name}
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OrderConfirmation;
