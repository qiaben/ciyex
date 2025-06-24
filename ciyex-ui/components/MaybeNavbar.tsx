"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export function MaybeNavbar() {
  const pathname = usePathname();
  if (pathname === "/my-tests") return null;
  return <Navbar />;
} 