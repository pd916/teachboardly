"use server";

import { stripe } from "@/app/api/payment/route";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";

export const onSubscribe = async (session_id:string) => {
    const self = await getSelf()
    if(!self) return
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id)
        if(session) {
            const subscribed = await updateSubscription(self?.id, {
                customerId:session.customer as string,
                status: PaymentStatus.SUCCEEDED 
            })

            if(subscribed) return {status: 200}
            return {status: 401}
        }
        return {status: 404}
    } catch (error) {
        return {status: 500}
        
    }
}

export const updateSubscription = async (userId:string, props: {customerId?: string; status?: PaymentStatus}) => {
   console.log(userId, props.customerId, props.status, "subscription")
    return await db.user.update({
        where:{
           id: userId
        },
        data: {
            subscription: {
                update: {
                    data: {
                        ...props
                    }
                }
            }
        }
    })
}