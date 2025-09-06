"use client";
import AdminLayout from "@/app/(admin)/layout";
import React from "react";

export default function MessagingPage() {
    return (
        <AdminLayout>
            <div className="flex flex-grow overflow-hidden">
                {/* Content container */}
                <div className="flex-grow p-8 overflow-auto">
                    <h1 className="text-2xl font-semibold mb-6 text-center">
                        Messaging
                    </h1>
                    <p className="text-gray-600 text-center">
                        Select a tab from the sidebar (Inbox, Sent, or Templates).
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}







