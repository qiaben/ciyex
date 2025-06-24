import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });
    if (!notification || notification.userId !== userId) {
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