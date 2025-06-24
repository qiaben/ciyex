"use client";
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "../components/ThemeProvider";
import { themeColors } from "./theme";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ClientThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    let resolvedTheme: "light" | "dark" = "light";
    if (theme === "system") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else if (theme === "dark") {
      resolvedTheme = "dark";
    }
    const colors = themeColors[resolvedTheme];
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`, value as string);
    });
  }, [theme]);

  return (
    <>
      {/* <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
        <ThemeToggle />
      </div> */}
      {children}
    </>
  );
}