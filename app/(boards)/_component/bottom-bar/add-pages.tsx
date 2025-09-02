"use client"
import { Button } from '@/components/ui/button'
import { useCanvasStore } from '@/hooks/use-canvas-store'
import {v4 as uuidv4} from "uuid";
import { Canvas, FabricObject } from 'fabric'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'
import { useSocket } from '@/components/provider/socket-provider';

// interface AddPagesProps {
//     canvasRef: React.RefObject<HTMLCanvasElement | null>;
//     fabricRef: React.RefObject<Canvas | null>;
// }

const AddPages = ({ boardId}:{boardId:string | string[] | undefined;}) => {
  const {socket} = useSocket()
    const {activeIndex, canvases, addCanvas, next, prev} = useCanvasStore((state) => state);

    const handlePrev = () => {
   const newIndex = Math.max(0, activeIndex - 1);
  prev();
  if (socket && typeof boardId === 'string') {
    socket.emit('switch-canvas', { boardId, index: newIndex });
  }
  };

  const handleNextCanvas = () => {
  const isLast = activeIndex === canvases.length - 1;

  if (isLast && socket) {
          // const domRef = React.createRef<HTMLCanvasElement>();
          // const fabricRef = React.createRef<Canvas | null>();
          // const shapeRef = { current: null } as React.RefObject<FabricObject | null>;
          // const selectedShapeRef = { current: null } as React.RefObject<string | null>;
          //  const isDrawing =  { current: false } as React.RefObject<boolean>;
          //  const imageInputRef = { current: null } as React.RefObject<HTMLInputElement | null>; 
          // const activeObjectRef = { current: null } as React.RefObject<FabricObject | null>;
          // const isEditingRef =  { current: false } as React.RefObject<boolean>;



    // addCanvas({ id:uuidv4(), 
    //   domRef, 
    //   fabricRef, 
    //   shapeRef, 
    //   isDrawing,
    //   imageInputRef,
    //   selectedShapeRef, 
    //   activeObjectRef, 
    //   isEditingRef });

    socket.emit('add-canva', {
      boardId,
      canva: {
        id:uuidv4(), 
        // domRef, 
        // fabricRef, 
        // shapeRef, 
        // isDrawing,
        // imageInputRef,
        // selectedShapeRef, 
        // activeObjectRef, 
        // isEditingRef,
        history: [],        // start empty
        historyIndex: -1
      }
    })

  } else {
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
