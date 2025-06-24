import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const MINIMUM_AMOUNT = 50; // 50 cents in USD

// Validate Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not defined in environment variables");
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

// Log Stripe key details (safely)
const stripeKey = process.env.STRIPE_SECRET_KEY;
console.log("Stripe key details:", {
  prefix: stripeKey.substring(0, 7),
  length: stripeKey.length,
  isLive: stripeKey.startsWith('sk_live_'),
  isTest: stripeKey.startsWith('sk_test_'),
  environment: process.env.NODE_ENV
});

// Initialize Stripe with error handling
let stripe: Stripe;
try {
  stripe = new Stripe(stripeKey, {
    apiVersion: "2025-05-28.basil",
    typescript: true,
  });
  console.log("Stripe initialized successfully");
} catch (error) {
  console.error("Failed to initialize Stripe:", error);
  throw new Error("Failed to initialize Stripe client");
}

export async function POST(request: NextRequest) {
  try {
    // Log request details
    console.log("Payment intent request received:", {
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      method: request.method
    });

    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      console.error("No user ID found in request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("User authenticated:", { userId });

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", body);
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { amount, currency = "usd" } = body;
    console.log("Payment intent parameters:", { 
      amount, 
      currency, 
      userId,
      environment: process.env.NODE_ENV,
      stripeMode: stripeKey.startsWith('sk_live_') ? 'live' : 'test'
    });

    // Validate amount
    if (!amount || typeof amount !== 'number') {
      console.error("Invalid amount:", amount);
      return NextResponse.json(
        { error: "Amount is required and must be a number" },
        { status: 400 }
      );
    }

    if (amount < MINIMUM_AMOUNT) {
      console.error("Amount too small:", amount);
      return NextResponse.json(
        { error: `Amount must be at least ${MINIMUM_AMOUNT / 100} ${currency.toUpperCase()}` },
        { status: 400 }
      );
    }

    try {
      // Add metadata to track the user and environment
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: userId,
          environment: process.env.NODE_ENV,
          mode: stripeKey.startsWith('sk_live_') ? 'live' : 'test'
        },
        // Add receipt email if available
        receipt_email: request.headers.get('x-user-email') || undefined,
      });

      console.log("Payment intent created successfully:", {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret?.substring(0, 10) + '...'
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (stripeError: any) {
      console.error("Stripe API Error:", {
        type: stripeError.type,
        message: stripeError.message,
        code: stripeError.code,
        stack: stripeError.stack,
        raw: stripeError.raw,
        requestId: stripeError.requestId,
        statusCode: stripeError.statusCode
      });

      // Handle specific Stripe errors
      if (stripeError.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { error: stripeError.message },
          { status: 400 }
        );
      }

      if (stripeError.type === 'StripeAuthenticationError') {
        return NextResponse.json(
          { error: "Payment service authentication failed" },
          { status: 500 }
        );
      }

      if (stripeError.type === 'StripePermissionError') {
        return NextResponse.json(
          { error: "Payment service permission denied" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Payment service error" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code
    });

    // Handle authentication errors
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
