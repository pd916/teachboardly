"use client"
import {Canvas, Object as FabricObject, } from "fabric";
import * as fabric from "fabric"
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
import { useSocket } from "@/components/provider/socket-provider"
import { useGuestStore } from "@/hooks/use-guest-store"
import { useSession } from "next-auth/react";
import { CanvasData, useCanvasStore } from "@/hooks/use-canvas-store";
import useBoardData from "@/hooks/use-board-data";
import { deleteBoardOnLeave } from "@/actions/board";
import { useCurrentUser } from "@/hooks/use-currentUser";
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
  const {guests, addGuest, currentGuest, removeGuest} = useGuestStore()
  const canvases = useCanvasStore((state) => state.canvases);
  const activeIndex = useCanvasStore((state) => state.activeIndex);
  const addCanvas = useCanvasStore((state) => state.addCanvas);
  const {user:userplan} = useCurrentUser()
  // const addHistory = useCanvasStore((state) => state.addHistory);
  // const undo = useCanvasStore((state) => state.undo);
  // const redo = useCanvasStore((state) => state.redo);
  const {data:session} = useSession();
  const {socket} = useSocket();
   const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
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

  const syncShapeInStorage = useCallback((object:any) => {
    if(!object || !socket) return;
    
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

 
// FIXED: Socket hook handles both admin and participants
// useEffect(() => {
//   if (!socket) return;

//   const handleSyncHistory = ({canvasId, canvasState}:{canvasId:string, canvasState:string}) => {
//     alert(`canvadID: ${canvasId} ${canvasState}`)
//     addHistory(canvasId, canvasState);
    
//   }

//   const handleUndoRemote = ({canvasId}:{canvasId:string}) => {
//     console.log("Received undo for canvas:", canvasId);
//     alert(canvasId)
//     undo(canvasId, true);
//   }

//   const handleRedoRemote = ({canvasId}:{canvasId:string}) => {
//     console.log("Received redo for canvas:", canvasId);
//     alert(canvasId)
//     redo(canvasId, true);
//   }

//   socket.on("history-synched", handleSyncHistory);
//   socket.on("undo-canva", handleUndoRemote);
//   socket.on("redo-canva", handleRedoRemote);

//   return () => {
//     socket.off("history-synched", handleSyncHistory);
//     socket.off("undo-canva", handleUndoRemote);
//     socket.off("redo-canva", handleRedoRemote);
//   }
// }, [socket]);


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
                        console.log("✅ Exact clipPath applied with preserved positions");
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
            console.log(`✅ Updated existing shape with exact eraser positions`, shape.objectId);
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
                console.log("✅ Added new shape with exact clipPath positions", shape.objectId);
            })
            .catch((err) => {
                console.error("❌ Failed to enliven new object:", err);
            });
    };

    socket.on("shape-updated", handleShapeUpdate);

    return () => {
        socket.off("shape-updated", handleShapeUpdate);
    };
}, [socket, activeIndex]);


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
        isUser={!!isUser}
        isDrawingEnabled={isDrawingEnabled}
        />
        </main>

      <div className="min-w-28 px-2 py-4 flex items-center justify-center bg-gray-50">
        {(isUser || isDrawingEnabled) && (
          <BottomBar
          activeElement={activeElement}
          isUser={isUser}
          userplan={userPlan!}
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


