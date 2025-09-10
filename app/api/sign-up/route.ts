import { getSelf } from "@/lib/auth-service"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"

export async function POST(req:Request){
    try {
         const {name, email, password} = await req.json()
         if (!name || !email || !password) {
            return Response.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
            }

        const existingUser = await db.user.findUnique({
            where :{
                 email,
            }
        })

        if(existingUser) {
            return Response.json("Unauthorized", {status: 400})
        }

         const hashedPassword = await bcrypt.hash(password, 10)

          await db.user.create({
           data: {
            name,
            email,
            password: hashedPassword,
            subscription:{
                create:{
                    status:"TRIALING",
                    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                }
            }
         },
         
        });

        return Response.json(
      { success: true, message: "User registered successfully", },
      { status: 200 }
    );
    } catch (error) {
       return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
    }
}