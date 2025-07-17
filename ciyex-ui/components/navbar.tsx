"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Microscope,
  ClipboardList,
  UserCircle,
} from "lucide-react";
import { NotificationItem } from "./notification";
import { ThemeToggle } from "./ThemeToggle";
import CartDropdown from "./elab/CartDropdown";
import NotificationBell from "./elab/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUserFromToken } from "@/app/utils/auth"; // <-- your helper!

// Helper to read JWT and return { userId, email, fullName, roles, ... }
const useCurrentUser = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUserFromToken();
      setUser(u);
    };
    fetchUser();
  }, []);
  return user;
};

const AnimatedUserButton = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Use whatever field is your role string
  const userRole = user?.roles?.[0]?.toLowerCase() || "user";
  const fullName = user?.fullName || "User";
  const email = user?.email || "";
  const imageUrl = user?.imageUrl || "";

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
  };

  const menuVariants = {
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 },
  };

  const handleSignOut = () => {
    // Remove JWT from localStorage/cookie/session etc
    localStorage.removeItem("jwt"); // If that's where it's stored!
    window.location.href = "/";
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case "admin":
        return [
          { label: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
          { label: "Admin Elab", path: "/admin/admin-elab", icon: Microscope },
        ];
      case "doctor":
        return [
          { label: "Doctor Dashboard", path: "/doctor", icon: LayoutDashboard },
          { label: "Services", path: "/services", icon: ClipboardList },
        ];
      case "patient":
      case "user":
        return [
          { label: "Patient Dashboard", path: "/patient", icon: LayoutDashboard },
          { label: "Patient Elab", path: "/Elabs", icon: Microscope },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="relative"
          >
            <motion.div
                animate={{
                  rotate: isHovered ? 360 : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 p-[2px] cursor-pointer"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 blur-sm opacity-50" />
              <div className="relative w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage src={imageUrl} alt={fullName} />
                      <AvatarFallback className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white">
                        {fullName.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                ) : (
                    <UserCircle className="w-6 h-6 text-emerald-500" />
                )}
              </div>
            </motion.div>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"
            />
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2" asChild>
          <motion.div
              variants={menuVariants}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <DropdownMenuLabel className="p-2">
              <motion.div variants={itemVariants} className="flex flex-col gap-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {fullName}
                </p>
                <p className="text-xs text-gray-500">{email}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 capitalize">
                  {userRole || "User"}
                </p>
              </motion.div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navigationItems.map((item) => (
                <motion.div key={item.path} variants={itemVariants}>
                  <DropdownMenuItem
                      onClick={() => handleNavigation(item.path)}
                      className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                </motion.div>
            ))}
            <DropdownMenuSeparator />
            <motion.div variants={itemVariants}>
              <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </motion.div>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
  );
};

export const Navbar = () => {
  // No Clerk! Use your helper
  const user = useCurrentUser();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      message: "Your appointment status changed to SCHEDULED.",
      type: "info",
      createdAt: new Date(),
    },
    {
      id: 2,
      message: "Appointment completed successfully!",
      type: "success",
      createdAt: new Date(),
    },
  ]);

  const handleClearNotifications = () => setNotifications([]);

  function formatPathName(): string {
    const pathname = usePathname();

    if (!pathname) return "Overview";

    const splitRoute = pathname.split("/");
    const lastIndex = splitRoute.length - 1 > 2 ? 2 : splitRoute.length - 1;

    const pathName = splitRoute[lastIndex];

    const formattedPath = pathName.replace(/-/g, " ");

    return formattedPath;
  }

  const path = formatPathName();

  return (
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 px-6 flex items-center justify-between bg-background/80 text-foreground backdrop-blur-md border-b border-border/50 relative group animate-fade-in w-full">
        {/* z-40 ensures navbar is always below the sidebar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight font-sans bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 bg-clip-text text-transparent capitalize animate-slide-in">
            {path || "Overview"}
          </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <div className="flex items-center animate-scale-in">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-border/50 bg-card/50 shadow-sm hover:border-primary/40 hover:bg-card/80 transition-all duration-200">
              <ThemeToggle />
            </div>
          </div>
          <NotificationBell />
          {/* User Button */}
          {user?.userId && (
              <div className="flex items-center animate-scale-in [animation-delay:200ms]">
                <AnimatedUserButton />
              </div>
          )}
        </div>
      </nav>
  );
};
