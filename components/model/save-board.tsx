"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useModelStore } from "@/hooks/use-model";
import { useParams, useRouter } from "next/navigation";
import { savedBoard } from "@/actions/board";
import { toast } from "sonner"; // ✅ Make sure this is installed and imported
import { useCanvasStore } from "@/hooks/use-canvas-store";

export const SaveBoard = () => {
  const params = useParams();
  const boardId = params?.boardId as string;
  const router = useRouter();
  const { isOpen, onClose, type } = useModelStore();
  const { canvases, activeIndex } = useCanvasStore((state) => state);
  const activeCanvas = canvases[activeIndex]?.fabricRef?.current;

  const isModalOpen = isOpen && type === "Save";

  const [isLoading, setIsLoading] = useState(false);

  const onSaveBoard = async () => {
    if (!activeCanvas) {
      toast.error("Canvas not found");
      return;
    }
    setIsLoading(true);
    try {
      const canvasJSON = activeCanvas.toJSON();

      await savedBoard(boardId, canvasJSON);
      toast.success("Board saved successfully!");
      onClose(); // Close the modal
      router.refresh(); // Optional: refresh dashboard or current page
    } catch (error: any) {
      toast.error("Upgrade to Premium plan for saving board");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Save Your Board
          </DialogTitle>
          <DialogDescription>
            Save Board allows users to save the current board so they can easily access and continue working on it later from their dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div className="flex items-center mt-2 gap-x-2">
            <Button variant="primary" disabled={isLoading} onClick={onSaveBoard}>
              Yes
            </Button>
            <Button variant="destructive" disabled={isLoading} onClick={onClose}>
              No
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
