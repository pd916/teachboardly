"use client"
import React from 'react'
import { CanvasData, useCanvasStore } from '@/hooks/use-canvas-store';
import { CanvasLayer } from './canva-layers';

type Props = {
  canvases: CanvasData[]
    isDrawingEnabled:boolean
    isUser: boolean
}

const Live = ({isDrawingEnabled, isUser}:Props) => {
   const canvases = useCanvasStore((state) => state.canvases);
  const activeIndex = useCanvasStore((state) => state.activeIndex);


if (canvases?.length === 0) return null;


  return (
    <div className="relative w-full h-full border border-amber-400">

      {canvases?.map((canvas, index) => (
        <CanvasLayer
        key={canvas?.id}
          domRef={canvas?.domRef}
          fabricRef={canvas?.fabricRef}
          isActive={index === activeIndex}
          isDrawingEnabled={isDrawingEnabled}
          isUser={isUser}
        />
      ))}
    </div>
  )
}

export default Live


