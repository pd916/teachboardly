
import { getSelf } from "@/lib/auth-service"
import { NextResponse } from "next/server"
import Stripe from "stripe"


export const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET!, { 
    apiVersion: "2025-12-15.clover" as any
});

export async function GET() {
    const self = await getSelf()
    if(!self) return NextResponse.json({status:404})

    const priceId = process.env.STRIPE_PRICE_ID

    if (!priceId) {
    return NextResponse.json(
      { error: "Stripe secret or price ID not configured" },
      { status: 500 }
    );
  }


    const session = await stripe.checkout.sessions.create({
        mode:'subscription',
        line_items: [
            {
                price:priceId,
                quantity: 1,
            }
        ],
        success_url: `${process.env.NEXT_PUBLIC_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment?cancel=true`,
    })

    if(session) {
        return NextResponse.json({
            status: 200,
            session_url: session.url
        })
    }

    return NextResponse.json({status: 404})
}

