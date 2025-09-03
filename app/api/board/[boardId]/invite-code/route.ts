import {v4 as uuidv4} from "uuid"
import { db } from "@/lib/db";
import { NextResponse } from "next/server"
import { getSelf } from "@/lib/auth-service";


export async function PATCH(req:Request, {params}:{ params: Promise<{ boardId: string }>}){
    const{ boardId } = await params
    try {
        const self = await getSelf();
        if(!self) {
            return NextResponse.json("Unauthorized", {status: 401})
        }

        if(!boardId) {
            return NextResponse.json("serverId is required", {status: 400})
        }

        const board = await db.board.update({
            where :{
                id: boardId,
                userId: self?.id
            }, 
            data: {
                inviteCode:uuidv4()
            }
        })

        return NextResponse.json(board);
    } catch (error) {
        console.log(error)
        return NextResponse.json("Something wnet wrong", {status: 500})
    }
}