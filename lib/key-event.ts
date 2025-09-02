import { CustomFabricObject } from "@/types/type";
import { Canvas } from "fabric";


export const handleDelete = (
  activeCanvas: Canvas,
  deleteShapeFromStorage?: (id: string) => void
) => {
  const activeObjects = activeCanvas?.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;

  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => {
      const customObj = obj as CustomFabricObject<any>;
      if (!customObj?.objectId) return;
      activeCanvas.remove(obj);
      deleteShapeFromStorage?.(customObj?.objectId);
    });
  }

  activeCanvas.discardActiveObject();
  activeCanvas.requestRenderAll();
};