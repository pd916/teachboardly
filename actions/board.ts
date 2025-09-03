"use server"

import { getSelf } from "@/lib/auth-service"
import {v4 as uuidv4} from "uuid"
import { getBoardCountByUser } from "@/lib/board-service"
import { db } from "@/lib/db";
import { Board } from "@prisma/client";
import { redirect } from "next/navigation";

const MAX_FREE_BOARDS = 8;

export const createBoard = async (values: Partial<Board>) => {
    const self = await getSelf()


    if(!self){
        redirect("/sign-in");
    }

    //  const boardCount = await getBoardCountByUser(self?.id!);

    //   const isFreePlan = self?.plan === "free";

    //     if (isFreePlan && boardCount >= MAX_FREE_BOARDS) {
    //         redirect(`/w/${self?.name}`)
    //     }

        const newBoard = await db.board.create({
            data: {
            title: values.title!,
            userId: self?.id!,
            inviteCode: uuidv4(),
            },
        });

   return { id: newBoard.id };
}

export const savedBoard = async (boardId:string, canvasData: any) => {
    const self = await getSelf()

    // const isTeacher = await self?.role === "teacher"

    if(!self){
        throw new Error("something went wrong")
    }

    const boardCount = await getBoardCountByUser(self?.id!);

    const subscription = self.subscription?.[0]

    const isProPlan =  subscription?.status === "ACTIVE";;

    if (isProPlan && boardCount >= MAX_FREE_BOARDS) {
            throw new Error("Saved Board limit reached.");
        }

    if(subscription.status === "TRIALING"){
        throw new Error("Free plan users cannot save boards. Upgrade to Pro.");
    }
        
        const existingSavedBoard = await db.board.findUnique({
            where:{
                id: boardId,
                isArchived: true
            }
        })
        
        if(existingSavedBoard){
            throw new Error("Already Exist Board.");
        }

        const board = await db.board.update({
            where:{
                id:boardId
            },
            data:{
                isArchived:true,
                canvasData 
            }
        });

        return board;
}

export const getBoard = async (boardId?:string) => {
    if(!boardId) {
         throw new Error("something went wrong")
    }

    const board = await db.board.findUnique({
        where:{
            id: boardId
        }
    })

    return board;
}

export const deleteBoardOnLeave = async (boardId:string) => {
  const self = await getSelf();

  if(!self) throw new Error("Someting wnet wrong");

  const subscription = self?.subscription?.[0]

  const existingBoard = await db.board.findUnique({
    where:{
      id:boardId,
      userId:self.id,
    },
     select: {
      isArchived: true,
    },
  })

  if(!existingBoard) return;

   const isPro = subscription.status === 'ACTIVE';

   if (isPro && existingBoard.isArchived) {
    return;
  };

    await db.board.delete({
      where: { id: boardId },
    });
}

// export const deleteBoard = async (boardId?:string) => {
//     const self = await getSelf();

//     if(!boardId || !self){
//         throw new Error("something went wrong")
//     }

//      await db.board.delete({
//         where:{
//             id:boardId,
//             userId: self.id
//         }
//     })

//      return { message: "Board deleted successfully" };

// }