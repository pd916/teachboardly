"use server"

import { AccessToken } from "livekit-server-sdk";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";

interface createViewTokenProps {
  boardId: string;
  currentGuest?:{
    name: string;
    id: string;
    boardId: string;
  }
}

export const createViewToken = async ({boardId, currentGuest}:createViewTokenProps) => {
      const self = await getSelf();

     const board = await db.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      userId: true, // Owner ID
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }
  console.log(board, "bdsss")
    
   const hostIdentity = `host-${board.userId}`;
    const isHost = self?.id === board.userId;

    const token = await new AccessToken(
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!,
        {
            identity: isHost ? hostIdentity : currentGuest?.id,
            name: isHost ? self.name : currentGuest?.name,
        }
    );

    token.addGrant({
        room: board.id,
        roomJoin: true,
        canPublish: true,
        canPublishData:true,
        canSubscribe: true,
    });

    const jwt = await Promise.resolve(token.toJwt());

     return { token: jwt, hostIdentity };
}



