import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Env reads (no throwing at module load)
const PADDLE_SECRET_TOKEN = process.env.PADDLE_SECRET_TOKEN || null;
const WEBHOOK_SECRET_KEY = process.env.WEBHOOK_SECRET_KEY || null;

// Safe SDK init at module scope
const paddle = PADDLE_SECRET_TOKEN
  ? new Paddle(PADDLE_SECRET_TOKEN, { environment: Environment.sandbox })
  : null;

// Handlers
const eventHandlers: Record<string, (eventData: any) => Promise<void>> = {
  // Optional: Track transactions if you keep a separate table.
  // Otherwise, it's fine to ignore this and rely only on subscription events.
  [EventName.TransactionCompleted]: async (eventData: any) => {
    const { customData, id: transactionId, status } = eventData.data;
    if (!customData?.userId) {
      console.error("TransactionCompleted: Missing userId in customData");
      return;
    }
    // If you have a 'transactions' table, persist it here.
    // If not, you can safely ignore or just log.
    console.log("TransactionCompleted:", { transactionId, status, userId: customData.userId });
  },

  [EventName.SubscriptionActivated]: async (eventData: any) => {
    const { customData, id: subscriptionId, currentBillingPeriod } = eventData.data;

    const userId = customData?.userId;
    if (!userId) {
      console.error("SubscriptionActivated: Missing userId in customData");
      return;
    }

    await db.subscription.upsert({
      where: { paddleSubscriptionId: subscriptionId },
      update: {
        status: "ACTIVE",
        currentPeriodEnd: currentBillingPeriod?.endsAt ? new Date(currentBillingPeriod.endsAt) : null,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId,
        paddleSubscriptionId: subscriptionId,
        status: "ACTIVE",
        trialEndsAt: new Date(), // You can set this based on your plan; or omit if not needed
        currentPeriodEnd: currentBillingPeriod?.endsAt ? new Date(currentBillingPeriod.endsAt) : null,
      },
    });

    console.log(`Subscription activated for user ${userId} (sub: ${subscriptionId})`);
  },

  [EventName.SubscriptionUpdated]: async (eventData: any) => {
    const { customData, id: subscriptionId, currentBillingPeriod, scheduledChange } = eventData.data;

    if (!customData?.userId) return;

    await db.subscription.updateMany({
      where: { paddleSubscriptionId: subscriptionId },
      data: {
        currentPeriodEnd: currentBillingPeriod?.endsAt ? new Date(currentBillingPeriod.endsAt) : null,
        cancelAtPeriodEnd: scheduledChange?.action === "cancel",
      },
    });

    console.log(`Subscription updated (sub: ${subscriptionId})`);
  },

  [EventName.SubscriptionCanceled]: async (eventData: any) => {
    const { customData, id: subscriptionId } = eventData.data;
    if (!customData?.userId) return;

    await db.subscription.updateMany({
      where: { paddleSubscriptionId: subscriptionId },
      data: {
        status: "CANCELED",
        cancelAtPeriodEnd: true, // Access until current period end
      },
    });

    console.log(`Subscription canceled (sub: ${subscriptionId})`);
  },

  [EventName.SubscriptionPastDue]: async (eventData: any) => {
    const { customData, id: subscriptionId } = eventData.data;
    if (!customData?.userId) return;

    await db.subscription.updateMany({
      where: { paddleSubscriptionId: subscriptionId },
      data: { status: "EXPIRED" },
    });

    console.log(`Subscription past due (sub: ${subscriptionId})`);
  },
};

export async function POST(req: NextRequest) {
  try {
    // Runtime env validation
    if (!paddle || !WEBHOOK_SECRET_KEY) {
      console.error("Webhook misconfiguration: missing Paddle credentials");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Verify signature
    const signature = req.headers.get("paddle-signature");
    if (!signature) {
      console.error("Missing Paddle signature header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get raw body to verify
    const rawBody = await req.text();
    if (!rawBody) {
      console.error("Empty webhook body");
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // Verify webhook authenticity
    let eventData: any;
    try {
      eventData = await paddle.webhooks.unmarshal(rawBody, WEBHOOK_SECRET_KEY, signature);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (!eventData?.eventType) {
      console.error("Invalid event data structure");
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    console.log("Received webhook:", {
      eventType: eventData.eventType,
      eventId: eventData.eventId,
      timestamp: new Date().toISOString(),
    });

    // Dispatch to handler
    const handler = eventHandlers[eventData.eventType as keyof typeof eventHandlers];
    if (handler) {
      await handler(eventData);
      console.log(`Processed ${eventData.eventType}`);
    } else {
      console.log(`Unhandled event type: ${eventData.eventType}`);
    }

    // Acknowledge
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", {
      error: error?.message || "Unknown error",
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });

    // 500 triggers Paddle retry (good for transient failures)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
