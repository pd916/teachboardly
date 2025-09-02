"use client"
import React from 'react'
import { CanvasData, useCanvasStore } from '@/hooks/use-canvas-store';
import { CanvasLayer } from './canva-layers';

type Props = {
  canvases: CanvasData[]
  // canvaFabric: CanvasData
  //   activeIndex: number;
    isDrawingEnabled:boolean
}

const Live = ({isDrawingEnabled}:Props) => {
   const canvases = useCanvasStore((state) => state.canvases);
  const activeIndex = useCanvasStore((state) => state.activeIndex);

  console.log(activeIndex, 'activeindex')

if (canvases?.length === 0) return null;
console.log('Canvas IDs:', canvases.map(c => c.id));

  return (
    <div className="relative w-full h-full border border-amber-400">
      {canvases?.map((canvas, index) => (
        <CanvasLayer
        key={canvas?.id}
          domRef={canvas?.domRef}
          fabricRef={canvas?.fabricRef}
          isActive={index === activeIndex}
          isDrawingEnabled={isDrawingEnabled}
        />
      ))}
    </div>
  )
}

export default Live


