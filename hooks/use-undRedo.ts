// useUndoRedo.js - Super minimal
import { useRef } from 'react';

export const useUndoRedo = (socket, boardId) => {
  const history = useRef({});
  const isApplying = useRef(false);

  const save = (canvasId, canvas) => {
    if (isApplying.current) return;
    
    if (!history.current[canvasId]) {
      history.current[canvasId] = { states: [], index: -1 };
    }
    
    const h = history.current[canvasId];
    const state = JSON.stringify(canvas.toJSON());
    
    h.states = h.states.slice(0, h.index + 1);
    h.states.push(state);
    h.index = h.states.length - 1;
    
    if (h.states.length > 20) h.states.shift();
  };

  const undo = (canvasId, canvas) => {
    const h = history.current[canvasId];
    if (!h || h.index <= 0) return;
    
    h.index--;
    isApplying.current = true;
    
    canvas.loadFromJSON(h.states[h.index], () => {
      canvas.renderAll();
      isApplying.current = false;
    });
    
    socket.emit("canvas-undo", { boardId, canvasId, index: h.index });
  };

  const redo = (canvasId, canvas) => {
    const h = history.current[canvasId];
    if (!h || h.index >= h.states.length - 1) return;
    
    h.index++;
    isApplying.current = true;
    
    canvas.loadFromJSON(h.states[h.index], () => {
      canvas.renderAll();
      isApplying.current = false;
    });
    
    socket.emit("canvas-redo", { boardId, canvasId, index: h.index });
  };

  const applyRemote = (canvasId, canvas, index) => {
    const h = history.current[canvasId];
    if (!h || !h.states[index]) return;
    
    h.index = index;
    isApplying.current = true;
    
    canvas.loadFromJSON(h.states[index], () => {
      canvas.renderAll();
      isApplying.current = false;
    });
  };

  return { save, undo, redo, applyRemote };
};