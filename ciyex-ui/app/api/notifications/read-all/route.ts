import { NextResponse } from "next/server";
import { getCurrentUserFromToken } from "@/utils/auth"; // Your JWT utility
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await getCurrentUserFromToken();
    if (!user?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        userId: String(user.userId),
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
