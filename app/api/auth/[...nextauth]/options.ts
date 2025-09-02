import {NextAuthOptions} from "next-auth" 
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";
// import dbConnect from "@/lib/dbConnect";
import { db } from "@/lib/db";


export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id:"credentials",
            name:"Credentials",
            credentials: {

                email: { 
                    label: "Email", 
                type: "text"
                },

                password: {
                     label: "Password", 
                     type: "password" 
                    }
              },
              async authorize(credentials:any): Promise<any> {
                console.log(credentials, "credentials")
                // await dbConnect()
                try {
                    const user = await  db.user.findFirst({
                        where: {
                            OR: [
                            { email: credentials.email },
                            { name: credentials.name }
                            ]
                        },
                        select: { // Explicitly select fields you need
                        id: true,
                        name: true,
                        email: true,
                        password: true,
                        imageUrl: true
                    }
                    })

                    console.log(user, "usss")

                    if(!user) {
                        throw new Error("No user Found with this email")
                    }
                   
                    const isPasswordCorrect =  await bcrypt.compare(credentials.password, user.password )
                    if(isPasswordCorrect) {
                        return user
                    }else {
                        throw new Error("Incorect Password")
                    }
                } catch (err:any) {
                    throw new Error
                }
              }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if(user){
                token._id = user.id?.toString()
                token.name = user.name
            }
          return token
        },
        async session({ session, token }) {
            if (token && session.user) {
            (session.user as { id: string }).id = token._id as string;
            session.user.name = token.name as string;
            // session.user.image = token.picture as string;
            
            // ✅ fetch fresh data from DB
            // const freshUser = await db.user.findUnique({
            //     where: { id: token._id as string },
            //     select: { name: true, imageUrl: true },
            //     });
                
            //     if (freshUser) {
            //         session.user.name = freshUser.name;
            //         session.user.image = token.picture as string;
            // }
        }
        return session;
          },
    },
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET_KEY
}
