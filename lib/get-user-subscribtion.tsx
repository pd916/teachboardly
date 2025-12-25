"use server"

import { db } from "./db";


export const getUserSubscriptionStatus = async (userId:string | undefined) => {
      return await db.user.findUnique({
      where: {
        id: userId,
      },
      include:{
        subscription:true
      }
    });
}