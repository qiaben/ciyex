import { Roles } from "@/types/globals";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();

  return sessionClaims?.metadata?.role === role.toLowerCase();
};

export const getRole = async () => {
  const { sessionClaims } = await auth();
  if (!sessionClaims) return null;
  return sessionClaims?.metadata?.role?.toLowerCase() || "patient";
};