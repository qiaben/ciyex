"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
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
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createNewPatient, updatePatient } from "@/app/actions/patient";
import { toast } from "sonner";

type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
type Relation = "mother" | "father" | "husband" | "wife" | "other";

interface DataProps {
  data?: any;
  type: "create" | "update";
}

export const NewPatient = ({ data, type }: DataProps) => {
  console.log("NewPatient component rendered");
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = type === "create" ? "new-patient" : data?.id;
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');

  const userData = {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
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
      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("onSubmit function called with data:", data);
      console.log("Form validation errors:", form.formState.errors);
      console.log("Is form valid:", form.formState.isValid);
      console.log("Form is dirty:", form.formState.isDirty);
      console.log("Form is submitting:", form.formState.isSubmitting);
      
      // Check if all required fields are present
      const requiredFields = [
        'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
        'gender', 'address', 'city', 'state', 'zip_code', 'height', 'weight',
        'preferred_contact_method', 'preferred_appointment_type',
        'emergency_contact_name', 'emergency_contact_number', 'relation', 'marital_status'
      ];
      
      console.log("Checking required fields:");
      requiredFields.forEach(field => {
        console.log(`${field}:`, data[field as keyof typeof data]);
      });
      
      // Check consent fields for create mode
      if (type === "create") {
        console.log("Consent fields:");
        console.log("privacy_consent:", data.privacy_consent);
        console.log("service_consent:", data.service_consent);
        console.log("medical_consent:", data.medical_consent);
      }
      
      if (!isLoaded) {
        console.log("User not loaded yet");
        toast.error("Please wait while we load your account information");
        return;
      }

      if (!user) {
        console.log("No user found");
        toast.error("Please sign in to create a patient profile");
        router.push("/sign-in");
        return;
      }

      setLoading(true);
      console.log("Setting loading state to true");

      // Ensure height and weight are numbers and date is properly formatted
      const safeData = {
        ...data,
        height: Number(data.height) || 0,
        weight: Number(data.weight) || 0,
        date_of_birth: new Date(data.date_of_birth),
        preferred_contact_method: data.preferred_contact_method || "Email",
        preferred_appointment_type: data.preferred_appointment_type || "In-person",
        marital_status: data.marital_status || "SINGLE",
      };

      console.log("Processed form data:", safeData);
      console.log("User ID:", userId);
      console.log("User data:", userData);

      if (!userId) {
        console.error("No user ID available");
        toast.error("Please sign in to create a patient profile");
        return;
      }

      console.log("Form submission started");
      console.log("Form data:", safeData);
      console.log("Patient ID:", patientId);
      console.log("Operation type:", type);
      console.log("User ID:", userId);

      let response;
      if (type === "create") {
        console.log("Creating new patient...");
        response = await createNewPatient(safeData, userId);
      } else if (type === "update" && patientId) {
        console.log("Updating existing patient...");
        response = await updatePatient(safeData, patientId);
      }

      console.log("Server response:", response);
      
      if (!response) {
        console.error("No response received from server");
        toast.error("No response received from server. Please try again.");
        return;
      }

      if (response.error) {
        console.error("API error:", response);
        toast.error(response.msg || "Failed to create/update patient");
        return;
      }

      if (!response.success) {
        console.error("Operation failed:", response);
        toast.error(response.msg || "Operation failed. Please try again.");
        return;
      }

      console.log("Operation successful:", response);
      toast.success(type === "create" ? "Patient created successfully!" : "Patient updated successfully!");
      setSubmissionStatus('success');
      
      // Don't redirect automatically, let user click the button
      // setTimeout(() => {
      //   setSubmissionStatus('idle');
      //   if (type === "create") {
      //     router.push("/patient");
      //   } else {
      //     router.push("/patient");
      //   }
      //   router.refresh();
      // }, 3000);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      console.log("Setting loading state to false");
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
      });
    } else if (type === "update" && data) {
      // Parse the date string into a Date object
      let dateOfBirth;
      try {
        dateOfBirth = data.date_of_birth ? new Date(data.date_of_birth) : new Date();
        if (isNaN(dateOfBirth.getTime())) {
          dateOfBirth = new Date();
        }
      } catch (error) {
        dateOfBirth = new Date();
      }

      // Map the values to match the select options exactly
      const mapSelectValue = <T extends string>(value: string | undefined, options: { label: string; value: T }[]): T => {
        if (!value) return options[0]?.value || "" as T;
        const option = options.find(opt => 
          opt.value.toLowerCase() === value.toLowerCase() || 
          opt.label.toLowerCase() === value.toLowerCase()
        );
        return option ? option.value : options[0]?.value || "" as T;
      };

      // Ensure we have valid values for select fields
      const formData = {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        date_of_birth: dateOfBirth,
        gender: mapSelectValue<Gender>(data.gender, [
          { label: "Male", value: "MALE" },
          { label: "Female", value: "FEMALE" },
          { label: "Other", value: "OTHER" },
          { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" }
        ]),
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.zip_code || "",
        height: Number(data.height) || 0,
        weight: Number(data.weight) || 0,
        preferred_contact_method: mapSelectValue<"Email" | "Phone" | "Text">(data.preferred_contact_method, [
          { label: "Email", value: "Email" },
          { label: "Phone", value: "Phone" },
          { label: "Text", value: "Text" }
        ]),
        preferred_appointment_type: mapSelectValue<"In-person" | "Visual" | "Both">(data.preferred_appointment_type, [
          { label: "In-person", value: "In-person" },
          { label: "Visual", value: "Visual" },
          { label: "Both", value: "Both" }
        ]),
        emergency_contact_name: data.emergency_contact_name || "Emergency Contact",
        emergency_contact_number: data.emergency_contact_number || "0000000000",
        relation: mapSelectValue<Relation>(data.relation, [
          { label: "Mother", value: "mother" },
          { label: "Father", value: "father" },
          { label: "Husband", value: "husband" },
          { label: "Wife", value: "wife" },
          { label: "Other", value: "other" }
        ]),
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

      // Set form values
      form.reset(formData);

      // Force update select fields with a slight delay to ensure proper initialization
      setTimeout(() => {
        if (formData.gender) {
          form.setValue("gender", formData.gender, { shouldValidate: true });
        }
        if (formData.preferred_contact_method) {
          form.setValue("preferred_contact_method", formData.preferred_contact_method, { shouldValidate: true });
        }
        if (formData.preferred_appointment_type) {
          form.setValue("preferred_appointment_type", formData.preferred_appointment_type, { shouldValidate: true });
        }
        if (formData.relation) {
          form.setValue("relation", formData.relation, { shouldValidate: true });
        }
      }, 100);
    }
  }, [data, type, user, form]);

  // Helper to move between tabs
  const navigateTab = (tab: string) => {
    setActiveTab(tab);
  };

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
                  
            {/* Personal Information */}
                  <TabsContent value="personal" className="space-y-5 p-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                    control={form.control} 
                    name="first_name" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} className="border-gray-300 focus:border-emerald-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                    control={form.control} 
                    name="last_name" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} className="border-gray-300 focus:border-emerald-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                  />
                </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                    control={form.control} 
                    name="email" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} className="border-gray-300 focus:border-emerald-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                    control={form.control} 
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <select
                                  value={countryCode}
                                  onChange={e => setCountryCode(e.target.value)}
                                  className="border-gray-300 focus:border-emerald-500 rounded-md px-2 py-2 bg-white dark:bg-gray-900"
                                  style={{ width: 80 }}
                                >
                                  <option value="+91">+91 (IN)</option>
                                  <option value="+1">+1 (US)</option>
                                  <option value="+44">+44 (UK)</option>
                                  <option value="+63">+63 (PH)</option>
                                  <option value="+61">+61 (AU)</option>
                                  <option value="+81">+81 (JP)</option>
                                  <option value="+971">+971 (UAE)</option>
                                  <option value="+49">+49 (DE)</option>
                                  <option value="+33">+33 (FR)</option>
                                  <option value="+86">+86 (CN)</option>
                                </select>
                                <Input
                                  {...field}
                                  placeholder="Your phone number"
                                  className="border-gray-300 focus:border-emerald-500 flex-1"
                                  style={{ minWidth: 0 }}
                  />
                </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                    />
                  </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                      control={form.control} 
                        name="date_of_birth"
                        render={({ field }) => {
                          const valueDate = field.value ? new Date(field.value) : new Date();
                          const currentYear = valueDate.getFullYear();
                          const currentMonth = valueDate.getMonth() + 1;
                          const currentDay = valueDate.getDate();

                          const months = Array.from({ length: 12 }, (_, i) => ({
                            value: i + 1,
                            label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
                          }));

                          const getDaysInMonth = (year: number, month: number) => {
                            return new Date(year, month, 0).getDate();
                          };
                          const days = Array.from({ length: getDaysInMonth(currentYear, currentMonth) }, (_, i) => i + 1);
                          const years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i);

                          // Prevent selecting a future date
                          const isFuture = (y: number, m: number, d: number) => {
                            const today = new Date();
                            if (y > today.getFullYear()) return true;
                            if (y === today.getFullYear() && m > today.getMonth() + 1) return true;
                            if (y === today.getFullYear() && m === today.getMonth() + 1 && d > today.getDate()) return true;
                            return false;
                          };

                          return (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date of Birth</FormLabel>
                              <div className="flex gap-2 items-center">
                                {/* Year Dropdown */}
                                <select
                                  value={currentYear}
                                  onChange={e => {
                                    const newYear = parseInt(e.target.value, 10);
                                    let newDay = currentDay;
                                    let newMonth = currentMonth;
                                    // Clamp day if needed
                                    const daysInMonth = getDaysInMonth(newYear, newMonth);
                                    if (newDay > daysInMonth) newDay = daysInMonth;
                                    // Prevent future
                                    if (isFuture(newYear, newMonth, newDay)) {
                                      const today = new Date();
                                      newMonth = today.getMonth() + 1;
                                      newDay = today.getDate();
                                    }
                                    field.onChange(new Date(newYear, newMonth - 1, newDay));
                                  }}
                                  className="border-gray-300 focus:border-emerald-500 rounded-md px-2 py-2 bg-white dark:bg-gray-900"
                                >
                                  {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                  ))}
                                </select>
                                {/* Month Dropdown */}
                                <select
                                  value={currentMonth}
                                  onChange={e => {
                                    const newMonth = parseInt(e.target.value, 10);
                                    let newDay = currentDay;
                                    // Clamp day if needed
                                    const daysInMonth = getDaysInMonth(currentYear, newMonth);
                                    if (newDay > daysInMonth) newDay = daysInMonth;
                                    // Prevent future
                                    if (isFuture(currentYear, newMonth, newDay)) {
                                      const today = new Date();
                                      newDay = today.getDate();
                                    }
                                    field.onChange(new Date(currentYear, newMonth - 1, newDay));
                                  }}
                                  className="border-gray-300 focus:border-emerald-500 rounded-md px-2 py-2 bg-white dark:bg-gray-900"
                                >
                                  {months.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                                {/* Day Dropdown */}
                                <select
                                  value={currentDay}
                                  onChange={e => {
                                    const newDay = parseInt(e.target.value, 10);
                                    // Prevent future
                                    let y = currentYear, m = currentMonth;
                                    if (isFuture(y, m, newDay)) {
                                      const today = new Date();
                                      y = today.getFullYear();
                                      m = today.getMonth() + 1;
                                    }
                                    field.onChange(new Date(y, m - 1, newDay));
                                  }}
                                  className="border-gray-300 focus:border-emerald-500 rounded-md px-2 py-2 bg-white dark:bg-gray-900"
                                >
                                  {days.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                  ))}
                                </select>
                  </div>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                  Select your date of birth
                                </p>
                                {field.value && (
                                  <p className="text-xs text-emerald-600">
                                    Age: {Math.floor((new Date().getTime() - field.value.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                                  </p>
                                )}
                </div>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      
                      <FormField
                    control={form.control} 
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-emerald-500">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                  />
                </div>
                    
                    <div className="pt-4 flex justify-end">
                      <Button 
                        type="button" 
                        className="bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => navigateTab('contact')}
                      >
                        Continue
                      </Button>
              </div>
                  </TabsContent>

            {/* Contact & Address */}
                  <TabsContent value="contact" className="space-y-5 p-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact & Address</h2>
                    
                    <FormField
                    control={form.control} 
                    name="address" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Your street address" {...field} className="border-gray-300 focus:border-emerald-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                    control={form.control} 
                    name="city" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Your city" {...field} className="border-gray-300 focus:border-emerald-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                    control={form.control} 
                    name="state" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Your state" {...field} className="border-gray-300 focus:border-emerald-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                  />
                </div>
                    
                    <FormField
                    control={form.control} 
                    name="zip_code" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Your ZIP code" {...field} className="border-gray-300 focus:border-emerald-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigateTab('personal')}
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        className="bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => navigateTab('medical')}
                      >
                        Continue
                      </Button>
              </div>
                  </TabsContent>

            {/* Medical Information */}
                  <TabsContent value="medical" className="space-y-5 p-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                  control={form.control} 
                  name="blood_group" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300 focus:border-emerald-500">
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                  control={form.control} 
                  name="allergies" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies</FormLabel>
                            <FormControl>
                              <Input placeholder="List any allergies" {...field} className="border-gray-300 focus:border-emerald-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                  control={form.control} 
                  name="medical_conditions" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Conditions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any medical conditions" 
                              {...field} 
                              className="border-gray-300 focus:border-emerald-500 min-h-[100px]" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                  control={form.control} 
                  name="medical_history" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical History</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any medical history" 
                              {...field} 
                              className="border-gray-300 focus:border-emerald-500 min-h-[100px]" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Insurance Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                  control={form.control} 
                  name="insurance_provider" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider</FormLabel>
                            <FormControl>
                              <Input placeholder="Your insurance provider" {...field} className="border-gray-300 focus:border-emerald-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                  control={form.control} 
                  name="insurance_number" 
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your insurance number" {...field} className="border-gray-300 focus:border-emerald-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
            </div>

                    {/* Consent Agreements - Only show for create mode */}
                    {type === "create" && (
                      <>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Consent Agreements</h2>
                        
                <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="privacy_consent"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                      Privacy Policy Agreement
                                  </FormLabel>
                                  <p className="text-xs text-gray-600">
                        I consent to the collection, storage, and use of my personal and health information as outlined in the Privacy Policy. I understand how my data will be used, who it may be shared with, and my rights regarding access, correction, and deletion of my data.
                                  </p>
                                  <FormMessage />
                  </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="service_consent"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                      Terms of Service Agreement
                                  </FormLabel>
                                  <p className="text-xs text-gray-600">
                        I agree to the Terms of Service, including my responsibilities as a user of this healthcare management system, the limitations of liability, and the dispute resolution process. I understand that continued use of this service is contingent upon my adherence to these terms.
                                  </p>
                                  <FormMessage />
                  </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="medical_consent"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                      Informed Consent for Medical Treatment
                                  </FormLabel>
                                  <p className="text-xs text-gray-600">
                        I provide informed consent to receive medical treatment and services through this healthcare management system. I acknowledge that I have been informed of the nature, risks, benefits, and alternatives to the proposed treatments and that I have the right to ask questions and receive further information before proceeding.
                                  </p>
                                  <FormMessage />
                  </div>
                              </FormItem>
                            )}
                          />
                </div>
                      </>
            )}

                    <div className="pt-6 flex justify-between">
            <Button
                        type="button" 
                        variant="outline"
                        onClick={() => navigateTab('contact')}
                      >
                        Back
                      </Button>
                      <Button
              type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600"
                        disabled={loading}
              onClick={() => { 
                          console.log("Submit button clicked!");
                          console.log("Form state:", form.formState);
                          console.log("Form values:", form.getValues());
                        }}
                      >
                        {loading ? 'Submitting...' : (type === "create" ? "Submit Registration" : "Update Profile")}
            </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="hidden">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || 0} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || 0} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marital_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} value={field.value || "SINGLE"} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_contact_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} value={field.value || "Email"} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_appointment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} value={field.value || "In-person"} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} value={field.value || "Emergency Contact"} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} value={field.value || "0000000000"} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} value={field.value || "other"} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
          </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};