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
    // 🔐 Verify cron request
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRONJOB_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // ⏳ PLAN DURATION (CHANGE IF NEEDED)
    const PLAN_DURATION_DAYS = 30;

    const expiryDate = new Date(
      now.getTime() - PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000
    );

    // 🔍 Find expired subscriptions
    const expiredSubs = await db.subscription.findMany({
      where: {
        status: "SUCCEEDED",
        createdAt: {
          lt: expiryDate,
        },
      },
      select: {
        id: true,
        userId: true,
        createdAt: true,
      },
    });

    if (expiredSubs.length === 0) {
      console.log("[CRON] No subscriptions to expire");
      return NextResponse.json({
        success: true,
        expired: 0,
      });
    }

    // 🔄 Expire them
    await db.subscription.updateMany({
      where: {
        id: {
          in: expiredSubs.map((s) => s.id),
        },
      },
      data: {
        status: "FAILED",
        updatedAt: now,
      },
    });

    console.log(`[CRON] Expired ${expiredSubs.length} subscriptions`);

    return NextResponse.json({
      success: true,
      expired: expiredSubs.length,
      users: expiredSubs.map((s) => ({
        userId: s.userId,
        expiredAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("[CRON] Error expiring subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional POST for testing
export async function POST(req: NextRequest) {
  return GET(req);
}