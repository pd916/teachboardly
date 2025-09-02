"use client";

import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModelStore } from "@/hooks/use-model";

// Import desmos-react only on client
const GraphingCalculator = dynamic(
  () => import("desmos-react").then((m) => m.GraphingCalculator),
  { ssr: false }
);

export default function Calculator() {
  const { isOpen, onClose, type } = useModelStore();
  const isModalOpen = isOpen && type === "Calculator";

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden max-w-[95vw] w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader className="pt-4 px-4 pb-2 flex-shrink-0">
          <DialogTitle className="text-xl text-center font-bold">
            Desmos Graphing Calculator
          </DialogTitle>
          <DialogDescription className="sr-only">
            Interactive graphing calculator powered by Desmos.
          </DialogDescription>
        </DialogHeader>

        <GraphingCalculator
          attributes={{ className: "flex-1 w-full h-full min-h-[500px] rounded-lg border" }}
          keypad
          expressions
        />
      </DialogContent>
    </Dialog>
  );
}
