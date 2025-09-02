"use client"
import { getBoard } from '@/actions/board';
import { Board } from '@prisma/client';
import React, { useEffect, useState } from 'react'

type Props = {
    boardId?: string | string[];
}

const useBoardData = ({
    boardId
}: Props) => {
    const [board, setBoard] = useState<Board | null>(null);

    useEffect(() => {
          if (!boardId || Array.isArray(boardId)) return
        const board = async () => {
            const existingBoard = await getBoard(boardId)
            setBoard(existingBoard)
        }
        board()
    },[boardId])

    return {
        board
    }

}

export default useBoardData