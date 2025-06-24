"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Assuming a similar data structure for services, adjust import if needed
// import { Service } from '@/components/context/ServicesContext';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ServiceStatisticsProps {
  // Define props based on your service data structure
  // services: Service[];
  // Using a generic data prop for now
  data: any[];
}

// This is a placeholder component. Replace with your actual service statistics logic.
const ServicesStatistics: React.FC<ServiceStatisticsProps> = ({ data }) => {
  // Placeholder data and logic based on AdminStatistics
  const totalServices = data.length; // Assuming each item in data is a service record
  const activeServices = data.filter(item => item.status === 'active').length; // Adjust status check as needed
  const pendingServices = data.filter(item => item.status === 'pending').length; // Adjust status check as needed
  const completedServices = data.filter(item => item.status === 'completed').length; // Adjust status check as needed

  const totalRevenue = data
    .filter(item => item.paymentStatus === 'paid') // Assuming payment status exists on service records or related data
    .reduce((total, item) => total + (item.price || 0), 0); // Assuming price field exists
    
  const pendingRevenue = data
    .filter(item => item.paymentStatus === 'pending') // Assuming payment status exists
    .reduce((total, item) => total + (item.price || 0), 0); // Assuming price field exists
    
  // Placeholder chart data (replace with actual aggregation logic based on service activity over time)
  const chartData = [
    { date: 'Jan', services: 4000 },
    { date: 'Feb', services: 3000 },
    { date: 'Mar', services: 5000 },
    { date: 'Apr', services: 4500 },
    { date: 'May', services: 6000 },
    { date: 'Jun', services: 5500 },
  ];
  
  // Placeholder top services (replace with actual logic)
  const topServices = [
    { name: 'Service A', count: 120 },
    { name: 'Service B', count: 90 },
    { name: 'Service C', count: 75 },
    { name: 'Service D', count: 50 },
    { name: 'Service E', count: 30 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Services Rendered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime services</p>
            <div className="grid grid-cols-3 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Pending</p>
                <p className="font-medium">{pendingServices}</p>
              </div>
              <div>
                <p className="text-gray-500">Active</p>
                <p className="font-medium">{activeServices}</p>
              </div>
              <div>
                <p className="text-gray-500">Completed</p>
                <p className="font-medium">{completedServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Services Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            {/* Adjust percentage calculation based on your data */}
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {/* Placeholder percentage */}
                {((totalRevenue / (totalRevenue + pendingRevenue)) * 100).toFixed(1)}% collection rate
              </span>
            </p>
            <div className="mt-4">
              <p className="text-gray-500 text-sm">Pending Revenue</p>
              <p className="font-medium">${pendingRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Placeholder Card - Adapt as needed for services */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Service Specific Metric</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">XX</div>
            <p className="text-xs text-gray-500 mt-1">Description of metric</p>
            <div className="mt-4">
              <p className="text-gray-500 text-sm">Another metric</p>
              <p className="font-medium">YY</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Placeholder Card - Adapt as needed for services */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Recent Service Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ZZ
            </div>
            <p className="text-xs text-gray-500 mt-1">Services in the last 30 days</p>
            <div className="grid grid-cols-2 mt-4 text-sm">
              <div>
                <p className="text-gray-500">This Week</p>
                <p className="font-medium">AA</p>
              </div>
              <div>
                <p className="text-gray-500">Today</p>
                <p className="font-medium">BB</p>
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
              Service Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="services" fill="#3b82f6" name="Services" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    {/* Assuming services have a code like tests */}
                    {/* <p className="text-xs text-gray-500">{service.code}</p> */}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{service.count}</p>
                    <p className="text-xs text-gray-500">rendered</p>
                  </div>
                </div>
              ))}
              
              {topServices.length === 0 && (
                <p className="text-gray-500 text-center py-6">
                  No service data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesStatistics; 