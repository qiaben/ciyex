
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { LabTest } from '../models/LabTest';
import { Check, X } from 'lucide-react';

interface TestComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tests: LabTest[];
}

const TestComparisonModal: React.FC<TestComparisonModalProps> = ({ open, onOpenChange, tests }) => {
  const features = [
    "Category", 
    "Price", 
    "Required Fasting", 
    "Results Time", 
    "Insurance Coverage"
  ];

  // Mock data for comparison - in a real app these would come from the API
  const getFeatureValue = (test: LabTest, feature: string) => {
    switch(feature) {
      case "Category":
        return test.category;
      case "Price":
        return `$${test.price.toFixed(2)}`;
      case "Required Fasting":
        return Math.random() > 0.5 ? 
          <div className="flex items-center text-green-600"><Check size={16} className="mr-1" /> Yes</div> : 
          <div className="flex items-center text-red-600"><X size={16} className="mr-1" /> No</div>;
      case "Results Time":
        return ["24 hours", "48 hours", "72 hours"][Math.floor(Math.random() * 3)];
      case "Insurance Coverage":
        return Math.random() > 0.3 ? 
          <div className="flex items-center text-green-600"><Check size={16} className="mr-1" /> Yes</div> : 
          <div className="flex items-center text-red-600"><X size={16} className="mr-1" /> No</div>;
      default:
        return "N/A";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Test Comparison</DialogTitle>
          <DialogDescription>
            Compare different lab tests to find the best option for your needs
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                {tests.map((test) => (
                  <TableHead key={test.id}>{test.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature}>
                  <TableCell className="font-medium">{feature}</TableCell>
                  {tests.map((test) => (
                    <TableCell key={`${test.id}-${feature}`}>
                      {getFeatureValue(test, feature)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestComparisonModal;
