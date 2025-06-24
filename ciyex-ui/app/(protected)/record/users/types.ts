import { Metadata } from "next";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: { emailAddress: string }[];
  publicMetadata: { role: string };
  lastSignInAt: string;
}

export const metadata: Metadata = {
  title: "Users",
  description: "Manage your team members and their account permissions",
}; 