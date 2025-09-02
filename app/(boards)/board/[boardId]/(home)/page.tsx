"use client"
import {Canvas, Object as FabricObject, } from "fabric";
import * as fabric from "fabric"
import React, { startTransition, useCallback, useEffect, useRef, useState } from 'react'
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
import { useModelStore } from "@/hooks/use-model"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useSocket } from "@/components/provider/socket-provider"
import { useGuestStore } from "@/hooks/use-guest-store"
import { useSession } from "next-auth/react";
import { CanvasData, useCanvasStore } from "@/hooks/use-canvas-store";
import useBoardData from "@/hooks/use-board-data";
import { deleteBoardOnLeave } from "@/actions/board";
// import { useFreePlanTimer } from "@/hooks/use-freePlan-Timer";


type Guest = {
  name: string;
  id: string;
  boardId?: string;
};

const Board = () => {
  const {onOpen} = useModelStore((state) => state);
  const router = useRouter();
  const params = useParams()
  const pathname = usePathname();
  const {board} = useBoardData({ boardId: params?.boardId })
  const {guests, addGuest, currentGuest, removeGuest} = useGuestStore()
  const canvases = useCanvasStore((state) => state.canvases);
  const activeIndex = useCanvasStore((state) => state.activeIndex);
  const addCanvas = useCanvasStore((state) => state.addCanvas);
  const addHistory = useCanvasStore((state) => state.addHistory);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const {data:session} = useSession();
  // const isApplyingRemoteChangeRef = useRef(false);
  const {socket} = useSocket();
   const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
   const isUser = session?.user;
   const canvaFabric = canvases[activeIndex];
  //  useFreePlanTimer({
  //   boardId:params?.boardId,
  //   user:isUser
  //  })
   console.log( currentGuest, session?.user, canvaFabric, activeIndex, canvases, guests, board?.canvasData, "pensss")

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

  const syncShapeInStorage = useCallback((object:any) => {
    if(!object || !socket) return;
    
    const shapeData = object.toJSON();
    console.log(object, shapeData.objectId, shapeData, "its object")

    shapeData.objectId = object.id || object.objectId;

    socket.emit("update-shape", {
    boardId:params?.boardId ,
    shape: shapeData,
  });

  console.log("Shape emitted", shapeData);
  },[socket, params?.boardId])

  const deleteShapeFromStorage = useCallback((objectId:string) => {
    if(!objectId || !socket) return;

    socket.emit("shape-deleted", {
      objectId,
      boardId:params?.boardId
    }
    )
  },[])

  const handleActiveElement = useCallback ((elem: ActiveElement) =>{
    const { canvases, activeIndex } = useCanvasStore.getState(); // always fresh
  const currentCanvaFabric = canvases[activeIndex];
    console.log(currentCanvaFabric, canvaFabric, elem, "cominggggggg")
    setActiveElement(elem);
    const canvas = currentCanvaFabric?.fabricRef?.current;

    const prevTool = currentCanvaFabric?.selectedShapeRef?.current;
  if ((prevTool === "pen" || prevTool === "freeform" || prevTool === "eraser") && canvas) {
    // disableFreeDrawing(canvas, currentCanvaFabric.isDrawing);
    canvas.isDrawingMode = false;
    // use null or undefined; both are fine
    canvas.freeDrawingBrush = null as any;
    canvas.skipTargetFind = false;
    if (canvas.isDrawingMode) canvas.isDrawingMode = false;
  }

     switch (elem?.value) {
      case 'reset':
        // deleteAllShapes();
         if (canvas) canvas.clear();
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

    // alert(`active: ${activeElement?.value}`)
    // currentCanvaFabric!.selectedShapeRef!.current = elem?.value as string | null;
  },[setActiveElement]) 

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
  if(!socket) return;

  const handleCanvaAdded = (canva: CanvasData) => {
    console.log(canva)
    const domRef = React.createRef<HTMLCanvasElement>();
          const fabricRef = React.createRef<Canvas | null>();
          const shapeRef = { current: null } as React.RefObject<FabricObject | null>;
          const selectedShapeRef = { current: null } as React.RefObject<string | null>;
           const isDrawing =  { current: false } as React.RefObject<boolean>;
           const imageInputRef = { current: null } as React.RefObject<HTMLInputElement | null>; 
          const activeObjectRef = { current: null } as React.RefObject<FabricObject | null>;
          const isEditingRef =  { current: false } as React.RefObject<boolean>;

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
  const handleCanvasSwitched = ({ index }: { index: number }) => {
    console.log("Switching to index:", index);
    // either expose a setActiveIndex in your store, or call next/prev logic conditionally
    useCanvasStore.setState({ activeIndex: index });
  };

  socket.on("canva-added", handleCanvaAdded);
  socket.on("canvas-switched", handleCanvasSwitched);

   return () => {
    socket.off("canva-added", handleCanvaAdded);
    socket.off("canvas-switched", handleCanvasSwitched);
  };

},[socket, addCanvas])

  useEffect(() => {
     const currentCanvasFabric = canvases[activeIndex];
    // alert(`index: ${canvaFabric?.domRef.current}`)
    if (!currentCanvasFabric?.domRef?.current) return;

     let canvas: Canvas | null = null;
     // const canvas = initializeFabric({canvasRef, fabricRef})

     if (currentCanvasFabric.fabricRef.current) {
      // Reuse existing fabric canvas
      canvas = currentCanvasFabric.fabricRef.current
    } else {
      // Initialize new fabric canvas
        canvas = initializeFabric({
          canvasEl: currentCanvasFabric.domRef.current,
          fabricCanva: currentCanvasFabric.fabricRef,
        })
    }

    //  if (currentCanvasFabric?.domRef?.current) {
    //    if(!currentCanvasFabric?.fabricRef?.current){
    //     canvas = initializeFabric({ canvasEl: currentCanvasFabric?.domRef?.current, fabricCanva:currentCanvasFabric?.fabricRef })
    //   } else {
    //   canvas = currentCanvasFabric?.fabricRef?.current;
    // }
    // } else {
    //   canvas = currentCanvasFabric?.fabricRef?.current;
    // }

   

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
    

//      let snapshotTimeout: ReturnType<typeof setTimeout>;
//   // const isApplyingRemoteChangeRef = useRef(false); // Use ref instead

//   const snapshot = () => {
  //   if (!canvas || !canvaFabric?.id || isApplyingRemoteChangeRef.current) return;

  //   clearTimeout(snapshotTimeout);
  //   snapshotTimeout = setTimeout(() => {
    //     const canvasState = JSON.stringify(canvas.toJSON());
    //     socket.emit("sync-history", {
//       boardId: params?.boardId,
//       canvasId: canvaFabric.id,
//       canvasState
//     });
//   }, 200);
// };

//   if (canvas && canvas.getObjects().length > 0) {
//   const canvasState = JSON.stringify(canvas.toJSON());
//   socket.emit("add-history", {
//     boardId: params?.boardId,
//     canvasId: canvaFabric.id,
//     canvasState
//   });
// }


//   canvas?.on('object:added', snapshot);
//   canvas?.on('object:removed', snapshot);
//   canvas?.on('path:created', snapshot);


  //   let snapshotTimeout:ReturnType<typeof setTimeout>;
  //   let isApplyingRemoteChange = false;
  // const snapshot = () => {
  //   if (!canvas || !canvaFabric?.id || isApplyingRemoteChange) return;
    
  //   clearTimeout(snapshotTimeout);
  //   snapshotTimeout = setTimeout(() => {
  //     const canvasState = JSON.stringify(canvas.toJSON());
  //     addHistory(canvaFabric.id, JSON.stringify(canvas.toJSON()));

  //     socket.emit("sync-history", {
  //     boardId: params?.boardId,
  //     canvasId: canvaFabric.id,
  //     canvasState
  //   });
  //   }, 200); // Wait for shape to fully complete
  // };

  // // ✅ Save initial state ONLY if canvas has existing objects
  // if (canvas && canvas.getObjects().length > 0) {
  //   addHistory(canvaFabric.id, JSON.stringify(canvas.toJSON()));
  // }

  // // ✅ ONLY listen to object completion events
  // canvas?.on('object:added', snapshot);
  // canvas?.on('object:removed', snapshot);
  // canvas?.on('path:created', snapshot);
  
  const resizeHandler = () => {
    handleResize({canvasEl: currentCanvasFabric?.domRef?.current, canvas })
  }
  
  window.addEventListener("resize", resizeHandler)
  
  return () => {
    canvas?.off();
    window.removeEventListener("resize", resizeHandler );
  }
  },[activeIndex, canvases, canvases[activeIndex]?.domRef?.current])

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

  // Add this at the top of your component (outside useEffect)

// Complete Socket Hook
// useEffect(() => {
//   if (!socket) return;

//   const canvas = canvases[activeIndex]
  
//   socket.on("canvas-undo", ({ canvasId }: {canvasId: string}) => {
//     if (canvasId !== canvaFabric?.id) return;
//     undo(canvasId)
//     // const canvasObj = canvaFabric?.fabricRef?.current;
//     // if (!canvasObj) return;

//     // addHistory(canvasId, canvasState);
//     // isApplyingRemoteChangeRef.current = true; // Set shared flag
//     // canvasObj.loadFromJSON(canvasState, () => {
//     //   canvasObj.renderAll();
//     //   canvasObj.requestRenderAll();
      
//     //   setTimeout(() => {
//     //     isApplyingRemoteChangeRef.current = false; // Reset shared flag
//     //   }, 100);
//     // });
//   });

//   socket.on("canvas-redo", ({ canvasId}: {canvasId: string}) => {
//     if (canvasId !== canvaFabric?.id) return;
//     redo(canvasId)

//     // const canvasObj = canvaFabric?.fabricRef?.current;
//     // if (!canvasObj) return;

//     // addHistory(canvasId, canvasState);
//     // isApplyingRemoteChangeRef.current = true; // Set shared flag
//     // canvasObj.loadFromJSON(canvasState, () => {
//     //   canvasObj.renderAll();
//     //   canvasObj.requestRenderAll();
      
//     //   setTimeout(() => {
//     //     isApplyingRemoteChangeRef.current = false; // Reset shared flag
//     //   }, 100);
//     // });
//   });

//   socket.on("sync-history", ({ canvasId, canvasState }: {canvasId: string, canvasState: string}) => {
//     console.log("[REMOTE-SYNC] Received for:", canvasId, "len:", canvasState.length);
//     if (canvasId !== canvaFabric?.id) return;
    
//     const canvasObj = canvas?.fabricRef?.current;
//     if (!canvasObj) return;

//     // Add to history for sync-history only
//     addHistory(canvasId, canvasState);

//     isApplyingRemoteChangeRef.current = true; // Set shared flag
//     canvasObj.loadFromJSON(canvasState, () => {
//       console.log("[REMOTE-SYNC] Applied");
//       canvasObj.renderAll();
//       canvasObj.requestRenderAll();
      
//       setTimeout(() => {
//         isApplyingRemoteChangeRef.current = false; // Reset shared flag
//       }, 100);
//     });
//   });

//   return () => {
//     socket.off("canvas-undo");
//     socket.off("canvas-redo");
//     socket.off("sync-history");
//   };
// }, [socket, canvaFabric, addHistory]);


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
      
      // Optional: Show browser confirmation dialog
      // event.preventDefault();
      // event.returnValue = '';
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

  useEffect(() => {
    if (!params?.boardId || !socket || !currentGuest) return;

    // const boardId = params.boardId;

    const handleMembers = (members: Guest[]) => {
      console.log(members, "memberrrrooo")
      // members.forEach(addGuest)
    members.forEach(member => {
        addGuest(member);
    });
  };

  const handleNewMember = ({ newMember }: { newMember: Guest }) => {
    console.log(newMember, "memberrrr")
    // if (newMember.id !== currentGuest.id) addGuest(newMember);
    if (newMember.id !== currentGuest.id) {
      addGuest(newMember); // Zustand still prevents duplicates
    }
  };

  socket.on("existing-members", handleMembers);
  socket.on("member-joined", handleNewMember);


    if (!guests.some(guest => guest.id === currentGuest.id)) {

      console.log(params.boardId, currentGuest, "emiting")

      socket.emit("join-board", {
      id: params.boardId,
      profile: {
        id: currentGuest.id,
        name: currentGuest.name,
        boardId: params.boardId
    }
      });
    } 

    return () => {
      socket.off("existing-members", handleMembers);
    socket.off("member-joined", handleNewMember);
    };
  }, [params?.boardId, socket, currentGuest?.id]);

  useEffect(() => {
  if (!socket) return;

  const handleMemberLeft = ({ userId }: { userId: string }) => {
    removeGuest(userId); // Implement removeGuest in your Zustand store
  };

  socket.on("member-left", handleMemberLeft);

  return () => {
    socket.off("member-left", handleMemberLeft);
  };
}, [socket]);

  useEffect(() => {
    if (!socket) return;
    
    const handleShapeUpdate = (shape: any) => {
         const { canvases, activeIndex } = useCanvasStore.getState(); // always fresh

         if (!shape.objectId) {
        console.error("Invalid shape data:", shape);
        return;
        // alert(shape.objectId)
      }
        console.log(shape, "shape")

        const currentCanvaFabric = canvases[activeIndex];

        const canvas = currentCanvaFabric?.fabricRef?.current;
       if (!canvas) return;

            const existing = canvas.getObjects().find((obj: any) => 
              String(obj.objectId) === String(shape.objectId));

        // Update existing object's properties
        if (existing) {
          // existing.set({ ...shape });
          const { type, clipPath, ...propsToSet } = shape;
          if (type.toLowerCase() === 'line') {
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

      // stroke
      stroke: propsToSet.stroke,
      strokeWidth: propsToSet.strokeWidth,
      strokeUniform: propsToSet.strokeUniform,
    });
          } else {
            existing.set(propsToSet);
          }
          // alert(`type: ${type} props:${propsToSet}`)
          // existing.set(propsToSet)
          existing.setCoords();
          canvas.renderAll();
          console.log(`Updated existing shape on canvas`, shape);
          return;
        } 

        if (shape.clipPath) {
       if (shape.clipPath.objects && shape.clipPath.objects.length) {
        shape.clipPath.objects.forEach((clipObj: any) => {
          clipObj.id = shape.objectId;
          clipObj.objectId = shape.objectId;
        });
      }
      }

        fabric.util.enlivenObjects([shape])
          .then((objects) => {
            const canvasObjects = objects.filter(
              (obj): obj is fabric.FabricObject => obj instanceof fabric.Object
            );

            // alert(`Number of objects created: ${canvasObjects.length}`);
            console.log("Enlivened objects:", canvasObjects);

            canvasObjects.forEach((obj) => {
              // @ts-expect-error
              obj.id = shape.objectId;
              // @ts-expect-error
              obj.objectId = shape.objectId;
              canvas.add(obj);
            });

        canvas.renderAll();
        console.log("Added new shape to canvas", shape);
      })
      .catch((err) => {
        console.error("Failed to enliven objects:", err);
      });
          }

       socket.on("shape-updated", handleShapeUpdate);

    return () => {
    socket.off("shape-updated", handleShapeUpdate);
  };
  },[socket, activeIndex])

  useEffect(() => {
      if(!socket) return;

      socket.on("shape-removed", (objectId:string) => {
        if(!objectId) return;


        canvases.forEach((canva) => {
          const fabricCanvas = canva?.fabricRef;
          const fabric = fabricCanvas.current;
          // alert(fabricCanvas?.getObjects)
          if (!fabricCanvas || !fabric) return;

          const target = fabric.getObjects().find((obj:any)=> obj?.objectId === objectId)
          
           if (target) {
          fabric.remove(target);
          fabric.requestRenderAll();
          }
        })
      //    const canvas = fabricRef.current;
      //  if (!canvas) return;

      //   const target = canvases.getObjects().find((obj: any) => obj.objectId === objectId);
      // if (target) {
      // canvas.remove(target);
      // canvas.requestRenderAll();
      // }
      })

      return () => {
        socket.off("shape-removed");
      };
  },[socket])

 useEffect(() => {
  if (!socket) return;

  // ADD THIS:
  const handleSyncHistory = ({canvasId, canvasState}:{canvasId:string, canvasState:string}) => {
    addHistory(canvasId, canvasState);
  }

  const handleUndoRemote = ({canvasId}:{canvasId:string}) => {
    undo(canvasId);
  }
  
  const handleRedoRemote = ({canvasId}:{canvasId:string}) => {
    redo(canvasId);
  }

  socket.on("sync-history", handleSyncHistory); // ADD
  socket.on("canvas-undo", handleUndoRemote);
  socket.on("canvas-redo", handleRedoRemote);

  return () => {
    socket.off("sync-history", handleSyncHistory); // ADD
    socket.off("canvas-undo", handleUndoRemote);
    socket.off("canvas-redo", handleRedoRemote);
  }
}, [socket]);


  useEffect(() => {
  if (!socket) return;

  const handler = (enable: boolean) => {
    console.log(enable, "backend")
    setIsDrawingEnabled(enable);
  };

  socket.on("drawing-toggle", handler);

  return () => {
    socket.off("drawing-toggle", handler);
  };
}, [socket]);

useEffect(() => {
  const canvas = canvaFabric?.fabricRef.current;
  if (!canvas) return;

  const enable = !!isUser || isDrawingEnabled;
  console.log(isDrawingEnabled, "able")

  canvas.selection = enable;
  // canvas.isDrawingMode = enable;
  canvas?.forEachObject(obj => {
    obj.selectable = enable;
    obj.evented = enable;
  });

  canvas?.renderAll();

  if (canvas?.upperCanvasEl) {
    canvas.upperCanvasEl.style.pointerEvents = enable ? 'auto' : 'none';
  }
}, [isUser, isDrawingEnabled]);

useEffect(() => {
  if(!socket) return;

  const handleMemberKicked = ({ kickedMemberId }: { kickedMemberId: string }) => {
    console.log(kickedMemberId, "ids")
    // Assuming you have a Zustand action called removeGuest that takes an id
    removeGuest(kickedMemberId)

    console.log(currentGuest?.id, "current")
    if (currentGuest?.id === kickedMemberId) {
      router.push("/");
    }
  };

  socket.on("member-kicked", handleMemberKicked);

  return () => {
    socket.off("member-kicked", handleMemberKicked);
  };
},[socket])



useEffect(() => {
  if(!socket) return;

  const handleDrawingPermission = ({userId, allowed}:{userId:string, allowed:boolean}) => {
    
    // const userExist = guests.find((i) => i.id === userId)
    console.log(userId, currentGuest, "id")

     if (userId === currentGuest?.id) {
      setIsDrawingEnabled(allowed);
    } 
  }

  socket.on('drawing-enabled', handleDrawingPermission)

  return () => {
    socket.off('drawing-enabled', handleDrawingPermission)
  }
},[socket, currentGuest?.id])


  return (
    <div className="h-screen flex flex-col">
      <Navabr
      />

        <main className="flex-1 bg-gray-50 pl-18 overflow-hidden">
        <Live 
        canvases={canvases}
        // activeIndex={activeIndex}
        // canvaFabric={canvaFabric}
        isDrawingEnabled={isDrawingEnabled}
        />
        </main>

      <div className="min-w-28 px-2 py-4 flex items-center justify-center bg-gray-50">
        {(isUser || isDrawingEnabled) && (
          <BottomBar
          activeElement={activeElement}
          isUser={!!isUser}
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


