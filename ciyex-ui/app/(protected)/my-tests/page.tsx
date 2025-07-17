"use client";
import React, { useState, useEffect } from 'react';
import { useTestOrders } from '@/components/context/TestOrderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, ArrowRight, FileSearch, Eye, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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
import { format } from "date-fns";
import { getCurrentUserFromToken } from '../../utils/auth'; // Import your JWT utility function

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

    // Initialize user state
    const [user, setUser] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user data when the component mounts
        const fetchUser = async () => {
            const currentUser = await getCurrentUserFromToken();
            setUser(currentUser);
            setIsLoaded(true);
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!user?.id) return;
                const response = await fetch(`/api/lab-orders?userId=${user.id}`);
                if (!response.ok) throw new Error("Failed to fetch orders");
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && user?.id) {
            fetchOrders();
        }
    }, [user, isLoaded]);

    const processedOrders = orders.map(order => {
        const allCompleted = order.results && order.orderItems && order.orderItems.length > 0 &&
            order.orderItems.every(item => {
                const result = order.results.find(r => r.testId === item.testId);
                return result && result.status && result.status.toUpperCase() === 'COMPLETED';
            });
        return allCompleted ? { ...order, status: 'COMPLETED' } : order;
    });

    const filteredOrders = processedOrders.filter(order => {
        if (activeTab === 'all') return true;
        if (activeTab === 'scheduled') return order.status.toUpperCase() === 'SCHEDULED';
        if (activeTab === 'completed') return order.status.toUpperCase() === 'COMPLETED';
        return true;
    });

    const today = new Date();
    const pastOrders = processedOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate < today && order.status.toUpperCase() === 'COMPLETED';
    });

    const upcomingOrders = processedOrders.filter(order => {
        return order.status.toUpperCase() === 'SCHEDULED';
    });

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

    const selectedOrder = selectedOrderId ? orders.find(order => order.id === selectedOrderId) : null;

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

                {/* Your main render logic for lists, dialogs, order cards, etc., remains unchanged */}
            </div>
        </>
    );
};

export default MyTests;
