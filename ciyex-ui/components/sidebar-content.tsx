'use client';

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
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  List,
  ListOrdered,
  Logs,
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
};

const SidebarIcon = ({ iconName }: { iconName: string }) => {
  const Icon = iconMap[iconName];
  return Icon ? <Icon className="size-5 text-primary" /> : null;
};

interface SidebarContentProps {
  role: string | null;
  links: any[]; // You might want to type this more specifically
}

export const SidebarContent = ({ role, links }: SidebarContentProps) => {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <div className="p-4">
        <div className="flex flex-col items-center lg:items-start gap-3 mb-8 group/logo w-full">
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-secondary/50 hover:text-primary transition-all duration-200"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          ) : (
            <Link href="/" className="flex flex-col items-center w-full">
              {/* Logo for retracted state */}
              <div className="group-hover:hidden flex justify-center w-full">
                <Image
                  src="/logo1.png"
                  alt="Logo"
                  width={150}
                  height={50}
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              {/* Logo for expanded state on hover */}
              <div className="hidden group-hover:flex justify-center w-full">
                <Image
                  src="/logo.png"
                  alt="OurTop Clinic Logo Large"
                  width={150}
                  height={150}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {links.map((el) => {
            if (el.access && !el.access.includes((role || 'user').toLowerCase())) return null;
            return (
              <div key={el.label} className="space-y-1">
                <span className="hidden lg:block text-xs font-semibold font-sans tracking-wider text-primary uppercase px-2 animate-fadeIn opacity-0 group-hover:opacity-100 transition-opacity duration-200 will-change-opacity">
                  {el.label}
                </span>

                <div className="space-y-1">
                  {el.links.map((link: any) => {
                    if (!link.access) return null;
                    if (link.access.includes((role || 'user').toLowerCase())) {
                      return (
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 px-3 py-2 text-foreground rounded-lg hover:bg-secondary/50 hover:text-primary transition-[background,color,box-shadow] duration-200 group/link border border-transparent hover:border-primary/20 hover:shadow-sm will-change-opacity"
                          key={link.name}
                        >
                          <div className="group-hover/link:scale-110 transition-transform duration-200 will-change-transform">
                            <SidebarIcon iconName={link.icon} />
                          </div>
                          <span className="hidden lg:block text-sm font-medium font-sans group-hover/link:translate-x-1 transition-transform duration-200 whitespace-nowrap opacity-0 group-hover:opacity-100 will-change-opacity">
                            {link.name}
                          </span>
                        </Link>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <LogoutButton />
      </div>
    </>
  );
}; 