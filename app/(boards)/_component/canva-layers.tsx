"use client"
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Canvas } from 'fabric';
import { RefObject, useEffect} from 'react';

type Props = {
  domRef: RefObject<HTMLCanvasElement | null>;
  fabricRef: RefObject<Canvas | null>;
  isActive: boolean;
  isDrawingEnabled:boolean
  isUser: boolean
};

export const CanvasLayer = ({ domRef, fabricRef, isUser, isActive, isDrawingEnabled }: Props) => {
  console.log(isActive, "is active")
  // alert(`isdrawing: ${isDrawingEnabled}`)

  return (
    <div
      className="absolute top-0 left-0 inset-0 w-full h-full border border-gray-300"
      style={{
        // display: isActive ? 'block' : 'none',
        opacity: isActive ? 1 : 0, 
        // visibility: isActive ? 'visible' : 'hidden',
        pointerEvents:(isUser || isDrawingEnabled) ? "auto" : "none",
        // zIndex: isActive ? 10 : 0,
        // willChange: 'transform',
      }}
      >


   <canvas
      ref={domRef}
      className='h-full w-full'
      style={{
        // width: '100vw',
        // height: '100vh',
        //  display: isActive ? 'block' : 'none', // Completely hide inactive canvas
        // pointerEvents:(isUser || isDrawingEnabled) ? "auto" : "none",
        // opacity: isActive ? 1 : 0, 
         zIndex: isActive ? 10 : 1,
      }}
      />
     
  </div>
  );
};
