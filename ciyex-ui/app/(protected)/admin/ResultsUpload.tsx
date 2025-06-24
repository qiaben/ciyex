"use client"
import React, { useState, useRef } from 'react';
import { useTestOrders, TestOrder } from '@/components/context/TestOrderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Search, Check, File, FileImage } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ResultsUploadProps {
  orders: TestOrder[];
}

const ResultsUpload: React.FC<ResultsUploadProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<{ orderId: string; testId: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateTestResult } = useTestOrders();
  const { toast } = useToast();
  
  // Filter completed orders but without results or with pending/processing results
  const eligibleOrders = orders.filter(order => 
    (order.status === 'completed' || order.status === 'scheduled') &&
    order.paymentStatus === 'paid'
  );
  
  // Filter based on search term
  const filteredOrders = eligibleOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.tests.some(item => 
      item.test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.test.code.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File, orderId: string, testId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderId', orderId);
    formData.append('testId', testId);

    const response = await fetch('/api/admin/upload-result', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return response.json();
  };

  const handleSubmitResult = async (orderId: string, testId: string, resultValue: string, normalRange: string, unit: string, file: File | null) => {
    try {
      setUploading(true);

      let fileKey = '';
      let fileName = '';
      let uploadedAt = '';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('orderId', orderId);
        formData.append('testId', testId);

        const uploadResponse = await fetch('/api/admin/upload-result', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const { fileKey: uploadedFileKey } = await uploadResponse.json();
        fileKey = uploadedFileKey;
        fileName = file.name;
        uploadedAt = new Date().toISOString();
      }

      const response = await fetch('/api/admin/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: Number(orderId),
          testId: Number(testId),
          resultValue,
          normalRange,
          unit,
          status: 'COMPLETED',
          fileAttachment: fileKey ? {
            key: fileKey,
            name: fileName,
            uploadedAt
          } : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save result');
      }

      toast({
        title: "Success",
        description: "Result saved successfully"
      });
      setSelectedFile(null);
      setSelectedTest(null);
    } catch (error) {
      console.error('Error saving result:', error);
      toast({
        title: "Error",
        description: "Failed to save result",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const getResultStatus = (order: TestOrder, testId: string) => {
    const result = order.results?.find(r => r.testId === testId);
    
    if (!result) {
      return <Badge variant="outline">Pending</Badge>;
    }
    
    switch(result.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const getResultValue = (order: TestOrder, testId: string) => {
    const result = order.results?.find(r => r.testId === testId);
    
    if (!result || !result.resultValue) {
      return 'No result';
    }
    
    return `${result.resultValue} ${result.unit || ''}`;
  };

  const getFileIcon = (fileAttachment: any) => {
    if (!fileAttachment) return null;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  };

  const hasFileAttachment = (order: TestOrder, testId: string) => {
    const result = order.results?.find(r => r.testId === testId);
    return result?.fileAttachment?.url ? true : false;
  };
  
  if (eligibleOrders.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No Orders Requiring Results</h3>
        <p className="text-gray-500">There are no completed orders requiring test results.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search by order number, patient, or test..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {filteredOrders.map(order => (
        <div key={order.id} className="mb-10 border rounded-md">
          <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="font-medium">
                Order #{order.orderNumber} - {order.userName || 'No name'}
              </h3>
              <p className="text-sm text-gray-500">
                Date: {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.tests.map(item => (
                  <React.Fragment key={item.test.id}>
                    <TableRow>
                      <TableCell className="font-medium">{item.test.name}</TableCell>
                      <TableCell>{item.test.code}</TableCell>
                      <TableCell>{getResultStatus(order, item.test.id)}</TableCell>
                      <TableCell>{getResultValue(order, item.test.id)}</TableCell>
                      <TableCell>
                        {order.results?.find(r => r.testId === item.test.id)?.fileAttachment && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-red-500" />
                            <a
                              href={`/api/test-results/${order.results?.find(r => r.testId === item.test.id)?.fileAttachment?.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-xs text-blue-500 hover:underline truncate max-w-[100px]"
                            >
                              {order.results?.find(r => r.testId === item.test.id)?.fileAttachment?.name}
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => setSelectedTest({ orderId: order.id, testId: item.test.id })}
                          disabled={uploading}
                        >
                          {uploading ? 'Uploading...' : 'Upload Result'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
      
      {filteredOrders.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No orders found matching your criteria</p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSearchTerm('')}
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      )}

      {selectedTest && (
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Test Result</DialogTitle>
            </DialogHeader>
            <UploadResultForm
              uploading={uploading}
              handleSubmitResult={handleSubmitResult}
              selectedTest={selectedTest}
              setSelectedTest={setSelectedTest}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const UploadResultForm = ({
  uploading,
  handleSubmitResult,
  selectedTest,
  setSelectedTest,
}: {
  uploading: boolean;
  handleSubmitResult: any;
  selectedTest: any;
  setSelectedTest: any;
}) => {
  const [resultValue, setResultValue] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="result">Result Value</Label>
        <Input id="result" value={resultValue} onChange={e => setResultValue(e.target.value)} placeholder="Enter result value" />
      </div>
      <div>
        <Label htmlFor="normalRange">Normal Range</Label>
        <Input id="normalRange" value={normalRange} onChange={e => setNormalRange(e.target.value)} placeholder="Enter normal range" />
      </div>
      <div>
        <Label htmlFor="unit">Unit</Label>
        <Input id="unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Enter unit" />
      </div>
      <div>
        <Label htmlFor="file">
          Upload PDF Result
          <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Label>
        <Input
          id="file"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {selectedFile && (
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-700">{selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</span>
            <Button
              size="sm"
              variant="outline"
              className="ml-2"
              onClick={() => {
                const url = URL.createObjectURL(selectedFile);
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 10000);
              }}
            >
              View PDF
            </Button>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setSelectedTest(null)}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleSubmitResult(selectedTest.orderId, selectedTest.testId, resultValue, normalRange, unit, selectedFile)}
          disabled={uploading || !selectedFile}
          className="text-black hover:text-white"
        >
          {uploading ? 'Uploading...' : 'Save Result'}
        </Button>
      </div>
    </div>
  );
};

export default ResultsUpload;
