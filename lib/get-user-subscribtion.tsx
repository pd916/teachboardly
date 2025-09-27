"use server"

import { db } from "./db";


export const getUserSubscriptionStatus = async (userId:string | undefined) => {
        try {
    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
      },
    });

    if (subscription) {
      return { data: subscription, error: null };
    } else {
      return { data: null, error: null };
    }
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { data: null, error: "Error" };
  }
}