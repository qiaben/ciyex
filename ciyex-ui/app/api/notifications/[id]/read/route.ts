import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "../../../../utils/auth";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUserFromToken();
    if (!user?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });
    if (!notification || String(notification.userId) !== String(user.userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updated = await prisma.notification.update({
      where: {
        id: parseInt(id),
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
