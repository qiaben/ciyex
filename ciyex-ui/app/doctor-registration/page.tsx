"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HeartPulse, Clock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { getDoctorById } from '@/utils/services/doctor';
import Logo from '@/components/Logo';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

import { getCurrentUserFromToken } from "@/app/utils/auth";

// Explicitly define `usStates` type
const usStates: string[] = ["California", "Texas", "Florida", "New York", "Illinois"]; // Example, replace with your actual states list

const specializations = [/* Define your specializations list */];

// Define the structure of working days
type WorkingDay = {
    isWorking: boolean;
    startTime: string;
    endTime: string;
};

type WorkingDays = {
    sunday: WorkingDay;
    monday: WorkingDay;
    tuesday: WorkingDay;
    wednesday: WorkingDay;
    thursday: WorkingDay;
    friday: WorkingDay;
    saturday: WorkingDay;
};

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
    })).refine((days) => Object.values(days).some(day => day.isWorking), {
        message: "Please select at least one working day"
    }).refine((days) => Object.entries(days).every(([_, day]) => {
        if (!day.isWorking) return true;
        const start = new Date(`2000-01-01T${day.startTime}`);
        const end = new Date(`2000-01-01T${day.endTime}`);
        return end > start;
    }), {
        message: "End time must be after start time for working days"
    }),
});

const DoctorRegistration = () => {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editMode = searchParams ? searchParams.get('edit') === 'true' : false;

    const { user, isLoaded, updateUser, updatePassword } = useAuthUser();

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
            if (!res.ok) return;
            const { data: doctor } = await res.json();
            if (!doctor) return;

            let employmentType = 'Full-Time';
            if (doctor.type === 'PART') employmentType = 'Part-Time';
            else if (doctor.type === 'CONSULTANT') employmentType = 'Consultant';

            const formData = {
                employmentType,
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
                }
            };

            if (doctor.working_days && Array.isArray(doctor.working_days)) {
                doctor.working_days.forEach((day: {
                    end_time: string;
                    day: string; start_time: string; close_time: string; }) => {
                    const dayKey = day.day.toLowerCase() as keyof WorkingDays;
                    if (dayKey in formData.workingDays) {
                        formData.workingDays[dayKey] = {
                            isWorking: true,
                            startTime: day.start_time || '09:00',
                            endTime: day.close_time || day.end_time || '17:00',
                        };
                    }
                });
            }

            form.reset(formData);
            Object.entries(formData.workingDays).forEach(([day, schedule]) => {
                form.setValue(`workingDays.${day}` as any, schedule, { shouldValidate: false });
            });

        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to load existing profile data. Please try again.",
                variant: "destructive",
            });
        }
    }, [form, toast]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) {
            router.push('/sign-in');
            return;
        }
        if (user.role === 'patient') {
            router.push('/patient');
            return;
        }

        const checkRegistrationStatus = async () => {
            try {
                const response = await fetch(`/api/doctors/check?userId=${user.id}`);
                const data = await response.json();

                if (data.exists) {
                    await prefillDoctorData(user.id);

                    if (!editMode) {
                        if (user.role === 'doctor') {
                            if (user.status === 'pending') {
                                router.push('/doctor-registration/pending');
                                return;
                            }
                            router.push('/doctor');
                            return;
                        }

                        await updateUser({ role: 'doctor', status: data.status || 'pending' });
                        if (data.status === 'pending') router.push('/doctor-registration/pending');
                        else router.push('/doctor');
                        return;
                    }
                } else {
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
                toast({
                    title: "Error",
                    description: "Failed to check registration status. Please try again.",
                    variant: "destructive",
                });
                setIsChecking(false);
            }
        };
        checkRegistrationStatus();
    }, [user, isLoaded, router, toast, prefillDoctorData, editMode, updateUser]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setSubmitting(true);
        try {
            if (!user) throw new Error('User not authenticated');

            const working_days = Object.entries(data.workingDays)
                .filter(([_, val]) => val.isWorking)
                .map(([day, val]) => ({
                    day: day.charAt(0).toUpperCase() + day.slice(1),
                    start_time: val.startTime,
                    close_time: val.endTime,
                }));

            const endpoint = editMode ? '/api/doctors/update' : '/api/doctors/register';
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
                await updateUser({ role: 'doctor', status: editMode ? user.status || 'pending' : 'pending' });
                if (data.password && typeof updatePassword === "function") {
                    await updatePassword(data.password);
                }
            } catch (metadataError) {
                // Handle as you need (log, toast, etc.)
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
                                    {/* All FormField JSX unchanged */}
                                    <CardFooter className="flex justify-between px-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                if (user?.role === 'doctor') {
                                                    router.push('/doctor');
                                                } else {
                                                    router.push('/sign-up?role=doctor');
                                                }
                                            }}
                                        >
                                            {user?.role === 'doctor' ? 'Back to Dashboard' : 'Back'}
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
function useAuthUser(): { user: any; isLoaded: any; updateUser: any; updatePassword: any; } {
    throw new Error("Function not implemented.");
}

