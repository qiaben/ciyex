"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema } from "@/lib/schema";
import { z } from "zod";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CheckCircle } from "lucide-react";
import { createNewPatient, updatePatient } from "@/app/actions/patient";
import { toast } from "sonner";
import { getCurrentUserFromToken } from "@/app/utils/auth";

type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
type Relation = "mother" | "father" | "husband" | "wife" | "other";

interface DataProps {
    data?: any;
    type: "create" | "update";
}

export const NewPatient = ({ data, type }: DataProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");
    const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitting" | "success">("idle");
    const [user, setUser] = useState<any>(null);

    const form = useForm({
        resolver: zodResolver(PatientFormSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            address: "",
            date_of_birth: new Date(),
            gender: "MALE" as Gender,
            city: "",
            state: "",
            zip_code: "",
            height: 0,
            weight: 0,
            preferred_contact_method: "Email" as const,
            preferred_appointment_type: "In-person" as const,
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

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUserFromToken();
            setUser(currentUser);
            if (type === "create") {
                form.reset((prev) => ({
                    ...prev,
                    first_name: currentUser?.fullName?.split(" ")[0] || "",
                    last_name: currentUser?.fullName?.split(" ")[1] || "",
                    email: currentUser?.email || "",
                    phone: "",
                }));
            } else if (type === "update" && data) {
                const dob = data.date_of_birth ? new Date(data.date_of_birth) : new Date();
                form.reset({
                    ...data,
                    date_of_birth: isNaN(dob.getTime()) ? new Date() : dob,
                    height: Number(data.height) || 0,
                    weight: Number(data.weight) || 0,
                    medical_consent: Boolean(data.medical_consent),
                    privacy_consent: Boolean(data.privacy_consent),
                    service_consent: Boolean(data.service_consent),
                    year_of_registration: String(new Date().getFullYear()),
                });
            }
        };
        fetchUser();
    }, [type, data]);

    const onSubmit = async (formData: z.infer<typeof PatientFormSchema>) => {
        try {
            if (!user) {
                toast.error("Please sign in to continue");
                router.push("/sign-in");
                return;
            }

            setLoading(true);

            const safeData = {
                ...formData,
                height: Number(formData.height) || 0,
                weight: Number(formData.weight) || 0,
                date_of_birth: new Date(formData.date_of_birth),
                preferred_contact_method: formData.preferred_contact_method || "Email",
                preferred_appointment_type: formData.preferred_appointment_type || "In-person",
                marital_status: formData.marital_status || "SINGLE",
            };

            let response;
            if (type === "create") {
                response = await createNewPatient(safeData, user.userId);
            } else if (type === "update") {
                const patientId = String(data?.id ?? data?.patient_id ?? "");
                if (!patientId) {
                    toast.error("Missing patient ID for update.");
                    return;
                }
                response = await updatePatient(safeData, patientId);
            }

            if (!response) {
                toast.error("No response received. Try again.");
                return;
            }

            if (response.error || !response.success) {
                toast.error(response.msg || "Failed to save patient info.");
                return;
            }

            toast.success(type === "create" ? "Patient created!" : "Patient updated!");
            setSubmissionStatus("success");
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submissionStatus === "success") {
        return (
            <div className="min-h-screen flex flex-col">
                <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center border border-gray-100">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h1>
                        <p className="text-gray-600 mb-6">
                            Your patient information has been successfully {type === "create" ? "submitted" : "updated"}.
                        </p>
                        <Button
                            className="bg-emerald-500 hover:bg-emerald-600 px-6"
                            onClick={() => {
                                setDashboardLoading(true);
                                router.push("/patient");
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
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
                                        <TabsTrigger value="personal">Personal</TabsTrigger>
                                        <TabsTrigger value="contact">Contact</TabsTrigger>
                                        <TabsTrigger value="medical">Medical</TabsTrigger>
                                    </TabsList>
                                    {/* Tab contents go here */}
                                </Tabs>
                            </form>
                        </Form>
                    </div>
                </div>
            </main>
        </div>
    );
};
