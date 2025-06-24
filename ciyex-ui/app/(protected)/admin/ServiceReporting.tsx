// This is a client component.
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FileText, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Assuming a data structure for service results/reports, adjust interface if needed
export interface ServiceReport {
  id: string;
  serviceName: string;
  patientName: string;
  status: string; // e.g., 'pending', 'available'
  reportUrl?: string; // URL to the report file
  reportName?: string; // Name of the report file
  // Add other relevant fields
}

interface ServiceReportingProps {
  // Define props based on your service reporting data structure
  reports: ServiceReport[];
}

// This is a placeholder component. Replace with your actual service reporting/upload logic.
const ServiceReporting: React.FC<ServiceReportingProps> = ({ reports }) => {
  // Placeholder function to handle file upload (adapt as needed)
  const handleFileUpload = (reportId: string, file: File) => {
    console.log(`Uploading file for report ${reportId}: ${file.name}`);
    // Implement your file upload logic here
  };

  // Placeholder function to handle viewing/downloading report (adapt as needed)
  const handleViewReport = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Reporting</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No service reports found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Report ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Report File</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{report.id}</TableCell>
                    <TableCell>{report.serviceName}</TableCell>
                    <TableCell>{report.patientName}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>
                      {report.reportName || 'N/A'}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {report.status === 'available' && report.reportUrl ? (
                        <Button variant="outline" size="sm" onClick={() => handleViewReport(report.reportUrl!)}>
                          View Report
                        </Button>
                      ) : (                      
                        <Label htmlFor={`upload-${report.id}`} className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" /> Upload
                        </Label>
                      )}
                       <Input 
                            id={`upload-${report.id}`}
                            type="file" 
                            className="hidden"
                            onChange={(e) => e.target.files && handleFileUpload(report.id, e.target.files[0])}
                        />
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

export default ServiceReporting; 