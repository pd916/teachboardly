import { redirect } from "next/navigation";
import { getSelf } from "./auth-service"
import { startOfMonth } from "date-fns";
import { db } from "./db";


export const getTotalUsers = async () => {
    const self = await getSelf();

    if(!self?.isAdmin){
        redirect("/")
    }

    const users = await db.user.findMany({
        orderBy:{
            createdAt: 'desc'
        }
    })

    return users;
} 


export const totalEarning = async () => {
    const self = await getSelf();

    if(!self?.isAdmin){
        redirect('/')
    }

    const count = 10

    return count
    
}

export const newUsers = async () => {
    const self = await getSelf();

    if(!self?.isAdmin){
        redirect('/')
    }

    const firstDayOfMonth = startOfMonth(new Date());

  const users = await db.user.findMany({
    where: {
      createdAt: {
        gte: firstDayOfMonth, // only users created after or on the 1st of this month
      },
      NOT: { id: self.id }, // exclude current user if needed
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}