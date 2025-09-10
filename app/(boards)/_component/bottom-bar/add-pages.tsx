"use client"
import { Button } from '@/components/ui/button'
import { useCanvasStore } from '@/hooks/use-canvas-store'
import {v4 as uuidv4} from "uuid";
import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'
import { useSocket } from '@/components/provider/socket-provider';
import { toast } from 'sonner';

export type AddPagesProps = {
  boardId:string | string[] | undefined;
  isUser?: "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELED";
}

const AddPages = ({ boardId, isUser}:AddPagesProps) => {
  const {socket} = useSocket()
    const {activeIndex, canvases, next, prev} = useCanvasStore((state) => state);
    // const userplan = isUser.subscr
    console.log(isUser, "subss")

    const handlePrev = () => {
   const newIndex = Math.max(0, activeIndex - 1);
  prev();
  if (socket && typeof boardId === 'string') {
    socket.emit('switch-canvas', { boardId, index: newIndex });
  }
  };

  const handleNextCanvas = () => {
  const isLast = activeIndex === canvases.length - 1;

 
  if (isLast) {
    if ((isUser === "TRIALING" || isUser === "EXPIRED") && canvases.length >= 2) {
      toast.error("Upgrade your plan to add more canvases.");
      return;
    }

    if (socket) {
      socket.emit('add-canva', {
        boardId,
        canva: {
          id: uuidv4(),
          history: [],
          historyIndex: -1
        }
      });
    }
  } else {
    // ✅ Moving between existing canvases is always allowed
    next();
    if (socket && typeof boardId === 'string') {
      socket.emit('switch-canvas', { boardId, index: activeIndex + 1 });
    }
  }
};
  return (
    <div className='flex gap-0 items-center'>
        <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        >
            <ArrowLeft/>
        </Button>
        {activeIndex}
        <Button
        variant="ghost"
        size="icon"
        onClick={handleNextCanvas}
        >
            <ArrowRight/>
        </Button>
    </div>
  )
}

export default AddPages
