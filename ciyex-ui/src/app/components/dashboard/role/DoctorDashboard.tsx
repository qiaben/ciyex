"use client";

import ProviderGreeting from "@/components/dashboard/ProviderGreeting";
import StatisticsOverview from "@/components/dashboard/StatisticsOverview";
import RevenueByService from "@/components/dashboard/RevenueByService";
import RecentPatients from "@/components/dashboard/RecentPatients";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import RecentAppointments from "@/components/dashboard/RecentAppointments";
import SummaryCards from "@/components/dashboard/SummaryCards";


export default function DoctorDashboard() {
    return (
        <div className="dashboard-container">
            {/* Greeting Header */}
            <ProviderGreeting />

            {/* Summary + Widgets Section */}
            <div className="dashboard-main">
                <div className="dashboard-left">
                    <SummaryCards />
                </div>

                <div className="dashboard-right">
                    <StatisticsOverview />
                    <RevenueByService />
                    <RecentPatients />
                </div>
            </div>

            {/* Appointment Section */}
            <div className="appointments-section">
                <UpcomingAppointments />
                <RecentAppointments />
            </div>
        </div>
    );
}
