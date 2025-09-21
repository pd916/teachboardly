"use client"
import {Canvas, Object as FabricObject, } from "fabric";
import React, { startTransition, useCallback, useEffect, useState } from 'react'
import { ActiveElement, Attributes } from '@/types/type'
import { defaultNavElement } from '@/constant'
import Navabr from '@/app/(boards)/_component/board-navbar'
import BottomBar from '@/app/(boards)/_component/bottom-bar'
import {v4 as uuidv4} from "uuid";
import Live from '@/app/(boards)/_component/Live'
import { 
  handleCanvasMouseDown, 
  handleCanvasMouseMove, 
  handleCanvasMouseUp, 
  handleCanvasObjectModified, 
  handleCanvasObjectScaling, 
  handleCanvasSelectionCreated, 
  handlePathCreated, 
  handleResize, 
  initializeFabric} from "@/lib/canvas"
import { handleDelete } from "@/lib/key-event"
import { handleImageUpload } from "@/lib/shapes"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useGuestStore } from "@/hooks/use-guest-store"
import { useSession } from "next-auth/react";
import { CanvasData, useCanvasStore } from "@/hooks/use-canvas-store";
import useBoardData from "@/hooks/use-board-data";
import { deleteBoardOnLeave } from "@/actions/board";
import { useCurrentUser } from "@/hooks/use-currentUser";
import { useBoardPresence } from "@/components/provider/provider";
import { useCanvasRealtime } from "@/hooks/use-canvaRealTime";
// import { useFreePlanTimer } from "@/hooks/use-freePlan-Timer";


type Guest = {
  name: string;
  id: string;
  boardId?: string;
};

const Board = () => {
  const router = useRouter();
  const params = useParams()
  const pathname = usePathname();
  const {board} = useBoardData({ boardId: params?.boardId })
  const {currentGuest} = useGuestStore()
  const canvases = useCanvasStore((state) => state.canvases);
  const activeIndex = useCanvasStore((state) => state.activeIndex);
  const addCanvas = useCanvasStore((state) => state.addCanvas);
  const {user:userplan} = useCurrentUser()
  // const addHistory = useCanvasStore((state) => state.addHistory);
  // const undo = useCanvasStore((state) => state.undo);
  // const redo = useCanvasStore((state) => state.redo);
  const {data:session} = useSession();
   const isUser = session?.user;
   const canvaFabric = canvases[activeIndex];
   const userPlan = userplan?.subscription[0].status
  //  useFreePlanTimer({
  //   boardId:params?.boardId,
  //   user:isUser
  //  })
   console.log( canvaFabric?.history, canvaFabric?.historyIndex, userPlan, "pensss")

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: '',
    height: '',
    fontSize: '',
    fontWeight: '',
    fontFamily: '',
    fill: '#aabbcc',
    stroke: '#aabbcc',
  })
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name:"",
    value:"",
    icon:""
  })

  const {emitUpdateShape, emitDeleteShape, emitResetCanvas} = useCanvasRealtime(params?.boardId, currentGuest?.id)

  const syncShapeInStorage = useCallback((object:any) => {
    if(!object) return;
    
    const shapeData = object.toJSON();
    console.log(object, shapeData.objectId, shapeData, "its object")

    shapeData.objectId = object.id || object.objectId;

     if (object.clipPath) {
            try {
                // Convert clipPath to JSON string to ensure proper transmission
                const clipPathData = object.clipPath.toJSON ? object.clipPath.toJSON() : object.clipPath;
                shapeData.clipPath = typeof clipPathData === 'string' ? clipPathData : JSON.stringify(clipPathData);
                console.log("Syncing object with clipPath:", shapeData.clipPath);
            } catch (clipError) {
                console.error("Failed to serialize clipPath:", clipError);
                // Still sync the object even if clipPath fails
                delete shapeData.clipPath;
            }
        }

    emitUpdateShape(shapeData);

  console.log("Shape emitted", shapeData);
  },[emitUpdateShape])

  const deleteShapeFromStorage = useCallback((objectId:string) => {
    if(!objectId) return;

    emitDeleteShape(objectId);
  },[emitDeleteShape])

  const handleActiveElement = useCallback ((elem: ActiveElement) =>{
    const { canvases, activeIndex } = useCanvasStore.getState(); // always fresh
  const currentCanvaFabric = canvases[activeIndex];
    console.log(currentCanvaFabric, canvaFabric, elem, "cominggggggg")
    setActiveElement(elem);
    const canvas = currentCanvaFabric?.fabricRef?.current;

    const prevTool = currentCanvaFabric?.selectedShapeRef?.current;
  if ((prevTool === "pen" || prevTool === "freeform" || prevTool === "eraser") && canvas) {
    canvas.isDrawingMode = false;
    // use null or undefined; both are fine
    canvas.freeDrawingBrush = null as any;
    canvas.skipTargetFind = false;
    if (canvas.isDrawingMode) canvas.isDrawingMode = false;
  }

     switch (elem?.value) {
      case 'reset':
         if (canvas) canvas.clear();
         emitResetCanvas()
        setActiveElement(defaultNavElement)
        break;
    case "delete" :
      //  const activeCanvas = canvases[activeIndex]?.fabricCanvas;
      if (canvas) handleDelete(canvas as any, deleteShapeFromStorage);
      setActiveElement(defaultNavElement)
      break;
    case "image": 
    currentCanvaFabric.imageInputRef.current?.click();
    currentCanvaFabric.isDrawing.current = false;
    
    if (canvas) canvas.isDrawingMode = false;
    break;
      default:
        break;
        
      }

      if (currentCanvaFabric){
        currentCanvaFabric.selectedShapeRef.current = elem?.value as string | null;
      }
  },[setActiveElement, emitResetCanvas]) 

  useEffect(() => {
  if (canvases.length === 0) {
    const domRef = React.createRef<HTMLCanvasElement>();
    const fabricRef = React.createRef<Canvas | null>();
    const shapeRef = { current: null } as React.RefObject<FabricObject | null>;
    const selectedShapeRef = { current: null } as React.RefObject<string | null>;
     const isDrawing =  { current: false } as React.RefObject<boolean>;
     const imageInputRef = { current: null } as React.RefObject<HTMLInputElement | null>; 
    const activeObjectRef = { current: null } as React.RefObject<FabricObject | null>;
    const isEditingRef =  { current: false } as React.RefObject<boolean>;

    addCanvas({
      id: uuidv4(),
      domRef,
      fabricRef,
      shapeRef,
      selectedShapeRef,
      isDrawing,
      imageInputRef,
      activeObjectRef,
      isEditingRef,
      history: [],        // start empty
      historyIndex: 0
    });
  }
}, []);

  useEffect(() => {
     const currentCanvasFabric = canvases[activeIndex];
      const domRefCurrent = currentCanvasFabric?.domRef.current;
      console.log('Effect running for canvas', currentCanvasFabric?.id, domRefCurrent);
      if (!domRefCurrent) return;
  

     let canvas: Canvas | null = null;


     if (currentCanvasFabric.fabricRef.current) {
      canvas = currentCanvasFabric.fabricRef.current
    } else {
        canvas = initializeFabric({
          canvasEl: currentCanvasFabric.domRef.current,
          fabricCanva: currentCanvasFabric.fabricRef,
        })
    }   

      console.log(canvas, "coming")
      
    canvas?.off();
    

    canvas?.on('mouse:down', (options: any) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing:currentCanvasFabric.isDrawing,
        shapeRef:currentCanvasFabric.shapeRef,
        selectedShapeRef:currentCanvasFabric.selectedShapeRef,
        syncShapeInStorage
      })
    })
    
    canvas?.on('mouse:move', (options:any) => {
        handleCanvasMouseMove({
          options,
        canvas,
        isDrawing:currentCanvasFabric.isDrawing,
        shapeRef:currentCanvasFabric.shapeRef,
        selectedShapeRef:currentCanvasFabric.selectedShapeRef,
        syncShapeInStorage
      })
    })

    canvas?.on("mouse:up", ()=> {
      handleCanvasMouseUp({
        canvas,
        isDrawing:currentCanvasFabric.isDrawing,
        shapeRef:currentCanvasFabric.shapeRef,
        selectedShapeRef:currentCanvasFabric.selectedShapeRef,
        setActiveElement,
        syncShapeInStorage,
        activeObjectRef:currentCanvasFabric.activeObjectRef
      })
    })

    canvas?.on("object:modified", (options: any) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage
      })
    })

    canvas?.on("selection:created", (options: any) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef:currentCanvasFabric?.isEditingRef,
        setElementAttributes,
      })
    })

    canvas?.on("object:scaling", (options: any) => {
      handleCanvasObjectScaling({
        options, setElementAttributes
      })
    })

    canvas?.on("path:created", (options: any) => {
      handlePathCreated({
        options,
        syncShapeInStorage
      })
    })
    
// Inside your main hook
//  let snapshotTimeout: ReturnType<typeof setTimeout>;
  
//   const snapshot = () => {
//     if (!canvas || !currentCanvasFabric?.id) return;
//     if (isApplyingRemoteChangeRef.current) return;
    
//     clearTimeout(snapshotTimeout);
    
//     snapshotTimeout = setTimeout(() => {
//       const canvasState = JSON.stringify(canvas.toJSON());
//       const currentHistory = currentCanvasFabric.history[currentCanvasFabric.historyIndex];
      
//       if (currentHistory !== canvasState) {
//         // addHistory(currentCanvasFabric.id, canvasState);
//         socket.emit("sync-history", {
//       boardId: params?.boardId,
//       canvasId: currentCanvasFabric.id,
//       canvasState
//     });
//       }
//     }, 200);
//   };

//   // Add history event listeners
//   canvas.on('object:added', snapshot);
//   canvas.on('object:removed', snapshot);
//   canvas.on('object:modified', snapshot);
//   canvas.on('path:created', snapshot);

  
  const resizeHandler = () => {
    handleResize({canvasEl: currentCanvasFabric?.domRef?.current, canvas })
  }
  
  window.addEventListener("resize", resizeHandler)
  
  return () => {
    canvas?.off();
    window.removeEventListener("resize", resizeHandler );
  }
  },[activeIndex, canvases])


  useEffect(() => {
    if(!board?.canvasData || !canvaFabric?.fabricRef?.current) return;

    const fabricCanvas = canvaFabric.fabricRef.current;
     const canvasJSON =
      typeof board.canvasData === "string"
        ? JSON.parse(board.canvasData)
        : board.canvasData;

    fabricCanvas.clear();

    fabricCanvas.loadFromJSON(canvasJSON, () => {
      fabricCanvas.requestRenderAll();
    });
    
  }, [board?.canvasData, canvaFabric]);

 
  useEffect(() => {
  // Early return if not a user or no boardId
  if (!isUser || !params?.boardId) return;
  
  const boardId = params.boardId as string;
  const currentBoardPath = `/board/${boardId}`;
  
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    // Only run if currently on this board page
    if (window.location.pathname === currentBoardPath) {
      startTransition(async () => {
        try {
          await deleteBoardOnLeave(boardId);
        } catch (error) {
          console.log(error);
        }
      });
    }
  };
  
  // Add the event listener
  window.addEventListener("beforeunload", handleBeforeUnload);
  
  // Cleanup function
  return () => {
    // Remove the event listener
    window.removeEventListener("beforeunload", handleBeforeUnload);
    
    // Handle navigation away from board page
    // This runs when component unmounts (navigation)
    if (isUser && window.location.pathname !== currentBoardPath) {
      startTransition(async () => {
        try {
          await deleteBoardOnLeave(boardId);
        } catch (error) {
          console.log(error);
        }
      });
    }
  };
}, [isUser, params?.boardId, pathname, startTransition]);


const {isDrawingEnabled} = useBoardPresence(params?.boardId, {
  id: currentGuest?.id,
  name: currentGuest?.name,
  boardId: params?.boardId ?? ""
})

useEffect(() => {
  const canvas = canvaFabric?.fabricRef.current;
  if (!canvas) return;

  const enable = !!isUser || isDrawingEnabled;
  console.log(isDrawingEnabled, "able", enable)

  // FIXED: Properly handle canvas interaction state
  canvas.selection = enable;
  canvas.skipTargetFind = !enable; // IMPORTANT: This prevents object selection when disabled
  
  // Enable/disable objects
  canvas?.forEachObject(obj => {
    obj.selectable = enable;
    obj.evented = enable;
  });

  // FIXED: Don't disable pointer events on upperCanvasEl - let canvas handle it internally
  // This was causing the issue where events weren't firing after re-enabling
  if (canvas?.upperCanvasEl) {
    // Instead of disabling pointer events, let fabric handle interaction through skipTargetFind
    canvas.upperCanvasEl.style.cursor = enable ? 'default' : 'not-allowed';
  }

  // FIXED: Force canvas to refresh its state
  canvas.requestRenderAll();
  
  console.log("Canvas permissions updated:", { enable, selection: canvas.selection, skipTargetFind: canvas.skipTargetFind });

}, [isUser, isDrawingEnabled, canvaFabric?.fabricRef]);



  return (
    <div className="h-screen flex flex-col">
      <Navabr
      boardId={params?.boardId}
      hostId={isUser?.id}
      hostname={session?.user?.name}
      />

        <main className="flex-1 bg-gray-50 pl-18 overflow-hidden">
        <Live 
        canvases={canvases}
        isUser={!!isUser}
        isDrawingEnabled={isDrawingEnabled}
        />
        </main>

      <div className="min-w-28 px-2 py-4 flex items-center justify-center bg-gray-50">
        {(isUser || isDrawingEnabled) && (
          <BottomBar
          activeElement={activeElement}
          isUser={isUser}
          userplan={userPlan}
          handleActiveElement={handleActiveElement}
          imageInputRef={canvaFabric?.imageInputRef}
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          syncShapeInStorage={syncShapeInStorage}
          canvasRef={canvaFabric?.domRef}
         boardId={params?.boardId}
        canvaFabric={canvaFabric?.fabricRef}
        isEditingRef={canvaFabric?.isEditingRef}
        activeObjectRef={canvaFabric?.activeObjectRef}
        handleImageUpload={(e: any) => {
          e.stopPropagation();
          
          handleImageUpload({
            file: e.target.files[0],
            canvas: canvaFabric?.fabricRef as any,
            shapeRef:canvaFabric.shapeRef,
            syncShapeInStorage,
          })
        }}
        />
      )}
      </div>
    </div>
  )
}

export default Board