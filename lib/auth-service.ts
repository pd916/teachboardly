import { User } from "@prisma/client";
import { db } from "./db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";



export const getSelf = async () => {
    const session = await getServerSession(authOptions)
     const user = session?.user

    if(!user || !user?.name){
        return null;
    }

    const currentUser = await db.user.findUnique({
        where:{
            email:user?.email!
        },
        include:{
            subscription:true
        }
    });

    return currentUser;
}

export const getSelfByUsername = async (name: string) => {
     const self = await getSelf()
     console.log(name, self,"user")

     if(!self || !self.name){
         throw new Error("Unauthorized")
     }
 
     const user = await db.user.findFirst({
         where: {
             name
         }
     })
 
     if(!user){
         throw new Error("User  not found")
     }
 
     if(self?.name !== user.name){
        console.log(self?.name, user?.name, "work")
         throw new Error("Unauthorize")
     }
 
     return user
}