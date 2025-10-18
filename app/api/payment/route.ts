import { NextRequest, NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import type { CreateTransactionRequestBody } from "@paddle/paddle-node-sdk";

// Env reads (no throwing at module load)
const PADDLE_SECRET_TOKEN = process.env.PADDLE_SECRET_TOKEN || null;
const PREMIUM_PLAN_PRICE_ID = process.env.PADDLE_PREMIUM_PRICE_ID || null;

// Safe SDK init at module scope
const paddle = PADDLE_SECRET_TOKEN
  ? new Paddle(PADDLE_SECRET_TOKEN, { environment: Environment.sandbox })
  : null;

export async function POST(req: NextRequest) {
  try {
    // Auth
    const self = await getSelf();
    if (!self?.id || !self?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Runtime env validation
    if (!PADDLE_SECRET_TOKEN || !paddle) {
      console.error("Missing PADDLE_SECRET_TOKEN");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    if (!PREMIUM_PLAN_PRICE_ID) {
      console.error("Missing PADDLE_PREMIUM_PRICE_ID");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Prevent duplicate active subscription
    const existingSubscription = await db.subscription.findUnique({
      where: {
        userId: self.id,
      },
    });

    if (existingSubscription?.status === 'ACTIVE') {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }


     if (existingSubscription?.status === 'CANCELED' &&
      existingSubscription?.paddleSubscriptionId &&
      existingSubscription?.currentPeriodEnd &&
      existingSubscription.currentPeriodEnd > new Date()) {
      try {
        await paddle.subscriptions.resume(existingSubscription?.paddleSubscriptionId, {
          effectiveFrom: 'immediately'
        });

        await db.subscription.update({
          where: {userId: self.id },
          data: {
            status: 'ACTIVE',
            cancelAtPeriodEnd: false
          }
        });

        return NextResponse.json({
          resumed: true,
          message: "Your subscription has been reactivated"
        });
      } catch (resumeError: any) {
        console.error("Failed to resume subscription:", resumeError);
        // Fall through to create new transaction
      }
    }

    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentAttempts = await db.paymentAttempt.count({
      where: {
        userId: self.id,
        createdAt: { gte: oneMinuteAgo }
      }
    });

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait a minute." }, 
        { status: 429 }
      );
    }

    await db.paymentAttempt.create({
      data: {
        userId: self.id,
        createdAt: new Date()
      }
    });

    // Create Paddle transaction (catalog price by priceId)
    const transactionData = {
      items: [
        {
          priceId: PREMIUM_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      customData: {
        userId: self.id,
        planType: "premium",
        createdAt: new Date().toISOString(),
      },
      // put email at top-level as customer_email (or remove if your SDK expects a different shape)
      customer_email: self.email ?? undefined,
    } as any;

    const transaction = await paddle.transactions.create(transactionData);

    if (!transaction?.id) {
      throw new Error("No transaction ID returned by Paddle");
    }

    // IMPORTANT:
    // Do NOT create a 'subscription' record here.
    // Wait for Paddle's webhooks (SubscriptionActivated, etc.) to create/update it.
    // This ensures abandoned checkouts don't pollute your DB and IDs match reality.

    return NextResponse.json({
      transactionId: transaction.id,
      // You can forward any other fields your client needs (e.g., hosted checkout URL if available)
      // checkoutUrl: transaction?.checkout?.url ?? undefined,
    });
  } catch (error: any) {
    console.error("Payment route error:", {
      error: error?.message || "Unknown error",
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Unable to process payment. Please try again later." },
      { status: 500 }
    );
  }
}
