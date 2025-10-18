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

    if (!userId || !subscriptionId) {
      throw new Error(`Missing required fields: userId=${userId}, subId=${subscriptionId}`);
    }

    await db.$transaction(async (tx) => {
      const existing = await tx.subscription.findUnique({
        where: { userId },
      });

      const data = {
        paddleSubscriptionId: subscriptionId,
        status: "ACTIVE" as const,
        trialEndsAt: new Date(),
        currentPeriodStart: currentBillingPeriod?.startsAt 
          ? new Date(currentBillingPeriod.startsAt) 
          : new Date(),
        currentPeriodEnd: currentBillingPeriod?.endsAt
          ? new Date(currentBillingPeriod.endsAt)
          : null,
        cancelAtPeriodEnd: false,
      };

      if (existing) {
        await tx.subscription.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await tx.subscription.create({
          data: {
            user: { connect: { id: userId } }, // ✅ connect relation instead of userId
            ...data,
          },
        });
      }
    });
  },

  [EventName.SubscriptionUpdated]: async (eventData: any) => {
    const { id: subscriptionId, currentBillingPeriod, scheduledChange } = eventData.data;

    if (!subscriptionId) {
      throw new Error(`Missing subscriptionId`);
    }

    const data: any = {};
    
    if (currentBillingPeriod?.startsAt) {
      data.currentPeriodStart = new Date(currentBillingPeriod.startsAt);
    }
    if (currentBillingPeriod?.endsAt) {
      data.currentPeriodEnd = new Date(currentBillingPeriod.endsAt);
    }
    if (scheduledChange) {
      data.cancelAtPeriodEnd = scheduledChange.action === "cancel";
    }

    if (Object.keys(data).length > 0) {
      await db.subscription.updateMany({
        where: { paddleSubscriptionId: subscriptionId },
        data,
      });
    }
  },

  [EventName.SubscriptionCanceled]: async (eventData: any) => {
    const { id: subscriptionId, currentBillingPeriod } = eventData.data;

    if (!subscriptionId) {
      throw new Error(`Missing subscriptionId`);
    }

    await db.subscription.updateMany({
      where: { paddleSubscriptionId: subscriptionId },
      data: {
        status: "CANCELED",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: currentBillingPeriod?.endsAt
          ? new Date(currentBillingPeriod.endsAt)
          : undefined,
      },
    });
  },


  [EventName.SubscriptionResumed]: async (eventData: any) => {
    const { id: subscriptionId, currentBillingPeriod } = eventData.data;

    if (!subscriptionId) {
      throw new Error(`Missing subscriptionId`);
    }

    await db.subscription.updateMany({
      where: { paddleSubscriptionId: subscriptionId },
      data: {
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
        currentPeriodStart: currentBillingPeriod?.startsAt
          ? new Date(currentBillingPeriod.startsAt)
          : undefined,
        currentPeriodEnd: currentBillingPeriod?.endsAt
          ? new Date(currentBillingPeriod.endsAt)
          : undefined,
      },
    });
  },

   [EventName.SubscriptionPastDue]: async (eventData: any) => {
    const { id: subscriptionId } = eventData.data;

    if (!subscriptionId) {
      throw new Error(`Missing subscriptionId`);
    }

    const subscription = await db.subscription.findFirst({
      where: { paddleSubscriptionId: subscriptionId }
    });

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: subscription.cancelAtPeriodEnd ? "EXPIRED" : "PAST_DUE",
        },
      });
    }
  },
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Verify signature
    const signature = req.headers.get("paddle-signature");
    if (!signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.text();
    let eventData: any;

    try {
      eventData = paddle?.webhooks.unmarshal(rawBody, WEBHOOK_SECRET_KEY!, signature);
    } catch (err: any) {
      console.error("Signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventId = eventData.eventId;
    if (!eventId) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    // 2. Check idempotency
    const existing = await db.webhookEvent.findUnique({
      where: { paddleEventId: eventId }
    });

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // 3. Process event
    const handler = eventHandlers[eventData.eventType];
    let error: string | null = null;

    if (handler) {
      try {
        await handler(eventData);
      } catch (err: any) {
        error = err.message;
        console.error(`Handler failed [${eventData.eventType}]:`, {
          eventId,
          error: err.message,
          stack: err.stack,
        });

        // Return 500 for critical events to trigger retry
        const critical = [
          EventName.SubscriptionActivated,
          EventName.SubscriptionCanceled,
          EventName.SubscriptionResumed,
        ];

        if (critical.includes(eventData.eventType)) {
          return NextResponse.json({ error: "Processing failed" }, { status: 500 });
        }
      }
    }

    // 4. Mark as processed
    await db.webhookEvent.create({
      data: {
        paddleEventId: eventId,
        eventType: eventData.eventType,
        payload: JSON.stringify(eventData),
        processedAt: new Date(),
      },
    });

    console.log(`Webhook processed [${eventData.eventType}] in ${Date.now() - startTime}ms`);

    return NextResponse.json({ 
      received: true,
      eventType: eventData.eventType,
      success: !error,
    });

  } catch (err: any) {
    console.error("Webhook error:", err.message, err.stack);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
