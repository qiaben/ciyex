"use client"
import React, { useState, useEffect } from 'react';
import { useTestOrders } from '@/components/context/TestOrderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';        
import { useRouter } from 'next/navigation'; 
import { FileText, Calendar, ArrowRight, FileSearch, Eye, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ElabNavbar } from "@/components/elab/ElabNavbar";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";

interface TestResult {
  id: number;
  testId: number;
  resultValue: string | null;
  normalRange: string | null;
  unit: string | null;
  status: string;
  reviewed: boolean;
  test: {
    name: string;
    description: string | null;
  };
  fileAttachment?: {
    url: string;
    name?: string;
  };
}

interface OrderItem {
  id: number;
  testId: number;
  test: {
    name: string;
    description: string | null;
  };
  testName: string;
  testCode: string | null;
  testDescription: string | null;
  testPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  orderDate: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone: string;
  patientDob: string;
  patientGender: string;
  patientAddress: string;
  patientCity: string;
  patientState: string;
  patientZipCode: string;
  orderItems: OrderItem[];
  results: TestResult[];
}

const MyTests = () => {
  const { getAllUserOrders } = useTestOrders();
  const router = useRouter(); 
  const { toast } = useToast();
  const { userId } = useAuth();
  
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const ordersFromContext = getAllUserOrders();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("Fetching orders for user:", userId);
        const response = await fetch("/api/lab-orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        console.log("Raw API response:", data);
        console.log("First order items:", data[0]?.orderItems);
        console.log("First order results:", data[0]?.results);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);
  
  // Automatically set order status to COMPLETED if all test results are completed
  const processedOrders = orders.map(order => {
    const allCompleted = order.results && order.orderItems && order.orderItems.length > 0 &&
      order.orderItems.every(item => {
        const result = order.results.find(r => r.testId === item.testId);
        return result && result.status && result.status.toUpperCase() === 'COMPLETED';
      });
    return allCompleted ? { ...order, status: 'COMPLETED' } : order;
  });

  // Filter orders based on the active tab
  const filteredOrders = processedOrders.filter(order => {
    console.log("Filtering order:", order);
    if (activeTab === 'all') return true;
    if (activeTab === 'scheduled') {
      // Show orders that are scheduled and not completed
      const isScheduled = order.status.toUpperCase() === 'SCHEDULED';
      console.log("Order scheduled status:", isScheduled);
      return isScheduled;
    }
    if (activeTab === 'completed') {
      // Show orders that are completed
      const isCompleted = order.status.toUpperCase() === 'COMPLETED';
      console.log("Order completed status:", isCompleted);
      return isCompleted;
    }
    return true;
  });

  // Separate orders into past and upcoming
  const today = new Date();
  const pastOrders = processedOrders.filter(order => {
    const orderDate = new Date(order.orderDate);
    const isPast = orderDate < today && order.status.toUpperCase() === 'COMPLETED';
    console.log("Order past status:", isPast, "Date:", orderDate, "Status:", order.status);
    return isPast;
  });

  const upcomingOrders = processedOrders.filter(order => {
    const isUpcoming = order.status.toUpperCase() === 'SCHEDULED';
    console.log("Order upcoming status:", isUpcoming, "Status:", order.status);
    return isUpcoming;
  });
  
  console.log("Filtered orders:", filteredOrders);
  console.log("Past orders:", pastOrders);
  console.log("Upcoming orders:", upcomingOrders);
  
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return (
          <Badge className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm">
            <Clock className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/50 dark:to-rose-800/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1 shadow-sm">
            <AlertCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    window.open(url, '_blank');
    
    toast({
      title: "File Download",
      description: `${fileName} is being downloaded.`,
    });
  };
  
  const selectedOrder = selectedOrderId ? orders.find(order => order.id === selectedOrderId) : null;
  
  const handleDownloadInvoice = async (orderId: number | undefined) => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/invoice/${orderId}`);
      if (!res.ok) {
        toast({ title: 'Download Failed', description: 'Could not download invoice.', variant: 'destructive' });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Invoice Downloaded', description: 'Your invoice has started downloading.' });
    } catch (err) {
      toast({ title: 'Download Failed', description: 'Could not download invoice.', variant: 'destructive' });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No test orders found</div>
      </div>
    );
  }
  
  return (
    <>
      <ElabNavbar />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">My Lab Tests</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">View your test orders and results</p>
          </div>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-600 dark:to-slate-500 text-white hover:from-slate-800 hover:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 shadow-md transition-all duration-200 text-base py-3 sm:py-2"
            onClick={() => router.push('/Elabs')}
          >
            Order New Test
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative mb-6 sm:mb-8">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6 sm:mb-8">
            <TabsList className="w-full flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 gap-0">
              <TabsTrigger value="all" className={`flex-1 px-4 py-2 text-base font-semibold transition-all border-r last:border-r-0 border-slate-200 dark:border-slate-700
                ${activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'bg-transparent text-slate-500 dark:text-slate-400'}`}>All Tests</TabsTrigger>
              <TabsTrigger value="scheduled" className={`flex-1 px-4 py-2 text-base font-semibold transition-all border-r last:border-r-0 border-slate-200 dark:border-slate-700
                ${activeTab === 'scheduled' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'bg-transparent text-slate-500 dark:text-slate-400'}`}>Scheduled</TabsTrigger>
              <TabsTrigger value="completed" className={`flex-1 px-4 py-2 text-base font-semibold transition-all border-slate-200 dark:border-slate-700
                ${activeTab === 'completed' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'bg-transparent text-slate-500 dark:text-slate-400'}`}>Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
            <FileSearch className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">No tests found</h2>
            <p className="text-gray-500 mb-6 text-base sm:text-lg">
              {activeTab === 'all' 
                ? "You haven't ordered any lab tests yet." 
                : activeTab === 'scheduled'
                  ? "You don't have any scheduled tests."
                  : "You don't have any completed tests."}
            </p>
            <Button 
              className="w-full sm:w-auto bg-elab-medical-blue hover:bg-blue-700 text-base py-3 sm:py-2"
              onClick={() => router.push('/Elabs')}
            >
              Browse Lab Tests
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-none sm:rounded-lg shadow-none sm:shadow-lg p-3 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      Date: {format(new Date(order.orderDate), "PPP")}
                    </p>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {order.orderItems?.map((item) => {
                    const result = order.results.find((r) => r.testId === item.testId);
                    return (
                      <div
                        key={item.id}
                        className="bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md p-3 sm:p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base sm:text-lg">{item.testName}</h3>
                            {item.testDescription && (
                              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                {item.testDescription}
                              </p>
                            )}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm mt-2 sm:mt-0 sm:ml-2 w-fit sm:w-auto ${
                              result?.status?.toUpperCase() === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-200"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {result?.status?.toUpperCase() || "SCHEDULED"}
                          </div>
                        </div>

                        {result?.status?.toUpperCase() === "COMPLETED" && (
                          <div className="mt-3 sm:mt-4 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 px-3 py-1.5 rounded-full">
                              <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-200" />
                              <span className="text-sm">Test Results Available</span>
                            </div>
                            {result.fileAttachment?.url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const url = result.fileAttachment!.url;
                                  const fileKey = url.replace('test-results/', '');
                                  const secureUrl = `/api/test-results/${fileKey}`;
                                  window.open(secureUrl, '_blank');
                                }}
                                className="flex items-center gap-2 w-full sm:w-auto justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200 dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:text-emerald-200 dark:border-emerald-200 text-base py-3 sm:py-2"
                              >
                                <FileText className="h-4 w-4 text-emerald-700 dark:text-emerald-200" />
                                <span>View Test Results</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Order details dialog */}
        <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                Order #{selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>
                
                {/* Tests and Results Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Tests & Results</h3>
                  <div className="rounded-md border overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                          <TableHead className="text-slate-700 dark:text-slate-300">Test</TableHead>
                          <TableHead className="text-slate-700 dark:text-slate-300">Code</TableHead>
                          <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                          <TableHead className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-slate-700 dark:text-slate-300">Test Results</span>
                              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                Click icon to view
                              </div>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.orderItems?.map((item) => {
                          const result = selectedOrder.results?.find((r) => r.testId === item.testId);
                          const isCompleted = result?.status?.toUpperCase() === 'COMPLETED';
                          return (
                            <TableRow key={item.id} className={isCompleted ? "bg-gradient-to-r from-emerald-50/50 to-emerald-50/30 dark:from-emerald-900/20 dark:to-emerald-800/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}>
                              <TableCell className="font-medium text-slate-800 dark:text-slate-200">{item.testName}</TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-400">{item.testCode}</TableCell>
                              <TableCell>{getStatusBadge(result?.status || 'SCHEDULED')}</TableCell>
                              <TableCell className="text-right">
                                {isCompleted && !!result?.fileAttachment?.url ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Results Available</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        if (result?.fileAttachment?.url) {
                                          const url = result.fileAttachment.url;
                                          const fileKey = url.replace('test-results/', '');
                                          const secureUrl = `/api/test-results/${fileKey}`;
                                          window.open(secureUrl, '_blank');
                                        }
                                      }}
                                      title="Click to view your test results"
                                      className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800 dark:hover:to-emerald-700 border-emerald-200 dark:border-emerald-700 shadow-sm"
                                    >
                                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400 dark:text-slate-500">Results pending</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Payment Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Payment Information</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">
                          {selectedOrder.paymentMethod?.toUpperCase() === 'CARD' || selectedOrder.paymentMethod?.toUpperCase() === 'CREDIT_CARD'
                            ? 'Credit Card'
                            : selectedOrder.paymentMethod?.charAt(0).toUpperCase() + selectedOrder.paymentMethod?.slice(1).toLowerCase() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <p className="font-medium">
                          {selectedOrder.paymentStatus?.toUpperCase() === 'PAID'
                            ? 'Paid'
                            : selectedOrder.paymentStatus?.charAt(0).toUpperCase() + selectedOrder.paymentStatus?.slice(1).toLowerCase() || 'N/A'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold">
                          ${selectedOrder.totalAmount?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => setSelectedOrderId(null)} 
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Test History Section - Redesigned */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Test History</h2>
          {pastOrders.length > 0 ? (
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                    <TableHead className="text-slate-700 dark:text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Order #</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Test</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Results</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <TableCell className="text-slate-600 dark:text-slate-400">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-slate-200">#{order.orderNumber}</TableCell>
                      <TableCell>
                        {order.orderItems?.length > 1 ? (
                          <span className="text-slate-700 dark:text-slate-300">{order.orderItems[0].testName} +{order.orderItems.length - 1} more</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{order.orderItems?.[0]?.testName}</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-600 dark:text-slate-400">
                            {order.results?.filter(r => r.status === 'COMPLETED').length || 0}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">/</span>
                          <span className="text-slate-600 dark:text-slate-400">{order.orderItems?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.results?.some(r => r.status === 'COMPLETED' && r.fileAttachment?.url) ? (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrderId(order.id)}
                              className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800 dark:hover:to-emerald-700 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                              onClick={() => {
                                const completedResult = order.results.find(r => r.status === 'COMPLETED' && r.fileAttachment?.url);
                                if (completedResult && completedResult.fileAttachment?.url) {
                                  const url = completedResult.fileAttachment.url;
                                  const fileKey = url.replace('test-results/', '');
                                  const secureUrl = `/api/test-results/${fileKey}`;
                                  window.open(secureUrl, '_blank');
                                }
                              }}
                            >
                              <FileText className="h-4 w-4" />
                              <span>View Results</span>
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400">No test history available yet</p>
            </div>
          )}
        </div>

        {/* Upcoming Tests Section - Redesigned */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">Upcoming Tests</h2>
          {upcomingOrders.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {upcomingOrders.map(order => (
                <Card key={order.id} className="overflow-hidden border-slate-100 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <CardTitle className="text-lg flex justify-between items-center text-slate-800 dark:text-slate-200">
                      <span>#{order.orderNumber}</span>
                      {getStatusBadge(order.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled Date</p>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{format(new Date(order.orderDate), "PPP")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="bg-slate-100 dark:bg-slate-700" />
                    
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Tests</p>
                      <div className="space-y-1">
                        {order.orderItems?.map(item => (
                          <div key={item.id} className="text-sm">
                            <strong className="text-slate-800 dark:text-slate-200">{item.testName}</strong>
                            {item.testCode && <span className="text-slate-500 dark:text-slate-400"> (Code: {item.testCode})</span>}
                            {item.testDescription && <div className="text-xs text-slate-500 dark:text-slate-400">{item.testDescription}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-600 dark:to-slate-500 text-white hover:from-slate-800 hover:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 shadow-md transition-all duration-200"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400">No upcoming tests scheduled</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyTests; 