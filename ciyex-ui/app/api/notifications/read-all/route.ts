import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    });

    return new NextResponse("Notifications marked as read", { status: 200 });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 