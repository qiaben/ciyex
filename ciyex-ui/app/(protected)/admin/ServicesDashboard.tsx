"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface ServiceStats {
  totalServices: number;
  activeServices: number;
  totalRevenue: number;
  pendingPayments: number;
  recentServices: {
    id: string;
    name: string;
    price: number;
    status: string;
  }[];
  revenueByService: {
    name: string;
    revenue: number;
  }[];
}

const COLORS = {
  light: ['#3b82f6', '#6366f1', '#f59e42', '#10b981', '#ef4444'],
  dark: ['#60a5fa', '#818cf8', '#fbbf24', '#34d399', '#f87171']
};

// Helper: Generate mock monthly income data for stacked bar chart
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const serviceNames = (stats: ServiceStats) => stats.revenueByService.map(s => s.name);

function getMonthlyIncomeData(stats: ServiceStats) {
  // For demo, randomly distribute revenue by service across months
  const data = months.map(month => {
    const entry: any = { month };
    stats.revenueByService.forEach(s => {
      // Randomly assign revenue for demo (in real app, use real data)
      entry[s.name] = Math.round(s.revenue * (0.15 + Math.random() * 0.2));
    });
    return entry;
  });
  return data;
}

const ServicesDashboard: React.FC<{ stats: ServiceStats }> = ({ stats }) => {
  const monthlyIncomeData = getMonthlyIncomeData(stats);
  const serviceList = serviceNames(stats);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Check if dark mode is enabled
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeMediaQuery.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeMediaQuery.addEventListener('change', handler);
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);

  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalServices}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stats.activeServices} active services
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ${stats.pendingPayments.toFixed(2)} pending
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeServices}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {((stats.activeServices / stats.totalServices) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.pendingPayments.toFixed(2)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {((stats.pendingPayments / stats.totalRevenue) * 100).toFixed(1)}% of total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Pie and Stacked Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Service Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats.revenueByService}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.revenueByService.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Stacked Bar Chart */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Monthly Income (Stacked by Service)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyIncomeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip />
                <Legend />
                {serviceList.map((service, idx) => (
                  <Bar key={service} dataKey={service} stackId="a" fill={colors[idx % colors.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Services */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Recent Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{service.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">${service.price.toFixed(2)}</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{service.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesDashboard; 