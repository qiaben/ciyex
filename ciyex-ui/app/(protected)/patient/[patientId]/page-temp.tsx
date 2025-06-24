import { MedicalHistoryContainer } from "@/components/medical-history-container";
import { PatientRatingContainer } from "@/components/patient-rating-container";
import { ProfileImage } from "@/components/profile-image";
import { Card } from "@/components/ui/card";
import { getPatientFullDataById } from "@/utils/services/patient";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";
import { User, Calendar, Phone, MapPin, Droplet, Heart, Users, Edit, FileText, Receipt, FlaskConical, Home } from "lucide-react";

interface ParamsProps {
  params: Promise<{ patientId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PatientProfile = async (props: ParamsProps) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  let id = params.patientId;
  let patientId = params.patientId;
  const cat = searchParams?.cat || "medical-history";

  if (patientId === "self") {
    const { userId } = await auth();
    id = userId!;
  } else id = patientId;

  const result = await getPatientFullDataById(id);
  if (!result.success) {
    return <div>Error loading patient: {"message" in result ? result.message : "Unknown error"}</div>;
  }
  const { data } = result as { success: true; data: any };

  const SmallCard = ({ label, value }: { label: string; value: string }) => (
    <div className="w-full md:w-1/3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className="text-sm md:text-base capitalize text-foreground">{value}</p>
    </div>
  );

  const infoItems = [
    { label: "Gender", value: data?.gender?.toLowerCase(), icon: <Users className="w-4 h-4 text-primary" /> },
    { label: "Date of Birth", value: format(data?.date_of_birth!, "yyyy-MM-dd"), icon: <Calendar className="w-4 h-4 text-primary" /> },
    { label: "Phone", value: data?.phone, icon: <Phone className="w-4 h-4 text-primary" /> },
    { label: "Blood Group", value: data?.blood_group, icon: <Droplet className="w-4 h-4 text-primary" /> },
    { label: "Address", value: data?.address, icon: <MapPin className="w-4 h-4 text-primary" /> },
    { label: "Contact Person", value: data?.emergency_contact_name, icon: <User className="w-4 h-4 text-primary" /> },
    { label: "Emergency Contact", value: data?.emergency_contact_number, icon: <Phone className="w-4 h-4 text-primary" /> },
    { label: "Last Visit", value: data?.lastVisit ? format(data?.lastVisit!, "yyyy-MM-dd") : "No last visit", icon: <Calendar className="w-4 h-4 text-primary" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full min-h-screen bg-background p-4 md:p-8">
      {/* Left: Profile Card */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 flex flex-col items-center relative">
          <ProfileImage
            url={data?.img!}
            name={data?.first_name + " " + data?.last_name}
            className="h-28 w-28 mb-4 border-4 border-primary/30 shadow-lg"
          />
          <h1 className="text-2xl font-extrabold text-foreground font-sans tracking-tight mb-1 text-center">
            {data?.first_name + " " + data?.last_name}
          </h1>
          <span className="text-sm text-muted-foreground mb-2">{data?.email}</span>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-semibold text-primary flex items-center gap-1">
              <Users className="w-4 h-4" /> {data?.gender?.toLowerCase()}
            </span>
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-semibold text-primary flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {format(data?.date_of_birth!, "yyyy")}
            </span>
          </div>
          <div className="flex justify-center gap-6 w-full mb-4">
            <div className="flex flex-col items-center">
              <FileText className="w-5 h-5 text-accent mb-1" />
              <span className="text-lg font-bold text-foreground">{data?.totalAppointments}</span>
              <span className="text-xs text-muted-foreground">Appointments</span>
            </div>
            <div className="flex flex-col items-center">
              <Calendar className="w-5 h-5 text-accent mb-1" />
              <span className="text-lg font-bold text-foreground">{data?.lastVisit ? format(data?.lastVisit!, "yyyy-MM-dd") : "-"}</span>
              <span className="text-xs text-muted-foreground">Last Visit</span>
            </div>
          </div>
          {patientId === "self" && (
            <Link href="/patient/registration" className="absolute top-4 right-4 bg-primary/10 text-primary rounded-full p-2 hover:bg-primary/20 transition" title="Edit Profile">
              <Edit className="w-5 h-5" />
            </Link>
          )}
        </div>
        {/* Quick Links */}
        <div className="bg-card rounded-2xl border border-border shadow p-4 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground mb-2">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/record/appointments?id=${id}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground border border-border shadow-sm font-semibold transition-all duration-150 hover:bg-accent/30 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40" title="Appointments">
              <FileText className="w-4 h-4" /> Appointments
            </Link>
            <Link href="?cat=medical-history" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground border border-border shadow-sm font-semibold transition-all duration-150 hover:bg-accent/30 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40" title="Medical Records">
              <Receipt className="w-4 h-4" /> Medical Records
            </Link>
            <Link href="?cat=payments" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground border border-border shadow-sm font-semibold transition-all duration-150 hover:bg-accent/30 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40" title="Medical Bills">
              <Receipt className="w-4 h-4" /> Medical Bills
            </Link>
            <Link href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground border border-border shadow-sm font-semibold transition-all duration-150 hover:bg-accent/30 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40" title="Lab Test & Result">
              <FlaskConical className="w-4 h-4" /> Lab Test & Result
            </Link>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground border border-border shadow-sm font-semibold transition-all duration-150 hover:bg-accent/30 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40" title="Dashboard">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </div>
        {/* Patient Ratings */}
        <PatientRatingContainer id={id!} />
      </div>
      {/* Right: Details and Tabs */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <div className="bg-card rounded-2xl border border-border shadow p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infoItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/60">
                {item.icon}
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-base text-muted-foreground">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tabs for Medical History, Bills, etc. */}
        <div className="bg-card rounded-2xl border border-border shadow p-6">
          <div className="flex gap-2 mb-4">
            <Link href="?cat=medical-history" className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${cat === "medical-history" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent/30"}`}>Medical History</Link>
            <Link href="?cat=payments" className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${cat === "payments" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent/30"}`}>Medical Bills</Link>
          </div>
          <div>
            {cat === "medical-history" && <MedicalHistoryContainer patientId={id} />}
            {/* {cat === "payments" && <Payments patientId={id!} />} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;