import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const PADDLE_SECRET_TOKEN = process.env.PADDLE_SECRET_TOKEN || null;
const WEBHOOK_SECRET_KEY = process.env.WEBHOOK_SECRET_KEY || null;

const paddle = PADDLE_SECRET_TOKEN
  ? new Paddle(PADDLE_SECRET_TOKEN, { environment: Environment.sandbox })
  : null;

const eventHandlers: Record<string, (eventData: any) => Promise<void>> = {
  [EventName.SubscriptionActivated]: async (eventData: any) => {
    const { customData, id: subscriptionId, currentBillingPeriod } = eventData.data;
    const userId = customData?.userId;
    if (!userId) return;

    // ✅ Update the existing trial subscription for this user
    const existing = await db.subscription.findFirst({
      where: { userId, status: "TRIALING" },
    });

    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: {
          paddleSubscriptionId: subscriptionId,
          status: "ACTIVE",
          trialEndsAt: new Date(),
           currentPeriodStart: currentBillingPeriod?.startsAt 
            ? new Date(currentBillingPeriod.startsAt) 
            : new Date(), // fallback to now
          currentPeriodEnd: currentBillingPeriod?.endsAt
            ? new Date(currentBillingPeriod.endsAt)
            : null,
          cancelAtPeriodEnd: false,
        },
      });
    } else {
      // fallback: create if no trial record exists
      await db.subscription.create({
        data: {
          userId,
          paddleSubscriptionId: subscriptionId,
          status: "ACTIVE",
          trialEndsAt: new Date(),
          currentPeriodStart: currentBillingPeriod?.startsAt 
            ? new Date(currentBillingPeriod.startsAt) 
            : new Date(),
          currentPeriodEnd: currentBillingPeriod?.endsAt
            ? new Date(currentBillingPeriod.endsAt)
            : null,
        },
      });
    }
  },

  [EventName.SubscriptionUpdated]: async (eventData: any) => {
    const { customData, id: subscriptionId, currentBillingPeriod, scheduledChange } = eventData.data;
    const userId = customData?.userId;
    if (!userId) return;

    await db.subscription.updateMany({
      where: { paddleSubscriptionId: subscriptionId },
      data: {
        currentPeriodStart: currentBillingPeriod?.startsAt
          ? new Date(currentBillingPeriod.startsAt)
          : null, // don't overwrite if not provided
        currentPeriodEnd: currentBillingPeriod?.endsAt
          ? new Date(currentBillingPeriod.endsAt)
          : null,
        cancelAtPeriodEnd: scheduledChange?.action === "cancel",
      },
    });
  },

  [EventName.SubscriptionCanceled]: async (eventData: any) => {
    const { customData, id: subscriptionId, currentBillingPeriod } = eventData.data;
    const userId = customData?.userId;
    if (!userId) return;

    await db.subscription.updateMany({
      where: { paddleSubscriptionId: subscriptionId },
      data: { status: "CANCELED", cancelAtPeriodEnd: true,  
        currentPeriodEnd: currentBillingPeriod?.endsAt
          ? new Date(currentBillingPeriod.endsAt)
          : undefined,
         },
    });
  },

  [EventName.SubscriptionResumed]: async (eventData: any) => {
    const { customData, id: subscriptionId } = eventData.data;
    const userId = customData?.userId;
    if (!userId) return;

    // User reactivated their subscription
    await db.subscription.updateMany({
      where: { paddleSubscriptionId: subscriptionId },
      data: { 
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
      },
    });
  },
};

export async function POST(req: NextRequest) {
  try {
    if (!paddle || !WEBHOOK_SECRET_KEY) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const signature = req.headers.get("paddle-signature");
    if (!signature) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rawBody = await req.text();
    let eventData: any;
    try {
      eventData = await paddle.webhooks.unmarshal(rawBody, WEBHOOK_SECRET_KEY, signature);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventId = eventData.eventId || eventData.id || eventData.event_id;
    
    if (!eventId) {
      console.error("No event ID found in webhook payload");
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

     const alreadyProcessed = await db.webhookEvent.findUnique({
      where: { paddleEventId: eventId }
    });
    
    if (alreadyProcessed) {
      console.log(`Webhook ${eventData.eventId} already processed, skipping`);
      return NextResponse.json({ received: true });
    }

    const handler = eventHandlers[eventData.eventType as keyof typeof eventHandlers];
    if (handler) {
      try {
        await handler(eventData);
      } catch (handlerError: any) {
        console.error(`Handler failed for ${eventData.eventType}:`, {
          error: handlerError.message,
          stack: handlerError.stack,
          eventId,
        });
        // Continue to mark as processed to avoid infinite retries
      }
    }

    await db.webhookEvent.create({
      data: {
        paddleEventId: eventData.eventId,
        eventType: eventData.eventType,
        processedAt: new Date(),
        payload: JSON.stringify(eventData)
      }
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
