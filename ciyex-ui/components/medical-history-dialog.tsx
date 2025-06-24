"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import React from "react";

interface DataProps {
  id: string | number;
  patientId: string;
  medicalId?: string;
  doctor_id: string | number;
  label: React.ReactNode;
}

export const MedicalHistoryDialog = ({
  id,
  patientId,
  doctor_id,
  label,
}: DataProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-lg bg-muted text-primary border border-border px-3 py-1.5 text-xs md:text-sm font-semibold hover:bg-accent/30 hover:text-accent-foreground transition"
        >
          <FileText className="w-4 h-4 mr-1" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90%] max-w-[425px] md:max-w-2xl 2xl:max-w-4xl p-8 bg-card rounded-2xl border border-border shadow-xl overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Diagnosis Details</h3>
        </div>
        {/* TODO: DiagnosisContainer or details here */}
        <div className="text-muted-foreground italic">Diagnosis container form (coming soon)</div>
      </DialogContent>
    </Dialog>
  );
};