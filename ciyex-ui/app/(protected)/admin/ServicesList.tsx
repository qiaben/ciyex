// This is a client component.
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Eye } from 'lucide-react';

// Assuming a similar data structure for services, adjust interface if needed
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // Duration in minutes
  doctor: { // Assuming service is linked to a doctor
    id: string;
    name: string;
  };
  // Add other relevant service fields like category, availability, etc.
}

interface ServicesListProps {
  services: Service[];
}

// This is a placeholder component. Replace with your actual services list logic.
const ServicesList: React.FC<ServicesListProps> = ({ services }) => {
  // Placeholder function to get status badge (adapt as needed)
  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case 'active':
  //       return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  //     case 'inactive':
  //       return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  //     default:
  //       return <Badge variant="outline">{status}</Badge>;
  //   }
  // };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Services</CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No services found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Service Name</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.doctor.name}</TableCell>
                    <TableCell>{service.duration} mins</TableCell>
                    <TableCell>${service.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        // onClick={() => handleViewService(service.id)} // Add your view logic here
                        className="text-blue-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
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

export default ServicesList; 