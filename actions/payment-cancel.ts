"use server";

import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";

const PADDLE_SECRET_TOKEN = process.env.PADDLE_SECRET_TOKEN || null;

const paddle = PADDLE_SECRET_TOKEN
  ? new Paddle(PADDLE_SECRET_TOKEN, { environment: Environment.sandbox })
  : null;

/**
 * Cancel subscription at end of current billing period
 */
export async function cancelSubscription() {
  try {
    const self = await getSelf();
    if (!self?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (!paddle) {
      return { success: false, error: "Payment system not configured" };
    }

    const subscription = await db.subscription.findFirst({
      where: {
        userId: self.id,
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
      },
    });

    if (!subscription?.paddleSubscriptionId) {
      return { success: false, error: "No active subscription found" };
    }

    await paddle.subscriptions.cancel(subscription.paddleSubscriptionId, {
      effectiveFrom: "next_billing_period",
    });

    await db.subscription.update({
      where: { id: subscription.id },
      data: { 
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/");
    
    return {
      success: true,
      message: "Subscription will cancel at the end of your billing period. You'll keep access until then.",
    };
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return {
      success: false,
      error: error?.message || "Failed to cancel subscription",
    };
  }
}

/**
 * Reactivate subscription by removing scheduled cancellation
 */
export async function reactivateSubscription() {
  try {
    const self = await getSelf();
    if (!self?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (!paddle) {
      return { success: false, error: "Payment system not configured" };
    }

    const subscription = await db.subscription.findFirst({
      where: {
        userId: self.id,
        status: "ACTIVE",
        cancelAtPeriodEnd: true,
      },
    });

    if (!subscription?.paddleSubscriptionId) {
      return { success: false, error: "No subscription to reactivate" };
    }

    if (subscription.currentPeriodEnd && new Date() > new Date(subscription.currentPeriodEnd)) {
      return { 
        success: false, 
        error: "Subscription has already expired. Please purchase a new subscription." 
      };
    }

    // Get current subscription from Paddle
    const paddleSub = await paddle.subscriptions.get(subscription.paddleSubscriptionId);
    
    // Update with items array containing the current price
    await paddle.subscriptions.update(subscription.paddleSubscriptionId, {
      items: [
        {
          priceId: paddleSub.items[0].price.id,
          quantity: 1,
        }
      ],
    });

    await db.subscription.update({
      where: { id: subscription.id },
      data: { 
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/");
    
    return {
      success: true,
      message: "Subscription reactivated! It will continue to auto-renew.",
    };
  } catch (error: any) {
    console.error("Reactivate subscription error:", error);
    return {
      success: false,
      error: error?.message || "Failed to reactivate subscription",
    };
  }
}