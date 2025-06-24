import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestOrders } from '@/components/context/TestOrderContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, TrendingUp, Users, Bell } from 'lucide-react';

const AdminHeader = () => {
  const { getAllUserOrders } = useTestOrders();
  const allOrders = getAllUserOrders();
  
  // Calculate statistics
  const totalRevenue = allOrders
    .filter(order => order.paymentStatus === 'paid')
    .reduce((total, order) => total + (order.totalAmount || 0), 0);
    
  const pendingOrders = allOrders.filter(order => 
    order.status === 'processing' || 
    order.paymentStatus === 'pending'
  ).length;
  
  const totalCustomers = [...new Set(allOrders.map(order => order.userEmail))].length;
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage orders, process insurance, and upload test results</p>
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
            <p className="text-xs text-gray-500 mt-1">From {allOrders.length} orders</p>
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
            <div className="text-2xl font-bold">{allOrders.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {allOrders.filter(o => o.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center">
              Total Customers
              <Users className="ml-auto h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">Unique customers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHeader;
