import { Roles } from "@/types/globals";
import { getCurrentUserFromToken } from "@/utils/auth";

// Check if the current user has a specific role
export const checkRole = async (role: Roles) => {
  const user = await getCurrentUserFromToken();
  // Ensure role comparison is case-insensitive
  return user?.role?.toLowerCase() === role.toLowerCase();
};

// Get the current user's role, default to "patient"
export const getRole = async () => {
  const user = await getCurrentUserFromToken();
  return user?.role?.toLowerCase() || "patient";
};
