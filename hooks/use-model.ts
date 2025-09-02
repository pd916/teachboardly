import { Board } from "@prisma/client";
import { create } from "zustand";

export type ModelType = "editProfile" | "createBoard" | "Students" | "Save"
| "Languages" | "Coming soon" | "Chat" | "InviteCode" | "joinLink" | "Calculator";

export interface ModelData {
  boardId?: string;
  board?:Board;
}

interface ModelStore {
  type: ModelType | null;
  data: ModelData;
  isOpen: boolean;
  onOpen: (type: ModelType, data?: ModelData) => void;
  onClose: () => void;
}

export const useModelStore = create<ModelStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data={}) => set({ isOpen: true,  type, data }),
  onClose: () => set({ isOpen: false }),
}));
