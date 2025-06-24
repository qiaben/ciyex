import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
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
  })[];
}

export async function GET() {
  try {
    console.log("[ADMIN_LAB_ORDERS_GET] Starting request");
    
    const { userId } = await auth();
    console.log("[ADMIN_LAB_ORDERS_GET] Auth userId:", userId);
    
    if (!userId) {
      console.log("[ADMIN_LAB_ORDERS_GET] No userId found in auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify if the user is an admin using Clerk metadata
    const user = await clerkClient.users.getUser(userId);
    console.log("[ADMIN_LAB_ORDERS_GET] User metadata:", user.publicMetadata);
    
    const role = (user.publicMetadata.role as string)?.toLowerCase();
    console.log("[ADMIN_LAB_ORDERS_GET] User role:", role);

    if (!user || role !== 'admin') {
      console.log("[ADMIN_LAB_ORDERS_GET] User is not an admin");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all orders with necessary relations
    console.log("[ADMIN_LAB_ORDERS_GET] Fetching orders from database");
    const orders = await prisma.order.findMany({
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
    }) as OrderWithRelations[];

    console.log("[ADMIN_LAB_ORDERS_GET] Found orders count:", orders.length);
    if (orders.length > 0) {
      console.log("[ADMIN_LAB_ORDERS_GET] First order items:", JSON.stringify(orders[0].orderItems, null, 2));
      console.log("[ADMIN_LAB_ORDERS_GET] First order results:", JSON.stringify(orders[0].results, null, 2));
    }

    // Transform the data to match the expected format
    console.log("[ADMIN_LAB_ORDERS_GET] Transforming orders");
    const transformedOrders = orders.map(order => {
      console.log("[ADMIN_LAB_ORDERS_GET] Processing order:", {
        id: order.id,
        orderNumber: order.orderNumber,
        itemsCount: order.orderItems.length,
        resultsCount: order.results.length
      });

      const transformedOrder = {
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        orderDate: order.orderDate.toISOString(),
        status: order.status.toLowerCase(),
        tests: order.orderItems.map(item => {
          console.log("[ADMIN_LAB_ORDERS_GET] Processing order item:", {
            id: item.id,
            testId: item.testId,
            testName: item.test.name
          });
          return {
            test: {
              id: item.test.id.toString(),
              name: item.test.name,
              description: item.test.description || '',
              code: item.testCode || '',
              price: item.test.price,
              category: item.testDescription || ''
            },
            quantity: item.quantity
          };
        }),
        results: order.results.map(result => {
          console.log("[ADMIN_LAB_ORDERS_GET] Processing test result:", {
            id: result.id,
            testId: result.testId,
            status: result.status
          });
          return {
            testId: result.test.id.toString(),
            resultValue: result.resultValue || '',
            normalRange: result.normalRange || '',
            unit: result.unit || '',
            status: (result.status || 'SCHEDULED').toLowerCase(),
            reviewed: result.reviewed || false,
            fileAttachment: result.fileAttachment
          };
        }),
        userEmail: order.patientEmail,
        userName: `${order.patientFirstName} ${order.patientLastName}`,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus?.toLowerCase(),
        paymentMethod: order.paymentMethod,
        paymentDate: order.paymentDate?.toISOString(),
        transactionId: order.transactionId
      };

      console.log("[ADMIN_LAB_ORDERS_GET] Transformed order:", {
        id: transformedOrder.id,
        orderNumber: transformedOrder.orderNumber,
        itemsCount: transformedOrder.tests.length,
        resultsCount: transformedOrder.results.length
      });

      return transformedOrder;
    });

    console.log("[ADMIN_LAB_ORDERS_GET] Final transformed orders count:", transformedOrders.length);
    return NextResponse.json(transformedOrders, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("[ADMIN_LAB_ORDERS_GET] Error details:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
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