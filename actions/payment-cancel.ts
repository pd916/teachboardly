"use server";

import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { revalidatePath } from "next/cache";

const PADDLE_SECRET_TOKEN = process.env.PADDLE_SECRET_TOKEN || null;

const paddle = PADDLE_SECRET_TOKEN
  ? new Paddle(PADDLE_SECRET_TOKEN, { environment: Environment.sandbox })
  : null;

export async function cancelSubscription() {
  try {
    // 1. Authenticate user
    const self = await getSelf();
    
    if (!self?.id) {
      return { 
        success: false, 
        error: "Authentication required" 
      };
    }

    // 2. Check if Paddle is configured
    if (!paddle || !PADDLE_SECRET_TOKEN) {
      console.error("Paddle not configured");
      return { 
        success: false, 
        error: "Server misconfiguration" 
      };
    }

    // 3. Get user's active subscription
    const subscription = await db.subscription.findFirst({
      where: { 
        userId: self.id,
        status: { in: ["ACTIVE"] }
      }
    });

    if (!subscription) {
      return { 
        success: false, 
        error: "No active subscription found" 
      };
    }

    if (!subscription.paddleSubscriptionId) {
      return { 
        success: false, 
        error: "Invalid subscription data" 
      };
    }

    // 4. Check if already set to cancel
    if (subscription.cancelAtPeriodEnd) {
      return { 
        success: false, 
        error: "Subscription is already set to cancel" 
      };
    }

    // 5. Cancel subscription with Paddle (cancel at period end)
    await paddle.subscriptions.cancel(subscription.paddleSubscriptionId, {
      effectiveFrom: "next_billing_period" // This cancels at period end, not immediately
    });

    // 6. Update local database
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      },
    });

    // 7. Revalidate the page to show updated UI
    revalidatePath("/dashboard/billing"); // adjust path as needed

    return { 
      success: true,
      message: "Subscription will be canceled at the end of the billing period. You'll keep access until then."
    };

  } catch (error: any) {
    console.error("Error canceling subscription:", {
      error: error?.message || "Unknown error",
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });

    return { 
      success: false, 
      error: error?.message || "Failed to cancel subscription. Please try again." 
    };
  }
}

export async function reactivateSubscription() {
  try {
    // 1. Authenticate user
    const self = await getSelf();
    
    if (!self?.id) {
      return { 
        success: false, 
        error: "Authentication required" 
      };
    }

    // 2. Check if Paddle is configured
    if (!paddle || !PADDLE_SECRET_TOKEN) {
      console.error("Paddle not configured");
      return { 
        success: false, 
        error: "Server misconfiguration" 
      };
    }

    // 3. Get user's subscription
    const subscription = await db.subscription.findFirst({
      where: { 
        userId: self.id,
        status: { in: ["ACTIVE", "CANCELED"] },
        cancelAtPeriodEnd: true
      }
    });

    if (!subscription) {
      return { 
        success: false, 
        error: "No canceling subscription found" 
      };
    }

    if (!subscription.paddleSubscriptionId) {
      return { 
        success: false, 
        error: "Invalid subscription data" 
      };
    }

    // 4. Resume subscription with Paddle
    await paddle.subscriptions.resume(subscription.paddleSubscriptionId, {
      effectiveFrom: "immediately"
    });

    // 5. Update local database
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
    });

    // 6. Revalidate the page
    revalidatePath("/dashboard/billing"); // adjust path as needed

    return { 
      success: true,
      message: "Subscription reactivated successfully. It will continue after the current period."
    };

  } catch (error: any) {
    console.error("Error reactivating subscription:", {
      error: error?.message || "Unknown error",
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });

    return { 
      success: false, 
      error: error?.message || "Failed to reactivate subscription. Please try again." 
    };
  }
}