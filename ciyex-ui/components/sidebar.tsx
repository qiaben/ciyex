import { getRole } from "@/utils/roles";
import {
  Bell,
  LayoutDashboard,
  List,
  ListOrdered,
  Logs,
  LucideIcon,
  Pill,
  Receipt,
  Settings,
  SquareActivity,
  User,
  UserRound,
  Users,
  UsersRound,
  MessageCircle,
  CalendarCheck,
  FileText,
  FlaskConical,
  Video,
  Menu,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { LogoutButton } from "./logout-button";
import Image from "next/image";
import { SidebarContent } from "@/components/sidebar-content";
import { SidebarWrapper } from "./sidebar-wrapper";

const ACCESS_LEVELS_ALL = [
  "admin",
  "doctor",
  "patient",
];

// Server component
export const Sidebar = async () => {
  const role = await getRole();

  const SIDEBAR_LINKS = [
    {
      label: "Manage",
      links: [
        {
          name: "Dashboard",
          href: `/${(role || 'user').toLowerCase()}`,
          access: ACCESS_LEVELS_ALL,
          icon: "LayoutDashboard",
        },
        {
          name: "Profile",
          href: "/patient/self",
          access: ["patient"],
          icon: "User",
        },
        {
          name: "Users",
          href: "/record/users",
          access: ["admin"],
          icon: "Users",
        },
        {
          name: "Virtual",
          href: role === 'patient' ? "/record/Patient-Appointments" : "/record/Doctor-Appointment",
          access: ["doctor","patient"],
          icon: "Video",
        },
        {
          name: "Services",
          href: role === 'admin' ? "/admin/admin-services" : "/services",
          access: ["doctor","admin"],
          icon: "ListOrdered",
        },
        {
          name: "Doctors",
          href: "/record/doctors/list",
          access: ["admin"],
          icon: "User",
        },
        {
          name: "Patients",
          href: "/record/patients",
          access: ["admin", "doctor"],
          icon: "UsersRound",
        },
        {
          name: "Providers",
          href: "/providers",
          access: ["patient"],
          icon: "Users",
        },
        {
          name: "Appointments",
          href: "/record/appointments",
          access: ["admin", "doctor", "nurse"],
          icon: "CalendarCheck",
        },
        {
          name: "Medical Records",
          href: "/record/medical-records",
          access: ["nurse"],
          icon: "SquareActivity",
        },
        {
          name: "Billing Overview",
          href: "/record/billing",
          access: ["doctor"],
          icon: "Receipt",
        },
        {
          name: "Patient Management",
          href: "/nurse/patient-management",
          access: ["nurse"],
          icon: "User",
        },
        {
          name: "Appointments",
          href: "/record/appointments/",
          access: ["patient"],
          icon: "CalendarCheck",
        },
        {
          name: "Records",
          href: "/patient/self",
          access: ["nurse"],
          icon: "FileText",
        },
        {
          name: "Billing",
          href: "/patient/self?cat=payments",
          access: ["nurse"],
          icon: "Receipt",
        },
      ],
    },
    {
      label: "E-Orders",
      access: ["admin","patient"],
      links: [
        {
          name: "Eprescription",
          href: "/Eprescription",
          access: ["nurse"],
          icon: "Pill",
        },
        {
          name: "E-Lab",
          href: role === 'admin' ? "/admin/admin-elab" : "/Elabs",
          access: ["admin", "patient"],
          icon: "FlaskConical",
        },
      ],
    },
  ];

  return (
    <SidebarWrapper>
      <div className="w-full h-full flex flex-col justify-between bg-background backdrop-blur-sm border-r border-border relative group overflow-hidden will-change-transform">
        {/* Animated border right */}
        <div className="absolute right-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 will-change-transform"></div>

        <SidebarContent role={role} links={SIDEBAR_LINKS} />
      </div>
    </SidebarWrapper>
  );
};