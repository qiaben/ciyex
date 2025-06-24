"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HeartPulse, Clock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useUser } from "@clerk/nextjs";
import { getDoctorById } from '@/utils/services/doctor';
import Logo from '@/components/Logo';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const specializations = [
  "Primary Care",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Obstetrics",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Urology"
];

type WorkingDay = {
  isWorking: boolean;
  startTime: string;
  endTime: string;
};

type WorkingDays = {
  [key in 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday']: WorkingDay;
};

type DoctorWorkingDay = {
  day: string;
  start_time: string;
  end_time: string;
};

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const formSchema = z.object({
  employmentType: z.string().min(1, { message: "Please select an employment type" }),
  fullName: z.string()
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(100, { message: "Full name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Full name can only contain letters, spaces, hyphens, and apostrophes" }),
  specialization: z.string().min(1, { message: "Please select a specialization" }),
  stateLicensure: z.array(z.string())
    .min(1, { message: "Please select at least one state of licensure" })
    .refine((states) => states.every(state => usStates.includes(state)), {
      message: "Invalid state selected"
    }),
  licenseNumber: z.string()
    .min(5, { message: "License number must be at least 5 characters" })
    .max(20, { message: "License number must be less than 20 characters" })
    .regex(/^[A-Za-z0-9-]+$/, { message: "License number can only contain letters, numbers, and hyphens" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .min(5, { message: "Email must be at least 5 characters" })
    .max(100, { message: "Email must be less than 100 characters" }),
  contactNumber: z.string()
    .min(10, { message: "Contact number must be at least 10 digits" })
    .max(15, { message: "Contact number must be less than 15 digits" })
    .regex(/^[0-9-+() ]+$/, { message: "Contact number can only contain numbers, hyphens, plus sign, and parentheses" }),
  address: z.string()
    .min(5, { message: "Office address must be at least 5 characters or 'Not Applicable'" })
    .max(200, { message: "Office address must be less than 200 characters" })
    .refine(val => val.trim().toLowerCase() === 'not applicable' || val.length >= 5, {
      message: "Please enter a valid office address or 'Not Applicable'"
    }),
  npiNumber: z.string()
    .min(10, { message: "NPI number must be 10 digits" })
    .max(10, { message: "NPI number must be 10 digits" })
    .regex(/^[0-9]{10}$/, { message: "NPI number must be exactly 10 digits" }),
  city: z.string()
    .min(1, { message: "City is required" })
    .max(100, { message: "City must be less than 100 characters" })
    .regex(/^[a-zA-Z\s-]+$/, { message: "City can only contain letters, spaces, and hyphens" }),
  state: z.string()
    .min(1, { message: "State is required" })
    .refine((state) => usStates.includes(state), {
      message: "Please select a valid state"
    }),
  zipCode: z.string()
    .min(5, { message: "Zip code must be 5 digits" })
    .max(10, { message: "Zip code must be less than 10 characters" })
    .regex(/^[0-9-]+$/, { message: "Zip code can only contain numbers and hyphens" }),
  yearsInPractice: z.string()
    .min(1, { message: "Years in practice is required" })
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, {
      message: "Years in practice must be a number between 0 and 100"
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }),
  workingDays: z.record(z.object({
    isWorking: z.boolean(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format (use HH:MM)"
    }),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format (use HH:MM)"
    }),
  })).refine((days) => {
    // Ensure at least one working day is selected
    return Object.values(days).some(day => day.isWorking);
  }, {
    message: "Please select at least one working day"
  }).refine((days) => {
    // Validate that end time is after start time for working days
    return Object.entries(days).every(([_, day]) => {
      if (!day.isWorking) return true;
      const start = new Date(`2000-01-01T${day.startTime}`);
      const end = new Date(`2000-01-01T${day.endTime}`);
      return end > start;
    });
  }, {
    message: "End time must be after start time for working days"
  }),
});

const DoctorRegistration = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams ? searchParams.get('edit') === 'true' : false;
  const { user, isLoaded } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employmentType: "Full-Time",
      fullName: "",
      specialization: "",
      stateLicensure: [],
      licenseNumber: "",
      email: "",
      contactNumber: "",
      address: "",
      npiNumber: "",
      city: "",
      state: "",
      zipCode: "",
      yearsInPractice: "",
      password: "",
      workingDays: {
        sunday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
        monday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
        tuesday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
        wednesday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
        thursday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
        friday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
        saturday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
      },
    },
  });

  const prefillDoctorData = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/doctors/${userId}`);
      if (!res.ok) {
        console.error("Failed to fetch doctor data:", res.status);
        return;
      }
      const { data: doctor } = await res.json();
      if (!doctor) {
        console.error("No doctor data received");
        return;
      }

      console.log("Received doctor data:", doctor);

      let employmentType = 'Full-Time';
      if (doctor.type === 'PART') {
        employmentType = 'Part-Time';
      } else if (doctor.type === 'CONSULTANT') {
        employmentType = 'Consultant';
      }

      const formData = {
        employmentType: employmentType,
        fullName: doctor.name || '',
        specialization: doctor.specialization || '',
        stateLicensure: doctor.state_licensure || [],
        licenseNumber: doctor.license_number || '',
        email: doctor.email || '',
        contactNumber: doctor.phone || '',
        address: doctor.address || '',
        npiNumber: doctor.npi_number || '',
        city: doctor.city || '',
        state: doctor.state || '',
        zipCode: doctor.zip || '',
        yearsInPractice: doctor.years_in_practice ? String(doctor.years_in_practice) : '',
        password: '',
        workingDays: {
          sunday: { isWorking: false, startTime: '09:00', endTime: '17:00' },
          monday: { isWorking: false, startTime: '09:00', endTime: '17:00' },
          tuesday: { isWorking: false, startTime: '09:00', endTime: '17:00' },
          wednesday: { isWorking: false, startTime: '09:00', endTime: '17:00' },
          thursday: { isWorking: false, startTime: '09:00', endTime: '17:00' },
          friday: { isWorking: false, startTime: '09:00', endTime: '17:00' },
          saturday: { isWorking: false, startTime: '09:00', endTime: '17:00' },
        } as WorkingDays
      };

      if (doctor.working_days && Array.isArray(doctor.working_days)) {
        console.log("Processing working days:", doctor.working_days);
        doctor.working_days.forEach((day: any) => {
          const dayKey = day.day.toLowerCase() as keyof WorkingDays;
          console.log("Processing day:", dayKey, day);
          if (dayKey in formData.workingDays) {
            formData.workingDays[dayKey] = {
              isWorking: true,
              startTime: day.start_time || '09:00',
              endTime: day.close_time || day.end_time || '17:00',
            };
          }
        });
      }

      console.log("Form data to be set:", formData);

      form.reset(formData);

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'workingDays') {
          form.setValue(key as any, value, { shouldValidate: false });
        }
      });

      Object.entries(formData.workingDays).forEach(([day, schedule]) => {
        form.setValue(`workingDays.${day}` as any, schedule, { shouldValidate: false });
      });

      setTimeout(() => {
        const formValues = form.getValues();
        console.log("Form values after setting:", formValues);
      }, 100);

    } catch (err) {
      console.error("Error pre-filling doctor data:", err);
      toast({
        title: "Error",
        description: "Failed to load existing profile data. Please try again.",
        variant: "destructive",
      });
    }
  }, [form, toast]);

  useEffect(() => {
    if (editMode) {
      const subscription = form.watch((value) => {
        console.log("Form values changed:", value);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, editMode]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    const userRole = user.publicMetadata?.role;
    if (userRole === 'patient') {
      router.push('/patient');
      return;
    }

    const checkRegistrationStatus = async () => {
      try {
        console.log("Checking registration status for user:", user.id);
        console.log("Edit mode:", editMode);
        console.log("User metadata:", user.publicMetadata);
        
        const response = await fetch(`/api/doctors/check?userId=${user.id}`);
        const data = await response.json();
        
        console.log("Doctor check response:", data);
        
        if (data.exists) {
          console.log("Doctor exists in database, pre-filling data...");
          await prefillDoctorData(user.id);
          
          if (!editMode) {
            if (user.publicMetadata?.role === 'doctor') {
              if (user.publicMetadata?.status === 'pending') {
                router.push('/doctor-registration/pending');
                return;
              }
              router.push('/doctor');
              return;
            }
            
            await user.update({
              unsafeMetadata: {
                role: 'doctor',
                status: data.status || 'pending'
              }
            });
            
            if (data.status === 'pending') {
              router.push('/doctor-registration/pending');
            } else {
              router.push('/doctor');
            }
            return;
          }
        } else {
          console.log("Doctor does not exist in database");
          if (editMode) {
            toast({
              title: "Error",
              description: "No existing profile found. Please register first.",
              variant: "destructive",
            });
            router.push('/doctor-registration');
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking registration status:', error);
        toast({
          title: "Error",
          description: "Failed to check registration status. Please try again.",
          variant: "destructive",
        });
        setIsChecking(false);
      }
    };
    
    checkRegistrationStatus();
  }, [user, isLoaded, router, toast, prefillDoctorData, editMode]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const working_days = Object.entries(data.workingDays)
        .filter(([_, val]) => val.isWorking)
        .map(([day, val]) => ({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          start_time: val.startTime,
          close_time: val.endTime,
        }));

      const endpoint = editMode
        ? '/api/doctors/update'
        : '/api/doctors/register';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: data.email,
          name: data.fullName,
          specialization: data.specialization,
          state_licensure: data.stateLicensure,
          license_number: data.licenseNumber,
          phone: data.contactNumber,
          address: data.address,
          type: data.employmentType === 'Full-Time' ? 'FULL' : 'PART',
          city: data.city,
          state: data.state,
          zip: data.zipCode,
          npi_number: data.npiNumber,
          years_in_practice: data.yearsInPractice,
          password: data.password,
          working_days,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || (editMode ? 'Failed to update doctor' : 'Failed to register doctor'));
      }

      try {
        if (editMode) {
          await user.update({
            unsafeMetadata: {
              role: 'doctor',
              status: user.publicMetadata?.status || 'pending'
            }
          });
          if (data.password) {
            await user.updatePassword({ newPassword: data.password });
          }
        } else {
          await user.update({
            unsafeMetadata: {
              role: 'doctor',
              status: 'pending'
            }
          });
          if (data.password) {
            await user.updatePassword({ newPassword: data.password });
          }
        }
      } catch (metadataError) {
        console.error('Error updating user metadata or password:', metadataError);
      }

      toast({
        title: editMode ? 'Profile Updated!' : 'Registration Successful!',
        description: editMode
          ? 'Your profile has been updated.'
          : 'Your application has been submitted and is under review.',
        duration: 3000,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push(editMode ? '/doctor' : '/doctor-registration/pending');
    } catch (error) {
      console.error(editMode ? 'Update error:' : 'Registration error:', error);
      toast({
        title: editMode ? 'Update failed' : 'Registration failed',
        description: error instanceof Error ? error.message : (editMode ? 'There was a problem updating your profile. Please try again.' : 'There was a problem submitting your registration. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Checking registration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-8">
            <Logo className="h-30" logoClassName="h-30" />
          </div>
          
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Doctor Registration</CardTitle>
              <CardDescription>
                Complete your profile to join our healthcare provider network
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    {/* Employment Type */}
                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full-Time">Full-Time</SelectItem>
                              <SelectItem value="Part-Time">Part-Time</SelectItem>
                              <SelectItem value="Consultant">Consultant</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Full Name */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doctor's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Specialization and State Licensure */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select specialization" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {specializations.map((specialization) => (
                                  <SelectItem key={specialization} value={specialization}>
                                    {specialization}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="stateLicensure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State Licensure</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const currentValues = field.value || [];
                                if (!currentValues.includes(value)) {
                                  field.onChange([...currentValues, value]);
                                }
                              }}
                            >
                            <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select states" />
                                </SelectTrigger>
                            </FormControl>
                              <SelectContent>
                                {usStates.map((state) => (
                                  <SelectItem 
                                    key={state} 
                                    value={state}
                                    disabled={field.value?.includes(state)}
                                  >
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value?.map((state) => (
                                <div
                                  key={state}
                                  className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                                >
                                  {state}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.onChange(field.value?.filter((s) => s !== state));
                                    }}
                                    className="hover:text-destructive"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* License Number */}
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="License Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Email and Contact Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Office Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Office Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter office address or 'Not Applicable'" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* NPI Number, City, State, Zip */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="npiNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NPI Number</FormLabel>
                          <FormControl>
                            <Input placeholder="NPI Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
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
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Zip Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Years in Practice */}
                    <FormField
                      control={form.control}
                      name="yearsInPractice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Practice</FormLabel>
                          <FormControl>
                            <Input placeholder="Years in Practice" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a secure password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Working Days */}
                    <div>
                      <FormLabel>Working Days</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {[
                          { day: "sunday", label: "Sunday" },
                          { day: "monday", label: "Monday" },
                          { day: "tuesday", label: "Tuesday" },
                          { day: "wednesday", label: "Wednesday" },
                          { day: "thursday", label: "Thursday" },
                          { day: "friday", label: "Friday" },
                          { day: "saturday", label: "Saturday" },
                        ].map(({ day, label }) => (
                          <FormField
                            key={day}
                            control={form.control}
                            name={`workingDays.${day}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col space-y-2 rounded-md border p-3">
                                <div className="flex items-center space-x-3">
                                <FormControl>
                                  <Checkbox
                                      checked={field.value?.isWorking}
                                      onCheckedChange={(checked) => {
                                        field.onChange({
                                          ...field.value,
                                          isWorking: checked,
                                        });
                                      }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {label}
                                </FormLabel>
                                </div>
                                {field.value?.isWorking && (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <FormField
                                      control={form.control}
                                      name={`workingDays.${day}.startTime`}
                                      render={({ field: timeField }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              type="time"
                                              {...timeField}
                                              onChange={(e) => {
                                                timeField.onChange(e.target.value);
                                              }}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`workingDays.${day}.endTime`}
                                      render={({ field: timeField }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              type="time"
                                              {...timeField}
                                              onChange={(e) => {
                                                timeField.onChange(e.target.value);
                                              }}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        <h3 className="font-medium">Important Notice</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your registration will be reviewed by our administrators. 
                        You will receive access to the full platform once your credentials are verified.
                      </p>
                    </div>
                  </div>
                  
                  <CardFooter className="flex justify-between px-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        if (user?.publicMetadata?.role === 'doctor') {
                          router.push('/doctor');
                        } else {
                          router.push('/sign-up?role=doctor');
                        }
                      }}
                    >
                      {user?.publicMetadata?.role === 'doctor' ? 'Back to Dashboard' : 'Back'}
                    </Button>
                    <Button 
                      type="submit" 
                      className="gradient-bg"
                      disabled={submitting}
                    >
                      {submitting ? (editMode ? "Updating..." : "Submitting...") : (editMode ? "Update Profile" : "Submit Registration")}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorRegistration; 