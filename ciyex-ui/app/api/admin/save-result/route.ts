import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      orderId,
      testId,
      resultValue,
      normalRange,
      unit,
      status,
      fileAttachment
    } = data;

    // Find existing test result
    const existingResult = await prisma.testResult.findFirst({
      where: {
        orderId: Number(orderId),
        testId: Number(testId)
      }
    });

    // If there's no new file attachment but there's an existing one, keep the existing one
    const fileAttachmentData = fileAttachment ? {
      name: fileAttachment.name,
      type: 'application/pdf',
      url: `${fileAttachment.key}`,
      key: fileAttachment.key
    } : existingResult?.fileAttachment as any || undefined;

    // Update or create the test result
    const result = existingResult
      ? await prisma.testResult.update({
          where: { id: existingResult.id },
          data: {
            resultValue: resultValue,
            status: "COMPLETED",
            fileAttachment: fileAttachmentData
          }
        })
      : await prisma.testResult.create({
          data: {
            orderId: parseInt(orderId),
            testId: parseInt(testId),
            resultValue: resultValue,
            status: "COMPLETED",
            fileAttachment: fileAttachmentData
          }
        });

    // Check if all test results for the order are now completed
    const allResults = await prisma.testResult.findMany({
      where: { orderId: Number(orderId) }
    });
    const allCompleted = allResults.length > 0 && allResults.every(r => r.status && r.status.toUpperCase() === 'COMPLETED');
    if (allCompleted) {
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status: 'COMPLETED' }
      });
    }

    // Create notification for patient if result is marked as COMPLETED
    if (status && status.toUpperCase() === 'COMPLETED') {
      const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
      if (order) {
        await prisma.notification.create({
          data: {
            userId: order.patientId,
            orderId: Number(orderId),
            testId: Number(testId),
            message: `Order #${order.orderNumber} - Test report available`,
          }
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving result:', error);
    return NextResponse.json(
      { error: 'Failed to save result' },
      { status: 500 }
    );
  }
} 