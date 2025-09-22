import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Validate environment variables
const PADDLE_SECRET_TOKEN = process.env.PADDLE_SECRET_TOKEN;
const WEBHOOK_SECRET_KEY = process.env.WEBHOOK_SECRET_KEY;

if (!PADDLE_SECRET_TOKEN || !WEBHOOK_SECRET_KEY) {
  throw new Error('Missing required Paddle environment variables');
}

const paddle = new Paddle(PADDLE_SECRET_TOKEN, {
  environment: Environment.sandbox // Always sandbox for now
});

// Webhook event handlers
const eventHandlers = {
  [EventName.TransactionCompleted]: async (eventData: any) => {
    const { customData, id: transactionId, status } = eventData.data;
    
    if (status !== 'completed') return;
    
    const userId = customData?.userId;
    if (!userId) {
      console.error('No userId in transaction custom data');
      return;
    }

    try {
      // Update subscription to ACTIVE
      await db.subscription.updateMany({
        where: {
          userId,
          paddleSubscriptionId: transactionId
        },
        data: {
          status: 'ACTIVE',
          currentPeriodEnd: new Date(eventData.data.billedAt || Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });

      console.log(`Transaction completed for user ${userId}`);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error; // Re-throw to trigger webhook retry
    }
  },

  [EventName.SubscriptionActivated]: async (eventData: any) => {
    const { customData, id: subscriptionId, currentBillingPeriod } = eventData.data;
    
    const userId = customData?.userId;
    if (!userId) {
      console.error('No userId in subscription custom data');
      return;
    }

    try {
      await db.subscription.upsert({
  where: {
    paddleSubscriptionId: subscriptionId
  },
  update: {
    status: 'ACTIVE',
    currentPeriodEnd: new Date(currentBillingPeriod?.endsAt),
    cancelAtPeriodEnd: false,
  },
  create: {
    userId,
    paddleSubscriptionId: subscriptionId,
    status: 'ACTIVE',
    trialEndsAt: new Date(),
    currentPeriodEnd: new Date(currentBillingPeriod?.endsAt),
  }
});

      console.log(`Subscription activated for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription activation:', error);
      throw error;
    }
  },

  [EventName.SubscriptionUpdated]: async (eventData: any) => {
    const { customData, id: subscriptionId, currentBillingPeriod, scheduledChange } = eventData.data;
    
    const userId = customData?.userId;
    if (!userId) return;

    try {
      await db.subscription.updateMany({
        where: {
          paddleSubscriptionId: subscriptionId
        },
        data: {
          currentPeriodEnd: new Date(currentBillingPeriod?.endsAt),
          cancelAtPeriodEnd: scheduledChange?.action === 'cancel',
        }
      });

      console.log(`Subscription updated for user ${userId}`);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  [EventName.SubscriptionCanceled]: async (eventData: any) => {
    const { customData, id: subscriptionId, canceledAt } = eventData.data;
    
    const userId = customData?.userId;
    if (!userId) return;

    try {
      await db.subscription.updateMany({
        where: {
          paddleSubscriptionId: subscriptionId
        },
        data: {
          status: 'CANCELED',
          // Keep access until current period ends
          cancelAtPeriodEnd: true,
        }
      });

      console.log(`Subscription canceled for user ${userId}`);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  [EventName.SubscriptionPastDue]: async (eventData: any) => {
    const { customData, id: subscriptionId } = eventData.data;
    
    const userId = customData?.userId;
    if (!userId) return;

    try {
      await db.subscription.updateMany({
        where: {
          paddleSubscriptionId: subscriptionId
        },
        data: {
          status: 'EXPIRED',
        }
      });

      console.log(`Subscription expired for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription expiry:', error);
      throw error;
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    // Security: Verify webhook signature
    const signature = req.headers.get('paddle-signature');
    if (!signature) {
      console.error('Missing Paddle signature header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    if (!rawBody) {
      console.error('Empty webhook body');
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    // Verify webhook authenticity
    let eventData;
    try {
      eventData = await paddle.webhooks.unmarshal(rawBody, WEBHOOK_SECRET_KEY!, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (!eventData?.eventType) {
      console.error('Invalid event data structure');
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    // Log webhook event for debugging
    console.log('Received webhook:', {
      eventType: eventData.eventType,
      eventId: eventData.eventId,
      timestamp: new Date().toISOString(),
    });

    // Handle the event
    const handler = eventHandlers[eventData.eventType as keyof typeof eventHandlers];
    
    if (handler) {
      await handler(eventData);
      console.log(`Successfully processed ${eventData.eventType} event`);
    } else {
      console.log(`Unhandled event type: ${eventData.eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return 500 to trigger Paddle's retry mechanism
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}