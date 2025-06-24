import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { Order, OrderItem, TestResult } from '@prisma/client';

interface OrderWithRelations extends Order {
  orderItems: (OrderItem & {
    test: {
      id: number;
      name: string;
      description: string | null;
      price: number;
    };
  })[];
  results: (TestResult & {
    test: {
      id: number;
      name: string;
      description: string | null;
      price: number;
    };
    result: string | null;
  })[];
}

interface FileAttachment {
  url: string;
  name: string;
}

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("[LAB_ORDERS_GET] Auth userId:", userId);
    
    if (!userId) {
      console.log("[LAB_ORDERS_GET] No userId found in auth");
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Fetch only this patient's orders with all necessary relations
    const orders = await prisma.order.findMany({
      where: { patientId: userId },
      include: {
        orderItems: {
          include: {
            test: true
          }
        },
        results: {
          include: {
            test: true
          }
        }
      },
      orderBy: { orderDate: 'desc' },
    });

    console.log("[LAB_ORDERS_GET] Found orders count:", orders.length);
    if (orders.length > 0) {
      console.log("[LAB_ORDERS_GET] First order items:", JSON.stringify(orders[0].orderItems, null, 2));
      console.log("[LAB_ORDERS_GET] First order results:", JSON.stringify(orders[0].results, null, 2));
    }

    // Transform the data to match the expected format
    const transformedOrders = orders.map(order => {
      console.log("[LAB_ORDERS_GET] Processing order:", {
        id: order.id,
        orderNumber: order.orderNumber,
        itemsCount: order.orderItems.length,
        resultsCount: order.results.length
      });

      const transformedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentDate: order.paymentDate.toISOString(),
        orderDate: order.orderDate.toISOString(),
        patientFirstName: order.patientFirstName,
        patientLastName: order.patientLastName,
        patientEmail: order.patientEmail,
        patientPhone: order.patientPhone,
        patientDob: order.patientDob.toISOString(),
        patientGender: order.patientGender,
        patientAddress: order.patientAddress,
        patientCity: order.patientCity,
        patientState: order.patientState,
        patientZipCode: order.patientZipCode,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          testId: item.testId,
          testName: item.test.name,
          testCode: null,
          testDescription: item.test.description,
          testPrice: item.price,
          test: {
            name: item.test.name,
            description: item.test.description
          }
        })),
        results: order.results.map(result => ({
          id: result.id,
          testId: result.testId,
          resultValue: result.resultValue || null,
          normalRange: result.normalRange || null,
          unit: result.unit || null,
          status: result.status,
          reviewed: result.reviewed,
          test: {
            name: result.test.name,
            description: result.test.description
          },
          fileAttachment: result.fileAttachment ? (result.fileAttachment as unknown as FileAttachment) : null
        }))
      };

      console.log("[LAB_ORDERS_GET] Transformed order:", {
        id: transformedOrder.id,
        orderNumber: transformedOrder.orderNumber,
        itemsCount: transformedOrder.orderItems.length,
        resultsCount: transformedOrder.results.length
      });

      return transformedOrder;
    });

    console.log("[LAB_ORDERS_GET] Final transformed orders count:", transformedOrders.length);
    return NextResponse.json(transformedOrders, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("[LAB_ORDERS_GET] Error details:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    console.error('No user ID found in auth');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('Received lab order request:', {
      userId: clerkUserId,
      body: {
        ...body,
        tests: body.tests?.map((test: any) => ({
          id: test.test.id,
          name: test.test.name,
          quantity: test.quantity
        }))
      }
    });

    const {
      patientInfo,
      tests,
      totalAmount,
      paymentMethod,
      transactionId
    } = body;

    if (!patientInfo) {
      console.error('Missing patientInfo in request');
      return NextResponse.json({ error: 'Missing patientInfo' }, { status: 400 });
    }

    // Log test IDs for debugging
    console.log('Test IDs:', tests.map((test: any) => test.test.id));

    // Verify test IDs exist
    const testIds = tests.map((test: any) => parseInt(test.test.id));
    const existingTests = await prisma.labTest.findMany({
      where: {
        id: {
          in: testIds
        }
      }
    });

    console.log('Existing tests:', existingTests);
    console.log('Test IDs being checked:', testIds);

    if (existingTests.length !== testIds.length) {
      const missingTestIds = testIds.filter(
        (id: number) => !existingTests.some(test => test.id === id)
      );
      console.error('Missing test IDs:', missingTestIds);
      return NextResponse.json(
        { 
          error: 'One or more test IDs are invalid',
          missingTestIds 
        },
        { status: 400 }
      );
    }

    // Generate a unique order number
    const orderNumber = `LAB-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log('Creating order with details:', {
      orderNumber,
      patientId: clerkUserId,
      testCount: tests.length,
      totalAmount
    });

    // Create the order with its items and patient info
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'SCHEDULED',
        totalAmount,
        paymentStatus: 'PAID',
        paymentMethod: "CARD",
        paymentDate: new Date(),
        transactionId,
        patientId: clerkUserId,
        patientFirstName: patientInfo.firstName,
        patientLastName: patientInfo.lastName,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        patientDob: new Date(patientInfo.dob),
        patientGender: patientInfo.gender.toUpperCase(),
        patientAddress: patientInfo.address,
        patientCity: patientInfo.city,
        patientState: patientInfo.state,
        patientZipCode: patientInfo.zipCode,
        orderItems: {
          create: tests.map((test: any) => ({
            testId: parseInt(test.test.id),
            quantity: test.quantity,
            price: test.test.price,
            testName: test.test.name,
            testCode: test.test.code || '',
            testDescription: test.test.description || '',
            testPrice: test.test.price
          }))
        },
        results: {
          create: tests.map((test: any) => ({
            testId: parseInt(test.test.id),
            status: 'SCHEDULED'
          }))
        }
      },
      include: {
        orderItems: true,
        results: true
      }
    });

    console.log('Order created successfully:', {
      id: order.id,
      orderNumber: order.orderNumber,
      itemsCount: order.orderItems.length,
      resultsCount: order.results.length
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating lab order:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to create lab order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 