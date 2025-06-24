// This is a client component.
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Assuming a data structure for service requests/management, adjust interface if needed
export interface ServiceRequest {
  id: string;
  serviceName: string;
  patientName: string;
  status: string; // e.g., 'pending', 'approved', 'rejected'
  details: string;
  // Add other relevant fields
}

interface ServiceManagementProps {
  // Define props based on your service management data structure
  requests: ServiceRequest[];
}

// This is a placeholder component. Replace with your actual service management logic.
const ServiceManagement: React.FC<ServiceManagementProps> = ({ requests }) => {
  // Placeholder function to get status badge (adapt as needed)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Management</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No service requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Request ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{request.id}</TableCell>
                    <TableCell>{request.serviceName}</TableCell>
                    <TableCell>{request.patientName}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {/* Add action buttons here (e.g., Approve, Reject, View Details) */}
                      <Button variant="outline" size="sm" className="mr-2">View Details</Button>
                      {request.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm" className="mr-2 text-green-600 border-green-200 hover:bg-green-50">Approve</Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceManagement; 