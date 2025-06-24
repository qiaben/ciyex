import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage your team members and their account permissions",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 