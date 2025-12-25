"use client"
import { Button } from '@/components/ui/button'
import { useCanvasStore } from '@/hooks/use-canvas-store'
import {v4 as uuidv4} from "uuid";
import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner';
import { useCanvasRealtime } from '@/hooks/use-canvaRealTime';
import { PaymentStatus } from '@prisma/client';

export type AddPagesProps = {
  boardId:string | string[] | undefined;
  isUser?: PaymentStatus;
}

const AddPages = ({ boardId, isUser}:AddPagesProps) => {
    const {activeIndex, canvases, next, prev} = useCanvasStore((state) => state);
     const {  emitAddCanva, emitSwitchCanvas } = useCanvasRealtime(boardId)
    // const userplan = isUser.subscr
  

   const handlePrev = () => {
    const newIndex = Math.max(0, activeIndex - 1);
    prev();
    if (typeof boardId === 'string') {
      emitSwitchCanvas(newIndex);
    }
  };

  const handleNextCanvas = () => {
    const isLast = activeIndex === canvases.length - 1;

    if (isLast) {
      if ((isUser === "TRIALING" || isUser === "FAILED") && canvases.length >= 2) {
        toast.error("Upgrade your plan to add more canvases.");
        return;
      }

      const newCanva = {
        id: uuidv4(),
        history: [],
        historyIndex: -1
      };

       // Add locally first (update your own state)
      const domRef = React.createRef<HTMLCanvasElement>();
      const fabricRef = React.createRef<any>();
      const shapeRef = { current: null } as React.RefObject<any>;
      const selectedShapeRef = { current: null } as React.RefObject<string | null>;
      const isDrawing = { current: false } as React.RefObject<boolean>;
      const imageInputRef = { current: null } as React.RefObject<HTMLInputElement | null>;
      const activeObjectRef = { current: null } as React.RefObject<any>;
      const isEditingRef = { current: false } as React.RefObject<boolean>;

      useCanvasStore.getState().addCanvas({
        ...newCanva,
        domRef,
        fabricRef,
        shapeRef,
        selectedShapeRef,
        isDrawing,
        imageInputRef,
        activeObjectRef,
        isEditingRef
      });

      // Emit add-canva event (equivalent to socket.emit('add-canva', {...}))
      emitAddCanva(newCanva);
    } else {
      // Moving between existing canvases is always allowed
      next();
      if (typeof boardId === 'string') {
        emitSwitchCanvas(activeIndex + 1);
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
        {activeIndex + 1} / {canvases.length}
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
