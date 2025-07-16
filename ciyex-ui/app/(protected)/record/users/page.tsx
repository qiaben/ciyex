import { getCurrentUserFromToken } from "@/utils/auth";
import UserTableClient from "./UserTableClient";
import { Users, Mail, Calendar } from "lucide-react";
import React from "react";

type User = {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
  lastSignInAt: string;
};

export default async function UserPage() {
  // Get the currently signed-in user from JWT
  const currentUser = await getCurrentUserFromToken();

  // --- Replace this with your real users fetch (DB/API/etc.) ---
  // This is just sample/mock data for demonstration:
  const users: User[] = [
    {
      id: 1,
      fullName: "Alice Anderson",
      email: "alice@company.com",
      roles: ["ADMIN", "DOCTOR"],
      lastSignInAt: "2024-07-15T14:20:00Z"
    },
    {
      id: 2,
      fullName: "Bob Brown",
      email: "bob@company.com",
      roles: ["PATIENT"],
      lastSignInAt: "2024-07-13T18:42:00Z"
    },
    ...(currentUser
        ? [{
          id: currentUser.userId,
          fullName: currentUser.fullName,
          email: currentUser.email,
          roles: currentUser.roles,
          lastSignInAt: new Date().toISOString()
        }]
        : []),
  ];
  // ---

  const totalCount = users.length;

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors w-full">
        <div className="h-full w-full px-0 sm:px-2 md:px-6 lg:px-12 xl:px-24 py-4 md:py-8">
          {/* Header Section */}
          <div className="mb-6 md:mb-8 px-4 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:gap-6">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white tracking-wide">
                  Users
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-300 font-light tracking-wide">
                  Manage your team members and their account permissions
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex gap-4 mb-6 md:mb-8 overflow-x-auto pb-2 px-2 md:px-0 hide-scrollbar">
            <div className="min-w-[220px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 hover:border-gray-200/50 dark:hover:border-gray-700/50 transition-all duration-300 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-light">Total Users</p>
                  <p className="text-2xl font-light text-gray-900 dark:text-white mt-1">{totalCount}</p>
                </div>
              </div>
            </div>
            <div className="min-w-[220px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 hover:border-gray-200/50 dark:hover:border-gray-700/50 transition-all duration-300 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/30">
                  <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-light">Active Users</p>
                  <p className="text-2xl font-light text-gray-900 dark:text-white mt-1">{totalCount}</p>
                </div>
              </div>
            </div>
            <div className="min-w-[220px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 hover:border-gray-200/50 dark:hover:border-gray-700/50 transition-all duration-300 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/30">
                  <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-light">New This Week</p>
                  <p className="text-2xl font-light text-gray-900 dark:text-white mt-1">+5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Filter/Search */}
          <div className="sticky top-0 z-20 bg-gradient-to-b from-slate-50/90 via-white/90 to-slate-50/80 dark:from-gray-900/90 dark:via-gray-950/90 dark:to-gray-900/80 px-2 md:px-0 pt-2 pb-4 md:static md:bg-none">
            <UserTableClient initialUsers={users} totalCount={totalCount} initialRole="" />
          </div>
        </div>
      </div>
  );
}
