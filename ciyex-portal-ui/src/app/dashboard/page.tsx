'use client';

import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React, { useEffect, useState } from "react";
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import AdminLayout from "@/app/(admin)/layout";
import { useRouter } from "next/navigation";

// Types
interface PatientInfo {
    id: number;
    portalUserId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth: string;
    gender?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    ehrPatientId?: number;
    medicalRecordNumber?: string;
    status: string;
}

// Patient Dashboard Component
function PatientDashboard() {
    const router = useRouter();
    const [patient, setPatient] = useState<PatientInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatientInfo = async () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            if (!token || !user) {
                router.push('/signin');
                return;
            }

            try {
                // Fetch patient information using the portal API
                const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
                const response = await fetchWithAuth(`${apiBase}/api/portal/patient/me`);
                const data = await response.json();

                if (data.success && data.data) {
                    setPatient(data.data);
                } else {
                    setError(data.message || 'Failed to load patient information');
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/signin');
                    }
                }
            } catch (error) {
                console.error('Error fetching patient info:', error);
                setError('Failed to load patient information');
            } finally {
                setLoading(false);
            }
        };

        fetchPatientInfo();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('orgId');
        localStorage.removeItem('orgs');
        localStorage.removeItem('orgName');
        localStorage.removeItem('role');
        router.push('/signin');
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your information...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={handleLogout}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Patient Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Welcome back, {patient?.firstName}!</h1>
                            <p className="text-blue-100">Manage your health information and appointments</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-white/20 text-white px-4 py-2 rounded-md hover:bg-white/30 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div
                        onClick={() => router.push('/appointments')}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                                <p className="text-gray-600">View & book appointments</p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => router.push('/messages')}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                                <p className="text-gray-600">Secure communication</p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => router.push('/labs')}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Lab Results</h3>
                                <p className="text-gray-600">View test results</p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => router.push('/medications')}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-full">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Medications</h3>
                                <p className="text-gray-600">Manage prescriptions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Information Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Name:</span>
                                <span className="font-medium">{patient?.firstName} {patient?.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{patient?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-medium">{patient?.phoneNumber || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date of Birth:</span>
                                <span className="font-medium">
                                    {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Gender:</span>
                                <span className="font-medium">{patient?.gender || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Status</h2>
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-green-800 font-medium">Account Status: Approved</span>
                            </div>
                            <p className="text-green-700 text-sm mt-2">
                                Your registration has been approved. You have full access to the patient portal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication and determine user role
        const user = localStorage.getItem('user');
        const role = localStorage.getItem('role');
        
        if (!user) {
            router.replace('/signin');
            return;
        }
        
        setUserRole(role);
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    // If user is a patient, show patient dashboard
    if (userRole === 'PATIENT') {
        return <PatientDashboard />;
    }

    return (
        <AdminLayout>
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetrics />

                <MonthlySalesChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget />
            </div>

            <div className="col-span-12">
                <StatisticsChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <DemographicCard />
            </div>

            <div className="col-span-12 xl:col-span-7">
                <RecentOrders />
            </div>
        </div>
        </AdminLayout>
    );
}
