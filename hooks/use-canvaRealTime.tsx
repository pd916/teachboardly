"use client"
import React, { useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { useCanvasStore } from "@/hooks/use-canvas-store"
import * as fabric from "fabric"

type CanvasData = {
  id: string
  history: any[]
  historyIndex: number
}


export function useCanvasRealtime(boardId?: string | string[] | undefined, currentUserId?: string) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const addCanvas = useCanvasStore((s) => s.addCanvas)
  const canvases = useCanvasStore((state) => state.canvases);
  

  useEffect(() => {
    if (!boardId) return

    const channel = supabase.channel(`board-${boardId}`)
    channelRef.current = channel

    // Equivalent to socket.on("canva-added", handleCanvaAdded)
    const handleCanvaAdded = (canva: CanvasData) => {
      const domRef = React.createRef<HTMLCanvasElement>()
      const fabricRef = React.createRef<any>()
      const shapeRef = { current: null } as React.RefObject<any>
      const selectedShapeRef = { current: null } as React.RefObject<string | null>
      const isDrawing = { current: false } as React.RefObject<boolean>
      const imageInputRef = { current: null } as React.RefObject<HTMLInputElement | null>
      const activeObjectRef = { current: null } as React.RefObject<any>
      const isEditingRef = { current: false } as React.RefObject<boolean>

      addCanvas({
        ...canva,
        domRef,
        fabricRef,
        shapeRef,
        selectedShapeRef,
        isDrawing,
        imageInputRef,
        activeObjectRef,
        isEditingRef
      })
    }

    // Equivalent to socket.on("canvas-switched", handleCanvasSwitched)
    const handleCanvasSwitched = ({ index }: { index: number }) => {
      useCanvasStore.setState({ activeIndex: index })
    }

    const handleShapeUpdate = (payload: any) => {
      if (payload.senderId === currentUserId) {
        return
      }

      const shape = payload.shape || payload
      const { canvases, activeIndex } = useCanvasStore.getState();

        if (!shape.objectId) {
            console.error("Invalid shape data:", shape);
            return;
        }

        const currentCanvaFabric = canvases[activeIndex];
        const canvas = currentCanvaFabric?.fabricRef?.current;
        if (!canvas) return;

        const existing = canvas.getObjects().find(
            (obj: any) => String(obj.objectId) === String(shape.objectId)
        );

        // Update existing object's properties
        if (existing) {
            const { type, clipPath, ...propsToSet } = shape;

            // Update object properties first
            if (type && type.toLowerCase() === "line") {
                existing.set({
                    x1: propsToSet.x1,
                    y1: propsToSet.y1,
                    x2: propsToSet.x2,
                    y2: propsToSet.y2,
                    left: propsToSet.left,
                    top: propsToSet.top,
                    scaleX: propsToSet.scaleX,
                    scaleY: propsToSet.scaleY,
                    angle: propsToSet.angle,
                    originX: propsToSet.originX,
                    originY: propsToSet.originY,
                    flipX: propsToSet.flipX,
                    flipY: propsToSet.flipY,
                    skewX: propsToSet.skewX,
                    skewY: propsToSet.skewY,
                    stroke: propsToSet.stroke,
                    strokeWidth: propsToSet.strokeWidth,
                    strokeUniform: propsToSet.strokeUniform,
                });
            } else {
                existing.set(propsToSet);
            }

            // FIXED: Exact clipPath position reconstruction
            if (clipPath) {
                try {
                    let parsedClipPath = typeof clipPath === 'string' ? JSON.parse(clipPath) : clipPath;
                    
                    if (parsedClipPath.type === 'Group' && parsedClipPath.objects) {
                        // FIXED: Recreate holes with exact same positioning
                        const circles = parsedClipPath.objects.map((obj: any) => {
                            return new fabric.Circle({
                                left: obj.left,    // Use exact position from admin
                                top: obj.top,      // Use exact position from admin
                                radius: obj.radius || 24,
                                originX: 'center',
                                originY: 'center',
                                fill: 'rgba(0,0,0,1)',
                                absolutePositioned: false,
                                selectable: false,
                                evented: false
                            });
                        });
                        
                        const clipGroup = new fabric.Group(circles, {
                            inverted: true,
                            absolutePositioned: false,
                            // FIXED: Preserve group positioning
                            left: parsedClipPath.left || 0,
                            top: parsedClipPath.top || 0,
                            originX: parsedClipPath.originX || 'left',
                            originY: parsedClipPath.originY || 'top'
                        });
                        
                        existing.clipPath = clipGroup;
                    } else {
                        // Handle other shape types as clipPath
                        fabric.util.enlivenObjects([parsedClipPath])
                            .then((objects) => {
                                if (objects[0]) {
                                    const clipObject = objects[0] as fabric.Object;
                                    clipObject.set({
                                        inverted: true,
                                        absolutePositioned: false,
                                        selectable: false,
                                        evented: false
                                    });
                                    existing.clipPath = clipObject;
                                }
                            });
                    }
                    
                    existing.set('dirty', true);
                    canvas.requestRenderAll();
                    
                } catch (error) {
                    console.error("❌ Failed to apply clipPath:", error);
                }
            }

            existing.setCoords();
            canvas.requestRenderAll();
            
            return;
        }

        // Handle new objects (unchanged)
        let processedShape = { ...shape };

        if (shape.clipPath) {
            try {
                if (typeof shape.clipPath === 'string') {
                    processedShape.clipPath = JSON.parse(shape.clipPath);
                }
                if (processedShape.clipPath.objects && processedShape.clipPath.objects.length) {
                    processedShape.clipPath.objects.forEach((clipObj: any, index: number) => {
                        clipObj.id = `${shape.objectId}_clip_${index}`;
                        clipObj.objectId = `${shape.objectId}_clip_${index}`;
                    });
                }
            } catch (error) {
                console.error("❌ Failed to process clipPath for new object:", error);
                delete processedShape.clipPath;
            }
        }

        fabric.util
            .enlivenObjects([processedShape])
            .then((objects) => {
                const canvasObjects = objects.filter(
                    (obj): obj is fabric.FabricObject => obj instanceof fabric.Object
                );

                canvasObjects.forEach((obj) => {
                    // @ts-expect-error
                    obj.id = shape.objectId;
                    // @ts-expect-error
                    obj.objectId = shape.objectId;
                    canvas.add(obj);
                });

                canvas.requestRenderAll();
                
            })
            .catch((err) => {
                console.error("❌ Failed to enliven new object:", err);
            });
    };

    const handleShapeRemoved = (objectId: string) => {
      if (!objectId) return;
      
      canvases.forEach((canva) => {
        const fabricCanvas = canva?.fabricRef;
        const fabric = fabricCanvas.current;
        // alert(fabricCanvas?.getObjects)
        if (!fabricCanvas || !fabric) return;

        const target = fabric.getObjects().find((obj: any) => obj?.objectId === objectId)

        if (target) {
          fabric.remove(target);
          fabric.requestRenderAll();
        }
      })
    };

     const handleCanvasReset = () => {
      const { canvases, activeIndex } = useCanvasStore.getState();
      const currentCanvaFabric = canvases[activeIndex];
      const canvas = currentCanvaFabric?.fabricRef?.current;
      
      if (canvas) {
        canvas.clear();
        canvas.requestRenderAll();
      }
    };

    const handleViewportUpdate = (viewport: { zoom: number, viewportTransform: number[] }) => {
      const { canvases, activeIndex } = useCanvasStore.getState();
      const currentCanvaFabric = canvases[activeIndex];
      const canvas = currentCanvaFabric?.fabricRef?.current;
      
      if (canvas) {
        // Apply zoom without triggering another broadcast
        canvas.setZoom(viewport.zoom);
         if (viewport.viewportTransform.length === 6) {
          canvas.setViewportTransform(viewport.viewportTransform as [number, number, number, number, number, number]);
        }
        canvas.requestRenderAll();
      }
    };

    // Listen for canva-added broadcasts
    channel.on("broadcast", { event: "canva-added" }, ({ payload }) => {
      handleCanvaAdded(payload as CanvasData)
    })

    // Listen for canvas-switched broadcasts
    channel.on("broadcast", { event: "canvas-switched" }, ({ payload }) => {
      handleCanvasSwitched(payload as { index: number })
    })

    channel.on("broadcast", { event: "shape-updated" }, ({ payload }) => {
      handleShapeUpdate(payload)
    })

    channel.on("broadcast", { event: "shape-removed" }, ({ payload }) => {
      handleShapeRemoved(payload as string)
    })

    channel.on("broadcast", { event: "canvas-reset" }, () => {
      handleCanvasReset()
    })

    channel.on("broadcast", { event: "viewport-updated" }, ({ payload }) => {
      handleViewportUpdate(payload as { zoom: number, viewportTransform: number[] })
    })


    channel.subscribe((status) => {
      console.log("Canvas realtime channel status:", status)
    })

     return () => {
    console.log("Canvas realtime hook cleanup - not removing shared channel")
  }
  }, [boardId])

  // Equivalent to socket.emit('add-canva', {...})
  const emitAddCanva = useCallback((canva: CanvasData) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "canva-added",
      payload: canva,
    })
  }, [])

  // Equivalent to socket.emit('switch-canvas', {...})
  const emitSwitchCanvas = useCallback((index: number) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "canvas-switched",
      payload: { index },
    })
  }, [])

  const emitUpdateShape = useCallback((shape: any) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "shape-updated",
      payload: shape,
    })
  }, [currentUserId])

  const emitDeleteShape = useCallback((objectId: string) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "shape-removed",
      payload: objectId,
    })
  }, [])

  const emitResetCanvas = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "canvas-reset",
      payload: null,
    })
  }, [])

  const emitViewportUpdate = useCallback((viewport: { zoom: number, viewportTransform: number[] }) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "viewport-updated",
      payload: viewport,
    })
  }, [])

  return { emitAddCanva, emitSwitchCanvas, emitUpdateShape, emitDeleteShape, emitResetCanvas, emitViewportUpdate}
}