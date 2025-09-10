import { Canvas, FabricObject } from 'fabric';
import React from 'react';
import { create } from 'zustand';

export const isApplyingRemoteChangeRef = { current: false };

export type CanvasData = {
  id: string;
  domRef: React.RefObject<HTMLCanvasElement | null>;
  fabricRef: React.MutableRefObject<Canvas | null>;
  shapeRef: React.RefObject<FabricObject | null>;
  isDrawing: React.RefObject<boolean>;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  selectedShapeRef: React.RefObject<string | null>;
  activeObjectRef: React.RefObject<FabricObject | null>;
  isEditingRef: React.RefObject<boolean | null>;
  history: string[];   
  historyIndex: number; 
};

type CanvasStore = {
  canvases: CanvasData[];
  activeIndex: number;
  addCanvas: (canva: CanvasData) => void;
  next: () => void;
  prev: () => void;
  // addHistory: (id: string, json: string) => void;
  // undo: (id: string, isRemote?: boolean) => void;
  // redo: (id: string, isRemote?: boolean) => void;

};


export const useCanvasStore = create<CanvasStore>((set, get) => ({
    canvases: [],
    activeIndex: 0,
    addCanvas: (canvasData) => {
        set((state) => {
        const newCanvases = [...state.canvases, canvasData];
              return {
          canvases: newCanvases,
          activeIndex: newCanvases.length - 1,
        };
      });
    },
  next: () => {
    const { activeIndex, canvases } = get();
    if (activeIndex < canvases.length - 1) {
      set({ activeIndex: activeIndex + 1 });
    }
  },

 prev: () => {
    const { activeIndex} = get();
    set({ activeIndex: Math.max(0, activeIndex - 1) });
  },

// Keep addHistory exactly the same


      

// Keep addHistory exactly the same
// addHistory: (id, json) => {
//   set((state) => {
//     const canvases = state.canvases.map((c) => {
//       if (c.id !== id) return c;

//       // Skip if identical to current history entry
//       if (c?.history[c?.historyIndex] === json) return c;

//       const trimmedHistory = c.history.slice(0, c.historyIndex + 1);
//       trimmedHistory.push(json);

//       if (trimmedHistory.length > 50) trimmedHistory.shift();
//       return {
//         ...c,
//         history: trimmedHistory,
//         historyIndex: trimmedHistory.length - 1,
//       };
//     });
//     return { canvases };
//   });
// },

// // ✅ FIXED UNDO - Clear and redraw completely
// undo: (id) => {
//   set((state) => {
//     const canvases = state.canvases.map((c) => {
//       if (c.id !== id) return c;
//       if (c?.historyIndex <= 0) return c;

//       const newIndex = c.historyIndex - 1;
//       const canvas = c.fabricRef?.current;
//       if (canvas) {
//         // Clear canvas completely first
//         canvas.clear();
        
//         // Load previous state
//         canvas.loadFromJSON(c.history[newIndex], () => {
//           // Force multiple renders to ensure visibility
//           canvas.renderAll();
//           canvas.requestRenderAll();
          
//           // Additional render after a tiny delay
//           setTimeout(() => {
//             canvas.renderAll();
//           }, 50);
//         });
//       }

//       return { ...c, historyIndex: newIndex };
//     });
//     return { canvases };
//   });
// },

// // ✅ FIXED REDO - Clear and redraw completely
// redo: (id) => {
//   set((state) => {
//     const canvases = state.canvases.map((c) => {
//       if (c.id !== id) return c;
//       if (c.historyIndex >= c.history.length - 1) return c;

//       const newIndex = c.historyIndex + 1;
//       const canvas = c.fabricRef?.current;
//       if (canvas) {
//         // Clear canvas completely first
//         canvas.clear();
        
//         // Load next state
//         canvas.loadFromJSON(c.history[newIndex], () => {
//           // Force multiple renders to ensure visibility
//           canvas.renderAll();
//           canvas.requestRenderAll();
          
//           // Additional render after a tiny delay
//           setTimeout(() => {
//             canvas.renderAll();
//           }, 50);
//         });
//       }

//       return { ...c, historyIndex: newIndex };
//     });
//     return { canvases };
//   });
// },



}))

