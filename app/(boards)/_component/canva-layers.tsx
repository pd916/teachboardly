"use client"
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Canvas } from 'fabric';
import { RefObject} from 'react';

type Props = {
  domRef: RefObject<HTMLCanvasElement | null>;
  fabricRef: RefObject<Canvas | null>;
  isActive: boolean;
  isDrawingEnabled:boolean
};

export const CanvasLayer = ({ domRef, isActive, isDrawingEnabled }: Props) => {
  console.log(isActive, "is active")
  return (
    <div
      className="absolute top-0 left-0 inset-0 w-full h-full border border-gray-300"
      style={{
        display: isActive ? 'block' : 'none',
        visibility: isActive ? 'visible' : 'hidden',
        pointerEvents:isDrawingEnabled ? "auto" : "none",
        zIndex: isActive ? 10 : 0,
      }}
    >


   <canvas
      ref={domRef}
      className='h-full w-full'
      style={{
        // width: '100vw',
        // height: '100vh',
        //  display: isActive ? 'block' : 'none', // Completely hide inactive canvas
        //  zIndex: isActive ? 10 : 1,
      }}
      />
     
  </div>
  );
};
