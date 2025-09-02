import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import {Environment, Paddle} from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
    environment: Environment.sandbox
});

export async function POST(req: Request) {
  try {
    const self = await getSelf();
    if (!self) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: self.id,
        status: { in: ["ACTIVE", "TRIALING"] }
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      );
    }

    const txn = await paddle.transactions.create({
      items: [
        {
          quantity: 1,
          price: {
            name: "Premium Monthly Plan",
            description:
              "Access to all premium features including unlimited participants, screen sharing, and more.",
            billingCycle:{
              interval: 'month',
              frequency: 1,
            },
            unitPrice: {
              currencyCode: "USD",
              amount: "999" // $9.99 in cents
            },
            product: {
              name: "Premium Subscription",
              description:
                "Monthly premium subscription with full access to all features",
              taxCategory: "saas"
            }
          }
        }
      ],
      customData: {
        userId: self.id,
        planType: "premium"
      }
    });

    return NextResponse.json({
      txn,
      transactionId: txn.id
    });
  } catch (err) {
    console.error("Payment route error:", err.stack);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}


