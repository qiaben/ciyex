// app/utils/auth.ts

import jwt from "jsonwebtoken";

// JWT_SECRET now holds the TOKEN (not the signing secret!)
const TOKEN = process.env.JWT_SECRET || "";

export interface SessionUser {
    userId: number;
    email: string;
    fullName: string;
    orgIds: number[];
    orgs: {
        orgId: number;
        orgName: string;
        facilities: {
            facilityId: number;
            facilityName: string;
            roles: string[];
        }[];
    }[];
    facilityIds: number[];
    roles: string[]; // Flattened list of all roles
    status?: string; // <-- Add this line
}

export async function getCurrentUserFromToken(jwtToken: string): Promise<SessionUser | null> {
    const token = TOKEN;
    if (!token) return null;

    try {
        // Use jwt.decode, since you likely don't have the signing secret
        const decoded: any = jwt.decode(token);

        if (!decoded) return null;

        // Flatten all roles from all orgs/facilities
        const roles = decoded.orgs
            ?.flatMap((org: any) => org.facilities.flatMap((f: any) => f.roles))
            ?.filter((v: any, i: number, a: any[]) => a.indexOf(v) === i) || [];

        return {
            userId: decoded.userId,
            email: decoded.email,
            fullName: decoded.fullName,
            orgIds: decoded.orgIds,
            orgs: decoded.orgs,
            facilityIds: decoded.facilityIds,
            roles,
        };
    } catch (err) {
        console.error("JWT decode failed:", err);
        return null;
    }
}
