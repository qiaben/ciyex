import { AppointmentDetails } from "@/components/appointment/appointment-details";
import AppointmentQuickLinks from "@/components/appointment/appointment-quick-links";
// import ChartContainer from "@/components/appointment/chart-container"; // Removed ChartContainer
import { DiagnosisContainer } from "@/components/appointment/diagnosis-container";
import { PatientDetailsCard } from "@/components/appointment/patient-details-card";
import { VitalSigns } from "@/components/appointment/vital-signs";
import { MedicalHistoryContainer } from "@/components/medical-history-container";
import { getAppointmentWithMedicalRecordsById } from "@/utils/services/appointment";
import { getVitalSignData } from "@/utils/services/medical";
import { BarChart, ClipboardList, Stethoscope, Receipt, History, Star } from "lucide-react";
import Link from "next/link";
import { auth } from '@clerk/nextjs/server';
import { checkRole } from '@/utils/roles';
import { Button } from '@/components/ui/button';
import { PatientOverview } from "@/components/PatientOverview";
import Billing from "@/components/appointment/billing";
import { Navigation } from "@/components/Navigation";
import { PatientHeartRateChart } from "@/components/appointment/patient-heart-rate-chart";
import { PatientBloodPressureChart } from "@/components/appointment/patient-blood-pressure-chart";
import { ModernAppointmentDetails } from "@/components/appointment/ModernAppointmentDetails";
import { ModernVitalSigns } from "@/components/appointment/ModernVitalSigns";
import { ChartsVitalSignsSummary } from "@/components/appointment/ChartsVitalSignsSummary";
import { ModernChartsContainer } from "@/components/appointment/ModernChartsContainer";
import { AddVitalSigns } from "@/components/dialogs/add-vital-signs";
import { ReviewForm } from "@/components/dialogs/review-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TABS = [
  { key: "charts", label: "Charts", icon: <BarChart className="w-4 h-4 mr-1" /> },
  { key: "appointments", label: "Appointments", icon: <ClipboardList className="w-4 h-4 mr-1" /> },
  { key: "diagnosis", label: "Diagnosis", icon: <Stethoscope className="w-4 h-4 mr-1" /> },
  { key: "medical-history", label: "Medical History", icon: <History className="w-4 h-4 mr-1" /> },
  { key: "billing", label: "Billing & Payments", icon: <Receipt className="w-4 h-4 mr-1" /> },
];

interface ParamsProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AppointmentDetailsPage = async (props: ParamsProps) => {
  const params = await props.params;
  const search = await props.searchParams;
  const { id } = params;
  const cat = (search?.cat as string) || "charts";

  const { data } = await getAppointmentWithMedicalRecordsById(Number(id));
  const { data: vitalSignsRawData, heartRateData: vitalSignsHeartRateRawData } = await getVitalSignData(id.toString()); // Fetch vital signs data

  // Transform data for charts
  const vitalSignsData = vitalSignsRawData.map((item: any) => ({
    label: item.label,
    value1: item.systolic,
    value2: item.diastolic,
  }));

  const vitalSignsHeartRateData = vitalSignsHeartRateRawData.map((item: any) => ({
    label: item.label,
    value1: item.rate,
  }));

  // Debug logs for chart data
  console.log('vitalSignsData', vitalSignsData);
  console.log('vitalSignsHeartRateData', vitalSignsHeartRateData);

  // Extract latest vital signs from the first medical record (if any)
  const latestVitals = data?.medical?.[0]?.vital_signs?.[0];

  const { userId } = await auth();
  const isPatient = await checkRole('PATIENT');
  const isAdmin = await checkRole('ADMIN');
  const isAppointmentCompleted = data?.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      <div className="relative">
        {/* Enhanced background pattern for both themes */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(51,65,85,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="relative z-10 flex flex-col gap-8 w-full min-h-screen p-4 md:p-8 max-w-[1920px] mx-auto">
          {/* Navigation Bar */}
          <Navigation 
            userId={userId}
            isPatient={isPatient}
            isAdmin={isAdmin}
            isAppointmentCompleted={isAppointmentCompleted}
            appointmentId={id}
            doctorId={data?.doctor_id}
          />

          {/* Content and Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            {/* Main Content */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
              {cat === "charts" && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><BarChart className="w-5 h-5 text-primary" /> Patient Vitals & Charts</h2>
                  <ChartsVitalSignsSummary
                    temperature={latestVitals?.body_temperature !== undefined ? `${latestVitals.body_temperature}°C` : "--"}
                    bloodPressure={latestVitals?.systolic !== undefined && latestVitals?.diastolic !== undefined ? `${latestVitals.systolic} / ${latestVitals.diastolic}` : "--"}
                    heartRate={latestVitals?.heartRate ? `${latestVitals.heartRate} bpm` : "--"}
                    weight={latestVitals?.weight !== undefined ? `${latestVitals.weight} kg` : "--"}
                    height={latestVitals?.height !== undefined ? `${latestVitals.height} cm` : "--"}
                    oxygenSat={latestVitals?.oxygen_saturation !== undefined ? `${latestVitals.oxygen_saturation}` : "--"}
                    bmi={latestVitals ? (typeof latestVitals.weight === 'number' && typeof latestVitals.height === 'number' && latestVitals.height > 0 ? (latestVitals.weight / ((latestVitals.height / 100) ** 2)).toFixed(2) : '--') : '--'}
                  />
                  <ModernChartsContainer
                    patientId={data?.patient_id!}
                  />
                </div>
              )}
              {cat === "appointments" && (
                <>
                  <ModernAppointmentDetails
                    id={data?.id!}
                    date={data?.appointment_date ? (typeof data.appointment_date === 'string' ? data.appointment_date : data.appointment_date.toLocaleDateString()) : ''}
                    time={data?.time!}
                    status={data?.status || 'Scheduled'}
                    notes={data?.note!}
                  />

                  {/* Modern Vital Signs Section */}
                  <div className="mt-8 pt-6 border-t border-slate-300/50 dark:border-slate-600/30">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40">
                        <svg className="text-purple-600 dark:text-purple-400" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Vital Signs
                      </h3>
                      <div className="ml-auto">
                        <AddVitalSigns
                          patientId={data?.patient_id?.toString() || ""}
                          doctorId={data?.doctor_id?.toString() || ""}
                          appointmentId={data?.id?.toString() || ""}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 rounded-2xl p-6 border border-red-200/60 dark:border-red-700/40 hover:border-red-300/80 dark:hover:border-red-600/60 transition-all duration-500 hover:shadow-xl hover:scale-105">
                        <p className="text-sm text-red-700 dark:text-red-300 uppercase tracking-wide font-semibold mb-2">Body Temperature</p>
                        <p className="text-3xl font-bold text-red-800 dark:text-red-200 transition-colors duration-300">{latestVitals?.body_temperature !== undefined ? `${latestVitals.body_temperature}°C` : '--'}</p>
                      </div>
                      <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-2xl p-6 border border-blue-200/60 dark:border-blue-700/40 hover:border-blue-300/80 dark:hover:border-blue-600/60 transition-all duration-500 hover:shadow-xl hover:scale-105">
                        <p className="text-sm text-blue-700 dark:text-blue-300 uppercase tracking-wide font-semibold mb-2">Blood Pressure</p>
                        <p className="text-3xl font-bold text-blue-800 dark:text-blue-200 transition-colors duration-300">{latestVitals?.systolic !== undefined && latestVitals?.diastolic !== undefined ? `${latestVitals.systolic}/${latestVitals.diastolic} mmHg` : '--'}</p>
                      </div>
                      <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30 rounded-2xl p-6 border border-emerald-200/60 dark:border-emerald-700/40 hover:border-emerald-300/80 dark:hover:border-emerald-600/60 transition-all duration-500 hover:shadow-xl hover:scale-105">
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 uppercase tracking-wide font-semibold mb-2">Heart Rate</p>
                        <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 transition-colors duration-300">{latestVitals?.heartRate ? `${latestVitals.heartRate} bpm` : '--'}</p>
                      </div>
                      <div className="group bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 rounded-2xl p-6 border border-amber-200/60 dark:border-amber-700/40 hover:border-amber-300/80 dark:hover:border-amber-600/60 transition-all duration-500 hover:shadow-xl hover:scale-105">
                        <p className="text-sm text-amber-700 dark:text-amber-300 uppercase tracking-wide font-semibold mb-2">Weight</p>
                        <p className="text-3xl font-bold text-amber-800 dark:text-amber-200 transition-colors duration-300">{latestVitals?.weight !== undefined ? `${latestVitals.weight} kg` : '--'}</p>
                      </div>
                      <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-2xl p-6 border border-purple-200/60 dark:border-purple-700/40 hover:border-purple-300/80 dark:hover:border-purple-600/60 transition-all duration-500 hover:shadow-xl hover:scale-105">
                        <p className="text-sm text-purple-700 dark:text-purple-300 uppercase tracking-wide font-semibold mb-2">Height</p>
                        <p className="text-3xl font-bold text-purple-800 dark:text-purple-200 transition-colors duration-300">{latestVitals?.height !== undefined ? `${latestVitals.height} cm` : '--'}</p>
                      </div>
                      <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30 rounded-2xl p-6 border border-indigo-200/60 dark:border-indigo-700/40 hover:border-indigo-300/80 dark:hover:border-indigo-600/60 transition-all duration-500 hover:shadow-xl hover:scale-105">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 uppercase tracking-wide font-semibold mb-2">BMI</p>
                        <p className="text-3xl font-bold text-indigo-800 dark:text-indigo-200 transition-colors duration-300">
                          {latestVitals && typeof latestVitals.weight === 'number' && typeof latestVitals.height === 'number' && latestVitals.height > 0
                            ? `${(latestVitals.weight / ((latestVitals.height / 100) ** 2)).toFixed(2)}`
                            : '--'}
                        </p>
                      </div>
                    </div>
                  </div>

                </>
              )}
              {cat === "diagnosis" && (
                <DiagnosisContainer
                  id={id}
                  patientId={data?.patient_id!}
                  doctorId={data?.doctor_id!}
                />
              )}
              {cat === "medical-history" && (
                <MedicalHistoryContainer id={id!} patientId={data?.patient_id!} />
              )}
              {cat === "billing" && (
                <Billing appointmentId={id} />
              )}
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-8 h-fit">
              <PatientOverview data={data?.patient!} doctor={data?.doctor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;