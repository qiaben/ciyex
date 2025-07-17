import { Roles } from "@/types/globals";
import { getCurrentUserFromToken } from "./../app/utils/auth"; // Adjust the import path as needed

// Check if the current user has a specific role
export const checkRole = async (role: Roles): Promise<boolean> => {
    const user = await getCurrentUserFromToken();
    // Ensure role comparison is case-insensitive and check if 'roles' contains the specified role
    return user?.roles?.some((r) => r.toLowerCase() === role.toLowerCase()) || false;
};

// Get the current user's role, default to "patient" if no role exists
export const getRole = async (): Promise<string> => {
    const user = await getCurrentUserFromToken();
    // Return the first role or default to "patient"
    return user?.roles?.[0]?.toLowerCase() || "patient";
};
