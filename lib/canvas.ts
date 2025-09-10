import { CanvasMouseDown, CanvasMouseMove, CanvasMouseUp, CanvasObjectModified, CanvasObjectScaling, CanvasPathCreated, CanvasSelectionCreated, RenderCanvas } from "@/types/type";
import { Canvas, FabricObject, PencilBrush, TEvent, FabricImage, } from 'fabric';
import * as fabric from "fabric"
// import directly from brush path
// import { EraserBrush } from "fabric/brushes/eraserBrush"; // only if package exposes it

import { createSpecificShape } from "./shapes";
import { defaultNavElement } from "@/constant";
import { v4 as uuid4 } from "uuid";

type CanvasWithTemp = Canvas & {
  _tempRuler?: fabric.Image | null;
  _tempProtractor?: fabric.Image | null;
};


type ShapeTool = "ruler" | "protracter";
// type TempImages = Partial<Record<ShapeTool, fabric.Image>>;

const shapes: Record<ShapeTool, string> = {
  ruler: "/assets/board/ruler.png",
  protracter: "/assets/board/protracter.png"
};

function addOnTop(canvas: Canvas, obj: fabric.Object) {
  if (obj.canvas) canvas.remove(obj);
  canvas.add(obj);
}


export const initializeFabric = ({
  canvasEl,
  fabricCanva
}:{
  fabricCanva: React.MutableRefObject<Canvas | null | undefined>;
  // canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
  canvasEl:HTMLCanvasElement | null
}) => {
  // const canvasElement = canvasRef.current;
    // const canvasElement = document.getElementById("canvas");
  //   if (fabricCanva?.current) {
  //   console.warn("Canvas already initialized, skipping.");
  //   return fabricCanva.current;
  // }

    const canvas = new Canvas(canvasEl!, {
        width: canvasEl?.clientWidth,
        height: canvasEl?.clientHeight,
        preserveObjectStacking: true
    })

      fabricCanva.current = canvas;

    return canvas
}

export const handleCanvasMouseDown = ({
    options,
    canvas,
    isDrawing,
    shapeRef,
    selectedShapeRef,
    syncShapeInStorage
}:CanvasMouseDown) => {
    const pointer = canvas.getPointer(options.e);
    const target = canvas.findTarget(options.e);

      if (selectedShapeRef.current === 'eraser') {
        isDrawing.current = true;
        canvas.selection = false;
        
        const eraserRadius = 24;
        let isErasing = false;

        // Create eraser circle for intersection testing
        const makeEraserCircle = (p: fabric.Point) =>
            new fabric.Circle({
                left: p.x,
                top: p.y,
                originX: 'center',
                originY: 'center',
                radius: eraserRadius,
                absolutePositioned: true,
                selectable: false,
                evented: false,
            });

        // FIXED: Store absolute position for exact sync
        const makeHoleCircle = (p: fabric.Point, obj: fabric.Object) => {
            // Store the absolute canvas position for exact sync
            return new fabric.Circle({
                left: p.x,  // Use absolute position
                top: p.y,   // Use absolute position
                originX: 'center',
                originY: 'center',
                radius: eraserRadius,
                absolutePositioned: false, // Will be converted to relative when applied
                selectable: false,
                evented: false,
                fill: 'rgba(0,0,0,1)',
                // Store original absolute position for sync
                _absoluteLeft: p.x,
                _absoluteTop: p.y
            });
        };

        // FIXED: Convert absolute to relative position when applying to object
        function addHoleToObject(obj: fabric.Object, p: fabric.Point) {
            const objCenter = obj.getCenterPoint();
            const hole = makeHoleCircle(p, obj);
            
            // Convert absolute position to relative position
            hole.left = p.x - objCenter.x;
            hole.top = p.y - objCenter.y;

            if (!obj.clipPath) {
                const group = new fabric.Group([hole], { 
                    inverted: true,
                    absolutePositioned: false
                });
                obj.clipPath = group;
            } else {
                const clip = obj.clipPath as fabric.Group;
                if (clip.type !== 'group') {
                    const group = new fabric.Group([clip, hole], { 
                        inverted: true,
                        absolutePositioned: false
                    });
                    obj.clipPath = group;
                } else {
                    clip.add(hole);
                    clip.inverted = true;
                    clip.absolutePositioned = false;
                }
            }

            obj.set('dirty', true);
            canvas.requestRenderAll();
            
            // Sync the updated object
            syncShapeInStorage(obj);
        }

        // Erase at pointer position (unchanged)
        function eraseAtPointer(p: fabric.Point) {
            const objects = canvas.getObjects().slice().reverse();
            
            for (const obj of objects) {
                if (!obj.selectable || obj.excludeFromExport) continue;
                
                let shouldErase = false;

                if (typeof (obj as any).containsPoint === 'function') {
                    shouldErase = (obj as any).containsPoint(p);
                } else {
                    const eraserCircle = makeEraserCircle(p);
                    if (typeof (obj as any).intersectsWithObject === 'function') {
                        shouldErase = (obj as any).intersectsWithObject(eraserCircle);
                    } else {
                        const bounds = obj.getBoundingRect();
                        shouldErase = p.x >= bounds.left && p.x <= bounds.left + bounds.width &&
                                     p.y >= bounds.top && p.y <= bounds.top + bounds.height;
                    }
                }

                if (shouldErase) {
                    addHoleToObject(obj, p);
                    break;
                }
            }
        }

        // Mouse event handlers (unchanged)
        const mouseMoveHandler = (opt: fabric.TEvent) => {
            if (!isErasing) return;
            const p = canvas.getPointer(opt.e);
            eraseAtPointer(p);
        };

        const mouseUpHandler = () => {
            isErasing = false;
            canvas.off('mouse:move', mouseMoveHandler);
            canvas.off('mouse:up', mouseUpHandler);
        };

        // Start erasing
        isErasing = true;
        eraseAtPointer(pointer);
        
        // Attach event listeners
        canvas.on('mouse:move', mouseMoveHandler);
        canvas.on('mouse:up', mouseUpHandler);
        
        return;
    }

    //  if (selectedShapeRef.current === 'eraser') {
    //     isDrawing.current = true;
    //     canvas.selection = false;
        
    //     const eraserRadius = 24;
    //     let isErasing = false;

    //     // Create eraser circle for intersection testing
    //     const makeEraserCircle = (p: fabric.Point) =>
    //         new fabric.Circle({
    //             left: p.x,
    //             top: p.y,
    //             originX: 'center',
    //             originY: 'center',
    //             radius: eraserRadius,
    //             absolutePositioned: true, // Keep this for intersection testing only
    //             selectable: false,
    //             evented: false,
    //         });

    //     // Create hole circle that moves with object (FIXED)
    //     const makeHoleCircle = (p: fabric.Point, obj: fabric.Object) => {
    //         // Convert canvas coordinates to object-relative coordinates
    //         const objCenter = obj.getCenterPoint();
    //         const relativeX = p.x - objCenter.x;
    //         const relativeY = p.y - objCenter.y;
            
    //         return new fabric.Circle({
    //             left: relativeX,
    //             top: relativeY,
    //             originX: 'center',
    //             originY: 'center',
    //             radius: eraserRadius,
    //             absolutePositioned: false, // This makes holes move with object
    //             selectable: false,
    //             evented: false,
    //             fill: 'rgba(0,0,0,1)' // Ensure it creates a proper hole
    //         });
    //     };

    //     // Add hole to object using clipPath (FIXED)
    //     function addHoleToObject(obj: fabric.Object, p: fabric.Point) {
    //         const hole = makeHoleCircle(p, obj);

    //         // If there's no clipPath, create an inverted group with the hole
    //         if (!obj.clipPath) {
    //             const group = new fabric.Group([hole], { 
    //                 inverted: true,
    //                 absolutePositioned: false // FIXED: This allows holes to move with object
    //             });
    //             obj.clipPath = group;
    //         } else {
    //             const clip = obj.clipPath as fabric.Group;
    //             if (clip.type !== 'group') {
    //                 // Convert existing clipPath to group
    //                 const group = new fabric.Group([clip, hole], { 
    //                     inverted: true,
    //                     absolutePositioned: false
    //                 });
    //                 obj.clipPath = group;
    //             } else {
    //                 // Add hole to existing group
    //                 clip.add(hole);
    //                 clip.inverted = true;
    //                 clip.absolutePositioned = false;
    //             }
    //         }

    //         // Mark object as dirty and re-render
    //         obj.set('dirty', true);
    //         canvas.requestRenderAll();
    //     }

    //     // Erase at pointer position (IMPROVED)
    //     function eraseAtPointer(p: fabric.Point) {
    //         // Find topmost selectable object under pointer
    //         const objects = canvas.getObjects().slice().reverse();
            
    //         for (const obj of objects) {
    //             if (!obj.selectable || obj.excludeFromExport) continue;
                
    //             // Check if pointer intersects with object
    //             let shouldErase = false;

    //             // Method 1: Use containsPoint for precise detection
    //             if (typeof (obj as any).containsPoint === 'function') {
    //                 shouldErase = (obj as any).containsPoint(p);
    //             } else {
    //                 // Method 2: Use intersectsWithObject as fallback
    //                 const eraserCircle = makeEraserCircle(p);
    //                 if (typeof (obj as any).intersectsWithObject === 'function') {
    //                     shouldErase = (obj as any).intersectsWithObject(eraserCircle);
    //                 } else {
    //                     // Method 3: Simple bounds check
    //                     const bounds = obj.getBoundingRect();
    //                     shouldErase = p.x >= bounds.left && p.x <= bounds.left + bounds.width &&
    //                                  p.y >= bounds.top && p.y <= bounds.top + bounds.height;
    //                 }
    //             }

    //             if (shouldErase) {
    //                 addHoleToObject(obj, p);
    //                 break; // Only erase the topmost object
    //             }
    //         }
    //     }

    //     // Mouse event handlers
    //     const mouseMoveHandler = (opt: fabric.TEvent) => {
    //         if (!isErasing) return;
    //         const p = canvas.getPointer(opt.e);
    //         eraseAtPointer(p);
    //     };

    //     const mouseUpHandler = () => {
    //         isErasing = false;
    //         canvas.off('mouse:move', mouseMoveHandler);
    //         canvas.off('mouse:up', mouseUpHandler);
    //     };

    //     // Start erasing
    //     isErasing = true;
    //     eraseAtPointer(pointer); // Erase on mouse down
        
    //     // Attach event listeners
    //     canvas.on('mouse:move', mouseMoveHandler);
    //     canvas.on('mouse:up', mouseUpHandler);
        
    //     return;
    // }

const shape = selectedShapeRef.current as ShapeTool;

if (shape === "ruler" || shape === "protracter") {
  isDrawing.current = true;
  const c = canvas as CanvasWithTemp;

  const showAt = (img: fabric.Image) => {
    img.set({ left: pointer.x, top: pointer.y, visible: true });
    addOnTop(canvas, img);
    canvas.requestRenderAll();
    if (shape === "ruler") c._tempRuler = img;
    else c._tempProtractor = img;
  };

  (async () => {
    try {
      const existing =
        shape === "ruler" ? c._tempRuler : c._tempProtractor;

      if (!existing) {
        const img = await FabricImage.fromURL(shapes[shape], {
          crossOrigin: "anonymous",
        });
        img.set({
          selectable: false,
          evented: false,
          opacity: 0.8,
          originX: "center",
          originY: "center",
          excludeFromExport: true,
        });
        showAt(img);
      } else {
        showAt(existing);
      }
    } catch (err) {
      console.error(`Failed to load ${shape} image`, err);
    }
  })();

  return;
}

    console.log(selectedShapeRef.current, target, pointer, "penss")

    canvas.isDrawingMode = false

    if (selectedShapeRef.current === "pen" || selectedShapeRef.current === "freeform") {
    if (!canvas.freeDrawingBrush) {
      const brush = new fabric.PencilBrush(canvas);
      brush.width = 2;
      brush.color = "#000";
      canvas.freeDrawingBrush = brush;
    }
    canvas.isDrawingMode = true;
    return;
  }

    isDrawing.current = false;
    canvas.freeDrawingBrush = undefined as any
  canvas.isDrawingMode = false;

    canvas.isDrawingMode = false;

    if (
    target &&
    (target.type === selectedShapeRef.current ||
      target.type === "activeSelection")
  ) {
    isDrawing.current = false;

    canvas.setActiveObject(target);

    target.setCoords();
  } else {
    isDrawing.current = true;

    shapeRef.current = createSpecificShape(
      selectedShapeRef.current,
      pointer as any
    );

    if (shapeRef.current) {
      canvas.add(shapeRef.current);
    }
  }
}

export const handleCanvasMouseMove = ({
    options,
    canvas,
    isDrawing,
    shapeRef,
    selectedShapeRef,
    syncShapeInStorage
}:CanvasMouseMove) => {

  const shape = selectedShapeRef.current;
  if (shape === "ruler" || shape === "protracter") {
  const c = canvas as CanvasWithTemp;
  const tempImg =
    shape === "ruler" ? c._tempRuler : c._tempProtractor;

  if (isDrawing.current && tempImg) {
    const p = canvas.getPointer(options.e);
    tempImg.set({ left: p.x, top: p.y });
    canvas.requestRenderAll();
  }
  return;
}



    if (!isDrawing.current) return;
  if (selectedShapeRef.current === "freeform" || 
    selectedShapeRef.current === "pen" || 
    selectedShapeRef.current === "eraser"
  ) return;

  canvas.isDrawingMode = false;


  const pointer = canvas.getPointer(options.e);

  switch (selectedShapeRef?.current) {
    case "rectangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "circle":
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;

    case "triangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "line":
      shapeRef.current?.set({
        x1: (shapeRef.current as any)._startX,
        y1: (shapeRef.current as any)._startY,
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    case "dottedline":
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    case "polygon":
      shapeRef.current.set({
        width: pointer.x - (shapeRef.current.left || 0),
        height: pointer.y - (shapeRef.current.top || 0),
      });
      break;

    case "symbol":
    case "pi":
    case "alpha":
    case "mu":
    case "omega":
      // For symbols, typically you just move them rather than resize
      shapeRef.current.set({
        left: pointer.x,
        top: pointer.y,
      });
      break;
    
      case "image":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });

    // Drawing tools
    // case "pen":
    // case "eraser":
    //   // These are typically handled separately in freeform drawing
    //   break;

    default:
      break;
  }

  canvas.renderAll();

  // sync shape in storage
  if (shapeRef.current) {
    console.log(shapeRef.current, "current")
     if (!shapeRef.current.objectId) {
    shapeRef.current.objectId = shapeRef.current.id; // or generate UUID
  }
    syncShapeInStorage(shapeRef.current);
  }
}

export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  setActiveElement,
}: CanvasMouseUp) => {
  isDrawing.current = false;
  if (selectedShapeRef.current === "freeform" || 
    selectedShapeRef.current === "pen" 
  ) return;

  if (selectedShapeRef.current === "eraser") {
  // Eraser also triggers path:created, so no manual sync here
  // Just stop drawing mode
  canvas.isDrawingMode = false;
  canvas.freeDrawingBrush = undefined as any;
  return;
}


  const shape = selectedShapeRef.current;
  if (shape === "ruler" || shape === "protracter") {
  const c = canvas as CanvasWithTemp;
  const tempImg =
    shape === "ruler" ? c._tempRuler : c._tempProtractor;

  if (tempImg) {
    tempImg.set({ visible: false });
    canvas.requestRenderAll();
  }
  return;
}

  // if (selectedShapeRef.current === "ruler") {
  //   const c = canvas as CanvasWithTemp;
  //   if (c._tempRuler) {
  //     c._tempRuler.set({ visible: false });
  //     canvas.requestRenderAll();
  //   }
  //   return; // keep tool selected (sticky)
  // }

  // sync shape in storage as drawing is stopped
  syncShapeInStorage(shapeRef.current);
  // if (shapeRef.current) {
  //   syncShapeInStorage(shapeRef.current);
  //   shapeRef.current = null; // Important to reset this
  // }
  
  // set everything to null
  shapeRef.current = null;
  activeObjectRef.current = null;
  selectedShapeRef.current = null;

  // if canvas is not in drawing mode, set active element to default nav element after 700ms
  if (!canvas.isDrawingMode) {
    setTimeout(() => {
      setActiveElement(defaultNavElement);
    }, 700);
  }
};

export const handleCanvasObjectModified = ({
  options,
  syncShapeInStorage,
}: CanvasObjectModified) => {
  const target = options.target;
  console.log(target, "target")
  if (!target) return;

  if (target?.type == "activeSelection") {
    // fix this
  }else {
    syncShapeInStorage(target);
  }
};

export const handleCanvasSelectionCreated = ({
  options,
  isEditingRef,
  setElementAttributes,
}: CanvasSelectionCreated) => {
  // if user is editing manually, return
  if (isEditingRef.current) return;

  // if no element is selected, return
  if (!options?.selected) return;

  // get the selected element
  const selectedElement = options?.selected[0] as FabricObject;

  // if only one element is selected, set element attributes
  if (selectedElement && options.selected.length === 1) {
    // calculate scaled dimensions of the object
    const scaledWidth = selectedElement?.scaleX
      ? selectedElement?.width! * selectedElement?.scaleX
      : selectedElement?.width;

    const scaledHeight = selectedElement?.scaleY
      ? selectedElement?.height! * selectedElement?.scaleY
      : selectedElement?.height;

    setElementAttributes({
      width: scaledWidth?.toFixed(0).toString() || "",
      height: scaledHeight?.toFixed(0).toString() || "",
      fill: selectedElement?.fill?.toString() || "",
      // @ts-ignore
      stroke: selectedElement?.stroke || "",
      // @ts-ignore
      fontSize: selectedElement?.fontSize || "",
      // @ts-ignore
      fontFamily: selectedElement?.fontFamily || "",
      // @ts-ignore
      fontWeight: selectedElement?.fontWeight || "",
    });
  }
};

export const handleCanvasObjectScaling = ({
  options,
  setElementAttributes,
}: CanvasObjectScaling) => {
  const selectedElement = options.target;

  // calculate scaled dimensions of the object
  const scaledWidth = selectedElement?.scaleX
    ? selectedElement?.width! * selectedElement?.scaleX
    : selectedElement?.width;

  const scaledHeight = selectedElement?.scaleY
    ? selectedElement?.height! * selectedElement?.scaleY
    : selectedElement?.height;

  setElementAttributes((prev) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || "",
    height: scaledHeight?.toFixed(0).toString() || "",
  }));
};

export const handlePathCreated = ({
  options,
  syncShapeInStorage,
}: CanvasPathCreated) => {
  // get path object
  const path = options.path;
  if (!path) return;
  
  // set unique id to path object
  path.set({
    objectId: uuid4(),
    selectable: true,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    strokeUniform: true
  });

  // sync shape in storage
  syncShapeInStorage(path);
};

export const handleResize = ({ 
  canvasEl,
  canvas
}: { 
  canvasEl: HTMLCanvasElement | null;
  canvas: Canvas | null;
}) => {
  // const canvasElement = document.getElementById("canvas");
  if (!canvasEl || !canvas) return;

  const container = canvasEl.parentElement; // Absolute div in CanvasLayer
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // alert(`Resizing canvas: width=${width}, height=${height} (container: ${container.tagName}#${container.id || 'no-id'})`)

  canvasEl.style.width = `${width}px`;
  canvasEl.style.height = `${height}px`;

  canvas.setDimensions({ width, height });

  // if (!canvas) return;

  // canvas?.setDimensions({
  //   width: canvasEl.clientWidth,
  //   height: canvasEl.clientHeight,
  // });
}

// export const renderCanvas = ({
//   fabricRef,
//   activeObjectRef,
// }: {
//   fabricRef: React.MutableRefObject<Canvas | null>;
//   activeObjectRef: React.MutableRefObject<FabricObject | null>;
// }) => {
//   // Clear canvas but preserve active object
//   const activeObject = activeObjectRef?.current;
//   fabricRef?.current?.clear();

//   // Re-add only the active object if it exists
//   if (activeObject) {
//     fabricRef?.current?.add(activeObject);
//     fabricRef?.current?.setActiveObject(activeObject);
//   }

//   fabricRef?.current?.renderAll();
// };