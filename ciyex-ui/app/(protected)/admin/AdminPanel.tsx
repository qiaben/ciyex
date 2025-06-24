"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestOrders } from '@/components/context/TestOrderContext';
import OrdersList from './OrdersList';
// import InsuranceProcessing from './InsuranceProcessing';
import ResultsUpload from './ResultsUpload';
import AdminStatistics from './AdminStatistics';
import AdminHeader from './AdminHeader';
import ServicesSection from './ServicesSection';

const AdminPanel = () => {
  const { getAllUserOrders } = useTestOrders();
  const allOrders = getAllUserOrders();
  
  const [mainTab, setMainTab] = useState('elab');

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="elab" value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="elab">Lab</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="elab" className="mt-8">
          <AdminHeader />
          
          <Tabs defaultValue="dashboard" className="mt-8">
            <TabsList className="grid grid-cols-3 md:w-auto">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="orders">All Orders</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="dashboard">
                <AdminStatistics orders={allOrders} />
              </TabsContent>
              
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrdersList orders={allOrders} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              
              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResultsUpload orders={allOrders} />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="services" className="mt-8">
          <ServicesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
