import { Roles } from "@/types/globals";
import { getCurrentUserFromToken } from "@/app/utils/auth";

// Type for the user object returned by getCurrentUserFromToken
type SessionUser = {
    userId: number;
    email: string;
    fullName: string;
    roles: string[];
    // ... other fields
};

/**
 * Check if the current user has a specific role (case-insensitive).
 */
export const checkRole = async (role: Roles): Promise<boolean> => {
    const user = await getCurrentUserFromToken("") as SessionUser | null;

    if (!user || !Array.isArray(user.roles)) return false;

    return user.roles.some(
        (r) => r?.toLowerCase() === role.toLowerCase()
    );
};

/**
 * Return the first role of the current user (lower-case),
 * or "patient" as a default fallback.
 */
export const getRole = async (): Promise<string> => {
    const user = await getCurrentUserFromToken("") as SessionUser | null;
    return user?.roles?.[0]?.toLowerCase() ?? "patient";
};
