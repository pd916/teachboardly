import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";

// Validate environment variables at startup
const PADDLE_SECRET_TOKEN = process.env.PADDLE_SECRET_TOKEN;
if (!PADDLE_SECRET_TOKEN) {
  throw new Error("PADDLE_SECRET_TOKEN environment variable is required");
}

// Init Paddle SDK
const paddle = new Paddle(PADDLE_SECRET_TOKEN, {
  environment: Environment.sandbox, // Keep sandbox until production
});

// Replace with your real Paddle Price ID from dashboard
const PREMIUM_PLAN_PRICE_ID = process.env.PADDLE_PREMIUM_PLAN_PRICE_ID || "pri_123456789";

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const self = await getSelf();
    if (!self?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check for existing active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: self.id,
        status: { in: ["ACTIVE"] },
      },
      select: { id: true, status: true, paddleSubscriptionId: true },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Create transaction with Paddle
    const transactionData = {
      items: [
        {
          quantity: 1,
          priceId: PREMIUM_PLAN_PRICE_ID, // ✅ use priceId instead of full object
        },
      ],
      customData: {
        userId: self.id,
        planType: "premium",
        createdAt: new Date().toISOString(),
      },
      customer: {
        email: self.email || undefined,
      },
      // ✅ removed billingDetails (not needed for basic subscription checkout)
    };

    const transaction = await paddle.transactions.create(transactionData);

    if (!transaction?.id) {
      throw new Error("Failed to create transaction with Paddle");
    }

    // Store pending transaction in DB
    await db.subscription.create({
      data: {
        userId: self.id,
        paddleSubscriptionId: transaction.id,
        status: "TRIALING", // Updated by webhook later
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return NextResponse.json({ transactionId: transaction.id });
  } catch (error) {
    console.error("Payment route error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Unable to process payment. Please try again later." },
      { status: 500 }
    );
  }
}
