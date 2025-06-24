import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { checkRole } from "@/utils/roles";
import { ReviewForm } from "../dialogs/review-form";
import { BarChart, ClipboardList, Stethoscope, Receipt, FileText, FlaskConical, HeartPulse, History } from "lucide-react";

const LINKS = [
  { href: "?cat=charts", label: "Charts", icon: <BarChart className="w-4 h-4" /> },
  { href: "?cat=appointments", label: "Appointments", icon: <ClipboardList className="w-4 h-4" /> },
  { href: "?cat=diagnosis", label: "Diagnosis", icon: <Stethoscope className="w-4 h-4" /> },
  { href: "?cat=billing", label: "Bills", icon: <Receipt className="w-4 h-4" /> },
  { href: "?cat=medical-history", label: "Medical History", icon: <History className="w-4 h-4" /> },
  { href: "?cat=payments", label: "Payments", icon: <FileText className="w-4 h-4" /> },
  { href: "?cat=lab-test", label: "Lab Test", icon: <FlaskConical className="w-4 h-4" /> },
  { href: "?cat=appointments#vital-signs", label: "Vital Signs", icon: <HeartPulse className="w-4 h-4" /> },
];

interface AppointmentQuickLinksProps {
  staffId: string;
  userId: string | null;
  isPatient: boolean;
  isAdmin: boolean;
  isAppointmentCompleted: boolean;
  appointmentId: string;
}

const AppointmentQuickLinks = async ({ staffId, userId, isPatient, isAdmin, isAppointmentCompleted, appointmentId }: AppointmentQuickLinksProps) => {
  // isPatient check is done in parent and passed as prop
  // Optionally, get current cat from URL for active state
  return (
    <Card className="w-full rounded-2xl bg-card shadow border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground border border-border shadow-sm font-semibold transition-all duration-150 hover:bg-accent/30 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
            title={link.label}
          >
            {link.icon}
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        ))}
        {/* Show ReviewForm if user is logged in, is a patient or admin, and appointment is completed */}
        {userId && (isPatient || isAdmin) && isAppointmentCompleted && (
          <ReviewForm staffId={staffId} appointmentId={appointmentId} />
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentQuickLinks;