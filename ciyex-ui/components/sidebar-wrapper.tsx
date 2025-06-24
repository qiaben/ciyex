'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export const SidebarWrapper = ({ children }: { children: React.ReactNode }) => {
  return <SidebarProvider>{children}</SidebarProvider>;
}; 