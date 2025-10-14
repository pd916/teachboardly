"use server"

import { db } from "./db";


export const getUserSubscriptionStatus = async (userId:string | undefined) => {
        try {
    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
        OR: [
           { status: "ACTIVE" },
        ]
      },
       orderBy: {
        createdAt: "desc", // get the latest one if multiple match
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