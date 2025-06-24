"use client";

import { AppointmentSchema } from "@/lib/schema";
import { generateTimes } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { UserPen, Plus } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ProfileImage } from "../profile-image";
import { CustomInput } from "../custom-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";
import { PatientIntakeForm } from "./patient-intake-form";

const TYPES = [
  { label: "General Consultation", value: "General Consultation" },
  { label: "General Check up", value: "General Check Up" },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Lab Test", value: "Lab Test" },
  { label: "ANT", value: "ANT" },
];

export const BookAppointment = ({ data, doctors }: { data: Patient; doctors: Doctor[] }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [intakeData, setIntakeData] = useState<any>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  // Existing booking form logic
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [physicians, setPhysicians] = useState<Doctor[] | undefined>(doctors);
  const appointmentTimes = generateTimes(8, 17, 30);
  const patientName = `${data?.first_name} ${data?.last_name}`;
  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      doctor_id: "",
      appointment_date: "",
      time: "",
      type: "",
      note: "",
      mode: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof AppointmentSchema>> = async (values) => {
    try {
      setIsSubmitting(true);
      // Merge intakeData with appointment values and include service_id
      const newData = { 
        ...values, 
        patient_id: data?.id!, 
        ...intakeData,
        service_id: selectedServiceId || intakeData?.service_id,
        doctor_id: selectedDoctorId || values.doctor_id,
        type: selectedType || values.type,
        mode: selectedMode || values.mode
      };
      console.log("Submitting appointment data:", newData);
      const res = await createNewAppointment(newData);
      if (res.success) {
        form.reset({});
        router.refresh();
        toast.success("Appointment created successfully");
        router.push("/record/appoiment");
        setOpen(false);
        setStep(1);
        setIntakeData(null);
        setSelectedServiceId(null);
        setSelectedDoctorId(null);
        setSelectedType(null);
        setSelectedMode(null);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIntakeNext = (data: any) => {
    console.log("Intake form data received:", data);
    setIntakeData(data);
    setSelectedServiceId(data.service_id);
    setSelectedDoctorId(data.doctor_id);
    setSelectedType(data.type);
    setSelectedMode(data.mode);
    setStep(2);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 to-emerald-400 text-white font-bold px-7 py-3 shadow-xl hover:scale-105 hover:from-blue-700 hover:to-emerald-600 focus:ring-2 focus:ring-emerald-300 transition-all duration-200 text-base drop-shadow-lg"
        >
          <Plus size={22} className="text-white" />
          Book Appointment
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl rounded-r-2xl w-full max-w-2xl md:max-w-3xl h-[95vh] top-[2.5vh] right-[25%]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span>Loading</span>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            {step === 1 && (
              <PatientIntakeForm 
                onNext={handleIntakeNext}
                serviceId={selectedServiceId || undefined}
                doctorId={selectedDoctorId || undefined}
                type={selectedType || undefined}
                mode={selectedMode || undefined}
              />
            )}
            {step === 2 && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8 mt-5 2xl:mt-10"
                >
                  <div className="w-full rounded-md border border-input bg-background px-3 py-1 flex items-center gap-4">
                    <ProfileImage
                      url={data?.img!}
                      name={patientName}
                      className="size-16 border border-input"
                      bgColor={data?.colorCode!}
                    />

                    <div>
                      <p className="font-semibold text-lg">{patientName}</p>
                      <span className="text-sm text-gray-500 capitalize">
                        {data?.gender}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <CustomInput
                      type="select"
                      selectList={TYPES}
                      control={form.control}
                      name="type"
                      label="Appointment Type"
                      placeholder="Select a appointment type"
                      onChange={(value) => setSelectedType(value)}
                    />
                    <CustomInput
                      type="select"
                      selectList={[
                        { label: "In Person", value: "In Person" },
                        { label: "Virtual", value: "Virtual" },
                      ]}
                      control={form.control}
                      name="mode"
                      label="Appointment Mode"
                      placeholder="Select mode"
                      onChange={(value) => setSelectedMode(value)}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="doctor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Physician</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedDoctorId(value);
                          }}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a physician" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="">
                            {physicians?.map((i, id) => (
                              <SelectItem key={id} value={i.id} className="p-2">
                                <div className="flex flex-row gap-2 p-2">
                                  <ProfileImage
                                    url={i?.img!}
                                    name={i?.name}
                                    bgColor={i?.colorCode!}
                                    textClassName="text-black"
                                  />
                                  <div>
                                    <p className="font-medium text-start ">
                                      {i.name}
                                    </p>
                                    <span className="text-sm text-gray-600">
                                      {i?.specialization}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <CustomInput
                      type="date"
                      control={form.control}
                      name="appointment_date"
                      placeholder=""
                      label="Date"
                    />
                    <CustomInput
                      type="select"
                      control={form.control}
                      name="time"
                      placeholder="Select time"
                      label="Time"
                      selectList={appointmentTimes}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="note" className="text-sm font-medium text-gray-700 mb-1">Additional Note</label>
                    <textarea
                      id="note"
                      {...form.register("note")}
                      placeholder="Additional note"
                      className="w-full min-h-[80px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="bg-blue-600 w-full"
                  >
                    Submit
                  </Button>
                </form>
              </Form>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};