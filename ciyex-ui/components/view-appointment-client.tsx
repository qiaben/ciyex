"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ProfileImage } from "./profile-image";
import { Calendar, Phone } from "lucide-react";
import { format } from "date-fns";

export const ViewAppointmentClient = ({ id, buttonClassName }: { id: string | undefined, buttonClassName?: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${Number(id)}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v && !data) fetchAppointment();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={buttonClassName || "flex items-center justify-center rounded-full bg-blue-500/10 hover:underline text-blue-600 px-1.5 py-1 text-xs md:text-sm"}
        >
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px] max-h-[95%] md:max-w-2xl 2xl:max-w-3xl p-8 overflow-y-auto bg-card rounded-2xl shadow-xl border border-border">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : data ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold text-foreground tracking-tight mb-1">Patient Appointment</DialogTitle>
              <DialogDescription className="mb-4 text-base text-muted-foreground">
                This appointment was booked on <span className="font-semibold text-primary">{format(new Date(data.created_at), "PPpp")}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-6 bg-primary rounded-full" />
                <p className="font-semibold text-primary text-sm uppercase tracking-widest">Personal Information</p>
              </div>
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex gap-4 w-full md:w-1/2 items-center bg-muted/40 rounded-xl p-4 shadow-sm">
                  <ProfileImage
                    url={data?.patient?.img}
                    name={data?.patient?.first_name + " " + data?.patient?.last_name}
                    className="size-20 bg-primary border-2 border-card shadow"
                    textClassName="text-2xl"
                  />
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground uppercase">{data?.patient?.first_name + " " + data?.patient?.last_name}</h2>
                    <p className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar size={18} className="text-muted-foreground" />
                      {/* Age calculation can be added here if needed */}
                    </p>
                    <span className="flex items-center text-xs gap-2 text-muted-foreground">
                      <Phone size={14} className="text-muted-foreground" />
                      {data?.patient?.phone}
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-muted/60 rounded-xl p-4 shadow-sm">
                  <span className="text-xs text-muted-foreground font-semibold">Address</span>
                  <p className="text-muted-foreground capitalize text-sm mt-1">{data?.patient?.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-6 bg-accent rounded-full" />
                <p className="font-semibold text-accent text-sm uppercase tracking-widest">Appointment Information</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
                <div className="bg-card rounded-lg p-4 shadow border border-border">
                  <span className="text-xs text-muted-foreground">Date</span>
                  <p className="text-base font-semibold text-foreground mt-1">{format(new Date(data?.appointment_date), "MMM dd, yyyy")}</p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow border border-border">
                  <span className="text-xs text-muted-foreground">Time</span>
                  <p className="text-base font-semibold text-foreground mt-1">{data?.time}</p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow border border-border flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="text-base font-semibold text-foreground mt-1">{data?.status}</span>
                </div>
                <div className="bg-card rounded-lg p-4 shadow border border-border flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Mode</span>
                  <span className="text-base font-semibold text-foreground mt-1">{data?.mode}</span>
                </div>
              </div>
              {data?.note && (
                <div className="bg-primary/10 border-l-4 border-primary/40 px-4 py-2 rounded italic text-primary text-sm mb-2">
                  <span className="text-xs text-primary font-semibold">Note from Patient:</span> {data?.note}
                </div>
              )}
              <div className="flex items-center gap-2 mb-2 mt-6">
                <span className="w-2 h-6 bg-primary rounded-full" />
                <p className="font-semibold text-primary text-sm uppercase tracking-widest">Physician Information</p>
              </div>
              <div className="w-full flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex gap-4 items-center bg-muted/40 rounded-xl p-4 shadow-sm">
                  <ProfileImage
                    url={data?.doctor?.img}
                    name={data?.doctor?.name}
                    className="xl:size-20 bg-primary border-2 border-card shadow"
                    textClassName="xl:text-2xl"
                  />
                  <div>
                    <h2 className="text-lg uppercase font-bold text-foreground">{data?.doctor?.name}</h2>
                    <p className="flex items-center gap-2 text-muted-foreground capitalize text-sm">{data?.doctor?.specialty}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">No data found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 