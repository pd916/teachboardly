import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            plan: string; // Add your role here
        };
    }

    interface User {
        plan: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        plan: string;
    }
}

export type NextApiResponseServerIo = NextApiResponse &  {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};