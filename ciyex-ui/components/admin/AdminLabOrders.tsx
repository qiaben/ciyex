"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, TrendingUp, Users, Bell, Calendar, FileText, Search, FileSearch, Eye, Upload, Check, File, FileImage } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';

interface LabOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  tests: {
    test: {
      id: string;
      name: string;
      code: string;
      price: number;
    };
    quantity: number;
  }[];
  results: {
    testId: string;
    resultValue?: string;
    normalRange?: string;
    unit?: string;
    status: string;
    reviewed: boolean;
    fileAttachment?: {
      name: string;
      type: string;
      url: string;
      key: string;
    };
  }[];
  userEmail: string;
  userName: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  transactionId?: string;
}

interface TestResult {
  testId: string;
  resultValue?: string;
  normalRange?: string;
  unit?: string;
  status: string;
  reviewed: boolean;
  fileAttachment?: {
    name: string;
    type: string;
    url: string;
    key: string;
  };
}

const AdminHeader = ({ orders }: { orders: LabOrder[] }) => {
  const totalRevenue = orders
    .filter(order => order.paymentStatus === 'paid')
    .reduce((total, order) => total + (order.totalAmount || 0), 0);
    
  const pendingOrders = orders.filter(order => 
    order.status === 'scheduled' || 
    order.paymentStatus === 'pending'
  ).length;
  
  const totalCustomers = [...new Set(orders.map(order => order.userEmail))].length;
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Lab Orders Dashboard</h1>
          <p className="text-gray-500">Manage lab orders and track results</p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mr-2">
            Admin Mode
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            <Bell className="h-3.5 w-3.5 mr-1" />
            {pendingOrders} pending
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center">
              Total Revenue
              <TrendingUp className="ml-auto h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">From {orders.length} orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center">
              Total Orders
              <ArrowUpRight className="ml-auto h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {orders.filter(o => o.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center">
              Total Patients
              <Users className="ml-auto h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">Unique patients</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminStatistics = ({ orders }: { orders: LabOrder[] }) => {
  // Get current date and date 30 days ago
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Filter orders for the last 30 days
  const recentOrders = orders.filter(order => 
    new Date(order.orderDate) >= thirtyDaysAgo
  );
  
  // Group orders by date
  const ordersByDate = recentOrders.reduce((acc, order) => {
    const dateStr = new Date(order.orderDate).toLocaleDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = { count: 0, revenue: 0 };
    }
    
    acc[dateStr].count += 1;
    acc[dateStr].revenue += order.totalAmount || 0;
    
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);
  
  // Create chart data
  const chartData = Object.keys(ordersByDate).map(date => ({
    date,
    orders: ordersByDate[date].count,
    revenue: ordersByDate[date].revenue
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate totals and statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'processing').length;
  const scheduledOrders = orders.filter(order => order.status === 'scheduled').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  
  const totalRevenue = orders
    .filter(order => order.paymentStatus === 'paid')
    .reduce((total, order) => total + (order.totalAmount || 0), 0);
    
  const pendingRevenue = orders
    .filter(order => order.paymentStatus === 'pending')
    .reduce((total, order) => total + (order.totalAmount || 0), 0);
    
  // Calculate test statistics
  const testCounts = orders.reduce((acc, order) => {
    order.tests.forEach(item => {
      const testId = item.test.id;
      if (!acc[testId]) {
        acc[testId] = {
          name: item.test.name,
          code: item.test.code,
          count: 0
        };
      }
      acc[testId].count += item.quantity;
    });
    return acc;
  }, {} as Record<string, { name: string; code: string; count: number }>);
  
  // Get top 5 tests
  const topTests = Object.values(testCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime orders</p>
            <div className="grid grid-cols-3 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Pending</p>
                <p className="font-medium">{pendingOrders}</p>
              </div>
              <div>
                <p className="text-gray-500">Scheduled</p>
                <p className="font-medium">{scheduledOrders}</p>
              </div>
              <div>
                <p className="text-gray-500">Completed</p>
                <p className="font-medium">{completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {((totalRevenue / (totalRevenue + pendingRevenue)) * 100).toFixed(1)}% collection rate
              </span>
            </p>
            <div className="mt-4">
              <p className="text-gray-500 text-sm">Pending Revenue</p>
              <p className="font-medium">${pendingRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentOrders.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Orders in the last 30 days</p>
            <div className="grid grid-cols-2 mt-4 text-sm">
              <div>
                <p className="text-gray-500">This Week</p>
                <p className="font-medium">
                  {orders.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return orderDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Today</p>
                <p className="font-medium">
                  {orders.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    const today = new Date();
                    return orderDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Order Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTests.map((test, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-xs text-gray-500">{test.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{test.count}</p>
                    <p className="text-xs text-gray-500">orders</p>
                  </div>
                </div>
              ))}
              
              {topTests.length === 0 && (
                <p className="text-gray-500 text-center py-6">
                  No test data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const OrdersList = ({ orders }: { orders: LabOrder[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getPaymentStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="border-green-500 text-green-700">Paid</Badge>;
      case 'failed':
        return <Badge variant="outline" className="border-red-500 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center">
                    <FileSearch className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-gray-500 mb-2">No orders found matching your criteria</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map(order => (
                <React.Fragment key={order.id}>
                  <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => setShowDetails(showDetails === order.id ? null : order.id)}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>{order.userName || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell>${order.totalAmount?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(showDetails === order.id ? null : order.id);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        alert('View invoice simulation');
                      }}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {showDetails === order.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-gray-50 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Order Details</h4>
                            <div className="space-y-2">
                              <p><span className="text-gray-500">Email:</span> {order.userEmail}</p>
                              <p><span className="text-gray-500">Payment Method:</span> {'CARD'}</p>
                              {order.paymentMethod === 'credit_card' && order.transactionId && (
                                <p><span className="text-gray-500">Transaction ID:</span> {order.transactionId}</p>
                              )}
                              {order.scheduledDate && (
                                <p><span className="text-gray-500">Appointment:</span> {order.scheduledDate} at {order.scheduledTime}</p>
                              )}
                              {order.location && (
                                <p><span className="text-gray-500">Location:</span> {order.location}</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Tests Ordered</h4>
                            <div className="space-y-2">
                              {order.tests.map((item) => (
                                <div key={item.test.id} className="flex justify-between">
                                  <p>{item.test.name} (x{item.quantity})</p>
                                  <p>${(item.test.price * item.quantity).toFixed(2)}</p>
                                </div>
                              ))}
                              <div className="pt-2 border-t mt-2 flex justify-between font-medium">
                                <p>Total</p>
                                <p>${order.totalAmount?.toFixed(2) || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const ResultsUpload = ({ orders }: { orders: LabOrder[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Filter completed orders but without results or with pending/processing results
  const eligibleOrders = orders.filter(order => 
    (order.status === 'completed' || order.status === 'scheduled') &&
    order.paymentStatus === 'paid'
  );
  
  // Filter based on search term
  const filteredOrders = eligibleOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.tests.some(item => 
      item.test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.test.code.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only.",
          variant: "destructive"
        });
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a PDF file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };
  
  const uploadFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', activeOrderId!);
      formData.append('testId', activeTestId!);

      const response = await fetch('/api/admin/upload-result', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return data.fileKey;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  const handleSubmitResult = async (orderId: string, testId: string) => {
    try {
      setUploading(true);
      console.log('Starting result submission for:', { orderId, testId });

      let fileKey = '';
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        fileKey = await uploadFile(selectedFile);
        console.log('File uploaded, key:', fileKey);
      }

      // Create result data object
      const resultData = {
        orderId: Number(orderId),
        testId: Number(testId),
        resultValue,
        normalRange,
        unit,
        status: 'COMPLETED',
        fileAttachment: fileKey ? {
          key: fileKey,
          name: selectedFile?.name || '',
          uploadedAt: new Date().toISOString()
        } : undefined
      };

      console.log('Saving result data:', resultData);

      // Save result data
      const response = await fetch('/api/admin/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        throw new Error('Failed to save result');
      }

      const savedData = await response.json();
      console.log('Result saved successfully:', savedData);

      // Reset form
      setResultValue('');
      setNormalRange('');
      setUnit('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setActiveOrderId(null);
      setActiveTestId(null);
      
      toast({
        title: "Result Uploaded",
        description: selectedFile 
          ? `The test result and ${selectedFile.name} have been uploaded successfully.`
          : "The test result has been uploaded successfully.",
      });

      // Refresh the orders list
      window.location.reload();
    } catch (error) {
      console.error('Error submitting result:', error);
      toast({
        title: "Error",
        description: "Failed to upload result. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const getResultStatus = (order: LabOrder, testId: string) => {
    const result = order.results?.find(r => r.testId === testId);
    
    if (!result) {
      return <Badge variant="outline">Pending</Badge>;
    }
    
    switch(result.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const getResultValue = (order: LabOrder, testId: string) => {
    const result = order.results?.find(r => r.testId === testId);
    
    if (!result || !result.resultValue) {
      return 'No result';
    }
    
    return `${result.resultValue} ${result.unit || ''}`;
  };

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return null;
    
    if (fileType.includes('image')) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const hasFileAttachment = (order: LabOrder, testId: string) => {
    const result = order.results?.find(r => r.testId === testId);
    return result?.fileAttachment?.url ? true : false;
  };
  
  const handleViewPdf = (result: TestResult) => {
    if (!result?.fileAttachment?.url) {
      toast({
        title: "Error",
        description: "No PDF file available for this test result",
        variant: "destructive"
      });
      return;
    }

    // Remove the test-results/ prefix from the URL
    const fileKey = result.fileAttachment.url.replace('test-results/', '');
    const secureUrl = `/api/test-results/${fileKey}`;
    // Open the PDF in a new tab
    window.open(secureUrl, '_blank');
  };

  if (eligibleOrders.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No Orders Requiring Results</h3>
        <p className="text-gray-500">There are no completed orders requiring test results.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search by order number, patient, or test..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {filteredOrders.map(order => (
        <div key={order.id} className="mb-10 border rounded-md">
          <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="font-medium">
                Order #{order.orderNumber} - {order.userName || 'No name'}
              </h3>
              <p className="text-sm text-gray-500">
                Date: {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>PDF Result</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.tests.map(item => (
                  <React.Fragment key={item.test.id}>
                    <TableRow>
                      <TableCell className="font-medium">{item.test.name}</TableCell>
                      <TableCell>{item.test.code}</TableCell>
                      <TableCell>{getResultStatus(order, item.test.id)}</TableCell>
                      <TableCell>{getResultValue(order, item.test.id)}</TableCell>
                      <TableCell>
                        {(() => {
                          const result = order.results?.find(r => r.testId === item.test.id);
                          console.log('Test result:', {
                            testId: item.test.id,
                            result,
                            fileAttachment: result?.fileAttachment
                          });
                          
                          if (!result?.fileAttachment?.url) {
                            console.log('No file attachment found for test:', item.test.id);
                            return null;
                          }
                          
                          // Remove the test-results/ prefix from the URL
                          const fileKey = result.fileAttachment.url.replace('test-results/', '');
                          console.log('File key:', fileKey);
                          
                          // Use our secure API route
                          const secureUrl = `/api/test-results/${fileKey}`;
                          console.log('Generated secure URL:', secureUrl);
                          
                          return (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-red-500" />
                              <a
                                href={secureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-blue-600 hover:underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log('Opening secure URL:', secureUrl);
                                  handleViewPdf(result);
                                }}
                              >
                                View PDF
                              </a>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setActiveOrderId(order.id);
                            setActiveTestId(item.test.id);
                            
                            // Pre-populate form with existing data if available
                            const existingResult = order.results?.find(r => r.testId === item.test.id);
                            if (existingResult) {
                              setResultValue(existingResult.resultValue || '');
                              setNormalRange(existingResult.normalRange || '');
                              setUnit(existingResult.unit || '');
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            } else {
                              setResultValue('');
                              setNormalRange('');
                              setUnit('');
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }
                          }}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          {hasFileAttachment(order, item.test.id) 
                            ? 'Update Result' 
                            : 'Upload Result'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {activeOrderId === order.id && activeTestId === item.test.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-4">
                          <div className="space-y-4">
                            <h4 className="font-medium">Upload Result for {item.test.name}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="col-span-1 md:col-span-3">
                                <Label htmlFor="resultValue">Result Value</Label>
                                <Textarea
                                  id="resultValue"
                                  value={resultValue}
                                  onChange={(e) => setResultValue(e.target.value)}
                                  placeholder="Enter test result value"
                                  className="h-20"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="normalRange">Normal Range</Label>
                                <Input
                                  id="normalRange"
                                  value={normalRange}
                                  onChange={(e) => setNormalRange(e.target.value)}
                                  placeholder="e.g. 70-100 mg/dL"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="unit">Unit</Label>
                                <Input
                                  id="unit"
                                  value={unit}
                                  onChange={(e) => setUnit(e.target.value)}
                                  placeholder="e.g. mg/dL"
                                />
                              </div>
                              
                              <div className="flex flex-col">
                                <Label htmlFor="result-file">Upload PDF Result</Label>
                                <input 
                                  type="file" 
                                  id="result-file" 
                                  ref={fileInputRef}
                                  className="hidden" 
                                  accept=".pdf"
                                  onChange={handleFileChange}
                                />
                                <div className="flex items-center mt-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select PDF
                                  </Button>
                                  {selectedFile && (
                                    <span className="ml-3 text-sm text-gray-500">
                                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Upload a PDF file of the test results (max 5MB)
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setActiveOrderId(null);
                                  setActiveTestId(null);
                                  setSelectedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleSubmitResult(order.id, item.test.id)}
                                disabled={!selectedFile || uploading}
                                className="bg-elab-medical-blue hover:bg-blue-700 text-black hover:text-white"
                              >
                                {uploading ? (
                                  <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Save Result
                                  </>
                                )}
                              </Button>
                              {selectedFile && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="ml-2"
                                  onClick={() => {
                                    const url = URL.createObjectURL(selectedFile);
                                    window.open(url, '_blank');
                                    setTimeout(() => URL.revokeObjectURL(url), 10000);
                                  }}
                                >
                                  View PDF
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
      
      {filteredOrders.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No orders found matching your criteria</p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSearchTerm('')}
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
};

export default function AdminLabOrders() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/lab-orders');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch orders: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched orders data:', data);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading orders...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader orders={orders} />
      
      <Tabs defaultValue="dashboard" className="mt-8">
        <TabsList className="grid grid-cols-3 md:w-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="dashboard">
            <AdminStatistics orders={orders} />
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Lab Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <OrdersList orders={orders} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsUpload orders={orders} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 