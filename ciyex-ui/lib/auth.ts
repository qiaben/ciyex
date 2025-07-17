import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromToken } from "./../app/utils/auth"; // Adjust the import path as needed

export async function getUserId(req: NextRequest): Promise<string | null> {
    const user = await extractUser(req);
    return user?.userId?.toString() ?? null;
}

export async function requireAuth(req: NextRequest): Promise<string | NextResponse> {
    const user = await extractUser(req);
    if (!user?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return user.userId.toString();
}

export type CurrentUser = {
    id: string;
    role: string;
};

export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
    const user = await extractUser(req);
    if (!user?.userId) return null;
    // Always use lower case for role, fallback to 'patient'
    const role = (user.roles?.[0] || 'patient').toLowerCase();
    return { id: user.userId.toString(), role };
}

/**
 * Helper to extract user from JWT (Authorization header or cookie)
 */
async function extractUser(req: NextRequest) {
    let jwtToken: string | undefined;
    // Look for Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        jwtToken = authHeader.substring(7);
    } else if (req.cookies.get('jwt')) {
        jwtToken = req.cookies.get('jwt')?.value;
    }
    if (!jwtToken) return null;
    return await getCurrentUserFromToken();
}
