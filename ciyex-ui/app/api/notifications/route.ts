import { NextResponse } from 'next/server';
import { getCurrentUserFromToken } from "../../utils/auth";  // Custom JWT-based auth
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const user = await getCurrentUserFromToken();  // Use your custom auth method
        if (!user?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: String(user.userId),  // Convert userId to string if Prisma expects a string
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // Limit to last 50 notifications
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUserFromToken();  // Use your custom auth method
        if (!user?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, type, userId: targetUserId, orderId } = body;

        const notification = await prisma.notification.create({
            data: {
                message,
                userId: targetUserId,
                orderId,
                read: false,
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getCurrentUserFromToken();  // Use your custom auth method
        if (!user?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await req.json();

        // Verify the notification belongs to the user
        const notification = await prisma.notification.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!notification || String(notification.userId) !== String(user.userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.notification.update({
            where: { id },
            data: { read: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
