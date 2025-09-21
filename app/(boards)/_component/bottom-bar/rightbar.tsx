"use client"
import Color from '@/components/settings/Color'
import { modifyShape } from '@/lib/shapes';
import { RightSidebarProps } from '@/types/type'
import { Canvas, Point, TEvent } from 'fabric';
import { HandIcon, Redo, Undo, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useRef, useState } from 'react'
import BottombarButton from './bottombar-button';
import { useCanvasRealtime } from '@/hooks/use-canvaRealTime';

type PanCanvas = Canvas & { isDragging?: boolean; lastX?: number; lastY?: number };


const Rightbar = ({
    elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
  boardId
}:RightSidebarProps) => {

  const { emitViewportUpdate } = useCanvasRealtime(boardId)

  
const panHandlersRef = useRef<{
  down?: (opt: TEvent<MouseEvent>) => void;
  move?: (opt: TEvent<MouseEvent>) => void;
  up?: (opt: TEvent<MouseEvent>) => void;
}>({});
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);

  const [zoom, setZoom] = useState(1)
  const minZoom = 0.2
  const maxZoom = 5

  const handleInputChange = (property:string, value:string) => {
    if(!isEditingRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({
      ...prev, [property]: value
    }))

    modifyShape({
      canvas: fabricRef.current as Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage
    }) 
  }

  const zoomToCenter = (newZoom: number) => {
    if (!fabricRef.current) return

    // Clamp zoom value
    if (newZoom < minZoom) newZoom = minZoom
    if (newZoom > maxZoom) newZoom = maxZoom

    const canvas = fabricRef.current
    // Center point of canvas viewport
    const center = new Point(canvas.width! / 2, canvas.height! / 2)

    canvas.zoomToPoint(center, newZoom)
    setZoom(newZoom)

    emitViewportUpdate({
    zoom: newZoom,
    viewportTransform: canvas.viewportTransform!
  })
  }

  const zoomIn = () => {
    zoomToCenter(zoom * 1.1)
  }

  const zoomOut = () => {
    zoomToCenter(zoom / 1.1)
  }

  // somewhere in your component:
const togglePan = () => {
  if (!fabricRef.current) return;
  const canvas = fabricRef.current as PanCanvas;

  const enablePan = canvas.defaultCursor !== "grab";
  canvas.defaultCursor = enablePan ? "grab" : "default";

  // disable pan
  if (!enablePan) {
    if (panHandlersRef.current.down) canvas.off("mouse:down", panHandlersRef.current.down);
    if (panHandlersRef.current.move) canvas.off("mouse:move", panHandlersRef.current.move);
    if (panHandlersRef.current.up) canvas.off("mouse:up", panHandlersRef.current.up);
    panHandlersRef.current = {};
    return;
  }

  canvas.isDrawingMode = false;
  canvas.freeDrawingBrush = undefined

  const down = (opt: TEvent) => {
    if (opt.e instanceof MouseEvent) {
      canvas.isDragging = true;
      canvas.lastX = opt.e.clientX;
      canvas.lastY = opt.e.clientY;
      canvas.selection = false;
      canvas.setCursor("grabbing");
    }
  };

  const move = (opt: TEvent) => {
    if (!canvas.isDragging || !(opt.e instanceof MouseEvent)) return;
    const vpt = canvas.viewportTransform!;
    vpt[4] += opt.e.clientX - (canvas.lastX || 0);
    vpt[5] += opt.e.clientY - (canvas.lastY || 0);
    canvas.lastX = opt.e.clientX;
    canvas.lastY = opt.e.clientY;
    canvas.requestRenderAll();

     emitViewportUpdate({
    zoom: canvas.getZoom(),
    viewportTransform: vpt
  });
  };

  const up = () => {
    canvas.isDragging = false;
    canvas.selection = true;
    canvas.setCursor("grab");
  };

  panHandlersRef.current = { down, move, up };
  canvas.on("mouse:down", down);
  canvas.on("mouse:move", move);
  canvas.on("mouse:up", up);
};

// ✅ CHANGED: Complete rewrite of handleUndo
// const handleUndo = () => {
//   if (!activeCanvas) return;
//   if (activeCanvas.historyIndex <= 0) return; // Check if undo is possible
  
//   // undo(activeCanvas.id);
//   socket.emit("canvas-undo", {
//       boardId,
//       canvasId: activeCanvas.id
//     });
// };

// const handleRedo = () => {
//   if (!activeCanvas) return;
//   if (activeCanvas.historyIndex >= activeCanvas.history.length - 1) return; // Check if redo is possible
  
//   // redo(activeCanvas.id);
//    socket.emit("canvas-redo", {
//       boardId,
//       canvasId: activeCanvas.id
//     });
// };



  return (
    <div className='flex items-center gap-2'>
       <div className="flex items-center gap-2">
        <BottombarButton
        variant="ghost"
        onClick={zoomOut}
        label='Zoom Out'
        icon={ZoomOut}
        />
        <div className="min-w-[40px] text-center font-mono">{(zoom * 100).toFixed(0)}%</div>
        <BottombarButton
        variant="ghost"
        onClick={zoomIn}
        label='Zoom In'
        icon={ZoomIn}
        />

         <BottombarButton
        variant="ghost"
        onClick={togglePan}
        title="Pan Canvas"
        icon={HandIcon}
        />

      </div>

      <Color
      inputRef={colorInputRef}
      attribute={elementAttributes.fill}
    //   placeholder='color'
      handleInputChange={handleInputChange}
      attributeType='fill'
      />

    </div>
  )
}

export default Rightbar
