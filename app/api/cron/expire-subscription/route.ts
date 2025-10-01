// app/api/cron/expire-subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Cron job to expire subscriptions that have passed their end date
 * Run every hour: 0 * * * *
 * 
 * This is a SAFETY NET - Paddle webhooks are primary source of truth
 * This catches any edge cases where webhooks are delayed
 */
export async function GET(req: NextRequest) {
  try {
    // CRITICAL: Verify this is actually a cron request
    const authHeader = req.headers.get("authorization");
    
    // Option 1: Vercel Cron (free on Vercel)
    if (authHeader !== `Bearer ${process.env.CRONJOB_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find subscriptions that should be expired
    const expiredSubs = await db.subscription.findMany({
      where: {
        status: "ACTIVE",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: {
          lt: now, // Less than now = expired
        },
      },
      select: {
        id: true,
        userId: true,
        paddleSubscriptionId: true,
        currentPeriodEnd: true,
      },
    });

    if (expiredSubs.length === 0) {
      console.log("[CRON] No subscriptions to expire");
      return NextResponse.json({ 
        success: true, 
        expired: 0 
      });
    }

    // Batch update all expired subscriptions
    await db.subscription.updateMany({
      where: {
        id: {
          in: expiredSubs.map(sub => sub.id),
        },
      },
      data: {
        status: "CANCELED",
        updatedAt: now,
      },
    });

    console.log(`[CRON] Expired ${expiredSubs.length} subscriptions:`, {
      subscriptionIds: expiredSubs.map(s => s.paddleSubscriptionId),
      timestamp: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      expired: expiredSubs.length,
      subscriptions: expiredSubs.map(s => ({
        userId: s.userId,
        expiredAt: s.currentPeriodEnd,
      })),
    });

  } catch (error: any) {
    console.error("[CRON] Subscription expiration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add POST method for manual trigger during testing
export async function POST(req: NextRequest) {
  // Same logic as GET - useful for testing
  return GET(req);
}