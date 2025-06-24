"use client";

import React, { useEffect, useState } from "react";
import { MedicalHistory } from "./medical-history";
import { FileText } from "lucide-react";

interface DataProps {
  id?: number | string;
  patientId: string;
  title?: string;
  showProfile?: boolean;
}

export const MedicalHistoryContainer = ({ id, patientId, title = "Medical History", showProfile = false }: DataProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const response = await fetch(`/api/medical-history?patientId=${patientId}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching medical history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [patientId]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          Loading medical history...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      <MedicalHistory data={data} isShowProfile={showProfile} />
    </div>
  );
};