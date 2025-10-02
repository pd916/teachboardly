import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            isAdmin: boolean;
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        imageUrl?: string | null; // ✅ Added imageUrl to User interface
        isAdmin: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id: string;
        name: string;
        imageUrl?: string | null; // ✅ Added imageUrl to JWT interface
         isAdmin: boolean;
    }
}
