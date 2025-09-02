import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

let members:any[] = []

export default async function handler(req: NextApiRequest, res:NextApiResponseServerIo) {
    if(req.method !== "POST") {
        return res.status(405).json({error: "Method not allowed"});
    }
    //  const profile = await currentProfile(req, res);

        const {value} = req.body;

        console.log(value, members, "namess")

        if (!value.name || !value.link) {
             return res.status(401).json({error: "Unauthorized"});
        }

        const existingBoard = await db.board.findFirst({
        where: {
        inviteCode:value.link
        },
        include:{
          user:true
        }
    });

    console.log(existingBoard, value.link, "member-joiningg")

    if (!existingBoard) {
    return res.status(404).json({ error: "Board not found" });
  }
  
  const ownerPlan = existingBoard.user.plan
  
  if(ownerPlan === "FREE" && members.length >= 8){
    return res.status(404).json({ error: "Sorry you can't join the board host didn't upgraded to pro plan" });
  }

  
  const guestUUID = uuidv4();
  
  const guest = {
    id:guestUUID,
    name: value.name,
    boardId: value.boardId
  }

  const userExist = members.find((m) => m.id === guest.id)

  if(!userExist){
    members.push({
      guest
    })
  }
  
  console.log(value.name,
      guestUUID,
      existingBoard.id, "prooo")

  return res.status(200).json({
    board:existingBoard,
    guest
    // guest: {
    //   name:value.name,
    //   id: guestUUID,
    //   boardId: existingBoard.id,
    // },
  })
}

