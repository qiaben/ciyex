import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        patientId: clerkUserId,
      },
      include: {
        orderItems: {
          include: {
            test: true,
          },
        },
        results: {
          include: {
            test: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Map results to ensure fileAttachment is always present in the response
    const mappedOrder = {
      ...order,
      results: order.results.map(result => ({
        ...result,
        fileAttachment: result.fileAttachment || null,
      })),
    };

    return NextResponse.json(mappedOrder);
  } catch (error) {
    console.error('Error fetching lab order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab order' },
      { status: 500 }
    );
  }
} 