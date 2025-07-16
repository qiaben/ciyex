"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema } from "@/lib/schema";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CheckCircle } from 'lucide-react';
import { createNewPatient, updatePatient } from "@/app/actions/patient";
import { toast } from "sonner";

// ⬇️ CUSTOM AUTH HOOK, replace with your actual implementation from utils/auth
import { useAuthUser } from "@/utils/auth";

type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
type Relation = "mother" | "father" | "husband" | "wife" | "other";

interface DataProps {
  data?: any;
  type: "create" | "update";
}

export const NewPatient = ({ data, type }: DataProps) => {
  const { user, isLoaded } = useAuthUser(); // 🔔 Use your JWT-based user hook!
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const router = useRouter();
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');

  const userData = {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };

  const userId = user?.id;
  const form = useForm({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: {
      ...userData,
      address: "",
      date_of_birth: new Date(),
      gender: "MALE" as Gender,
      city: "",
      state: "",
      zip_code: "",
      height: 0,
      weight: 0,
      preferred_contact_method: "Email" as "Email" | "Phone" | "Text",
      preferred_appointment_type: "In-person" as "In-person" | "Visual" | "Both",
      emergency_contact_name: "Emergency Contact",
      emergency_contact_number: "0000000000",
      relation: "other" as Relation,
      marital_status: "SINGLE",
      blood_group: "",
      allergies: "",
      medical_conditions: "",
      insurance_number: "",
      insurance_provider: "",
      medical_history: "",
      medical_consent: false,
      privacy_consent: false,
      service_consent: false,
      year_of_registration: String(new Date().getFullYear()),
    },
  });

  const onSubmit = async (data: z.infer<typeof PatientFormSchema>) => {
    try {
      if (!isLoaded) {
        toast.error("Please wait while we load your account information");
        return;
      }
      if (!user) {
        toast.error("Please sign in to create a patient profile");
        router.push("/sign-in");
        return;
      }

      setLoading(true);
      const safeData = {
        ...data,
        height: Number(data.height) || 0,
        weight: Number(data.weight) || 0,
        date_of_birth: new Date(data.date_of_birth),
        preferred_contact_method: data.preferred_contact_method || "Email",
        preferred_appointment_type: data.preferred_appointment_type || "In-person",
        marital_status: data.marital_status || "SINGLE",
      };

      let response;
      if (type === "create") {
        response = await createNewPatient(safeData, userId!);
      } else if (type === "update" && data?.id) {
        response = await updatePatient(safeData, data.id);
      }

      if (!response) {
        toast.error("No response received from server. Please try again.");
        return;
      }
      if (response.error || !response.success) {
        toast.error(response.msg || "Operation failed. Please try again.");
        return;
      }

      toast.success(type === "create" ? "Patient created successfully!" : "Patient updated successfully!");
      setSubmissionStatus('success');
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type === "create") {
      userData && form.reset({
        ...userData,
        address: "",
        date_of_birth: new Date(),
        gender: "MALE" as Gender,
        city: "",
        state: "",
        zip_code: "",
        height: 0,
        weight: 0,
        preferred_contact_method: "Email",
        preferred_appointment_type: "In-person",
        emergency_contact_name: "Emergency Contact",
        emergency_contact_number: "0000000000",
        relation: "other",
        marital_status: "SINGLE",
        blood_group: "",
        allergies: "",
        medical_conditions: "",
        insurance_number: "",
        insurance_provider: "",
        medical_history: "",
        medical_consent: false,
        privacy_consent: false,
        service_consent: false,
        year_of_registration: String(new Date().getFullYear()),
      });
    } else if (type === "update" && data) {
      let dateOfBirth;
      try {
        dateOfBirth = data.date_of_birth ? new Date(data.date_of_birth) : new Date();
        if (isNaN(dateOfBirth.getTime())) {
          dateOfBirth = new Date();
        }
      } catch (error) {
        dateOfBirth = new Date();
      }
      const formData = {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        date_of_birth: dateOfBirth,
        gender: data.gender || "MALE",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.zip_code || "",
        height: Number(data.height) || 0,
        weight: Number(data.weight) || 0,
        preferred_contact_method: data.preferred_contact_method || "Email",
        preferred_appointment_type: data.preferred_appointment_type || "In-person",
        emergency_contact_name: data.emergency_contact_name || "Emergency Contact",
        emergency_contact_number: data.emergency_contact_number || "0000000000",
        relation: data.relation || "other",
        blood_group: data.blood_group || "",
        allergies: data.allergies || "",
        medical_conditions: data.medical_conditions || "",
        medical_history: data.medical_history || "",
        insurance_number: data.insurance_number || "",
        insurance_provider: data.insurance_provider || "",
        medical_consent: Boolean(data.medical_consent),
        privacy_consent: Boolean(data.privacy_consent),
        service_consent: Boolean(data.service_consent),
        year_of_registration: String(new Date().getFullYear()),
      };
      form.reset(formData);
    }
    // eslint-disable-next-line
  }, [data, type, user]);

  const navigateTab = (tab: string) => setActiveTab(tab);

  if (submissionStatus === 'success') {
    return (
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h1>
              <p className="text-gray-600 mb-6">
                Your patient information has been successfully {type === "create" ? "submitted and saved" : "updated"} to your profile.
              </p>
              <Button
                  className="bg-emerald-500 hover:bg-emerald-600 px-6"
                  onClick={() => {
                    setDashboardLoading(true);
                    router.push('/patient');
                  }}
              >
                Go to Dashboard
              </Button>
            </div>
            {dashboardLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Loading your dashboard...</div>
                  </div>
                </div>
            )}
          </main>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {type === "create" ? "Patient Registration" : "Update Patient Information"}
              </h1>
              <p className="text-gray-600">
                {type === "create"
                    ? "Please provide all the information below to help us understand you better and provide quality service."
                    : "Update your information to keep your profile current and accurate."}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full mb-6">
                      <TabsTrigger value="personal" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                        Personal
                      </TabsTrigger>
                      <TabsTrigger value="contact" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                        Contact
                      </TabsTrigger>
                      <TabsTrigger value="medical" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                        Medical
                      </TabsTrigger>
                    </TabsList>
                    {/* ... Keep all TabContent, FormFields, and fields as in your original code ... */}
                  </Tabs>
                </form>
              </Form>
            </div>
          </div>
        </main>
      </div>
  );
};
