import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            plan: string;
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        imageUrl?: string | null; // ✅ Added imageUrl to User interface
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id: string;
        name: string;
        imageUrl?: string | null; // ✅ Added imageUrl to JWT interface
    }
}

export type NextApiResponseServerIo = NextApiResponse &  {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};