import { CanvasData } from "@/hooks/use-canvas-store";
import { Subscription, User } from "@prisma/client";
import {TEvent, Canvas,  FabricObject, TPointerEvent, Path } from "fabric";


export type ActiveElement = {
  name: string;
  value: string;
  icon: string;
} | null;

export type LiteUser = {
  id: string
  name: string
  email: string
  image?: string | null
}


export type BottombarProps = {
  activeElement: ActiveElement;
  imageInputRef?: React.MutableRefObject<HTMLInputElement | null>;
  isUser?: LiteUser;
  userplan: "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELED";
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleActiveElement?: (element: ActiveElement) => void;
  elementAttributes: Attributes;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  canvaFabric: React.RefObject<Canvas | null>;
  activeObjectRef: React.RefObject<FabricObject | null>;
  isEditingRef: React.MutableRefObject<boolean | null>;
  syncShapeInStorage: (obj: any) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  boardId: string | string[] | undefined;
};

export type ShapesMenuProps = {
  item: {
    name: string;
    icon: string;
    value: Array<ActiveElement>;
  };
  activeElement: any;
  handleActiveElement: any;
  handleImageUpload?: any;
  imageInputRef?: any;
};

export type CanvasMouseDown = {
  options: TEvent;
  canvas: Canvas;
  selectedShapeRef: any;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: React.MutableRefObject<FabricObject | null>;
  syncShapeInStorage: (shape: FabricObject) => void;
};

export interface CustomFabricObject<T extends FabricObject>
  extends FabricObject {
  objectId: string;
}

export type CanvasMouseMove = {
  options: TEvent;
  canvas: Canvas;
  isDrawing: React.MutableRefObject<boolean>;
  selectedShapeRef: any;
  shapeRef: any;
  syncShapeInStorage: (shape: FabricObject) => void;
};

export type CanvasMouseUp = {
  canvas: Canvas;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: any;
  activeObjectRef: React.MutableRefObject<FabricObject| null>;
  selectedShapeRef: any;
  syncShapeInStorage: (shape: FabricObject) => void;
  setActiveElement: any;
};

export type CanvasObjectModified = {
  options: {
    target?: FabricObject;
    e: TPointerEvent;
  };
  syncShapeInStorage: (shape: FabricObject) => void;
};

export type Attributes = {
  width: string;
  height: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  fill: string;
  stroke: string;
};

export type CanvasSelectionCreated = {
  options: {
    target?: FabricObject;
    selected?: FabricObject[];
    e: TPointerEvent;
  };
  isEditingRef: React.MutableRefObject<boolean | null>;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
};

export type CanvasObjectScaling = {
   options: {
    target?: FabricObject;
    e: TPointerEvent;
  };
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
};

export type CanvasPathCreated = {
  options: (TEvent & { path: CustomFabricObject<Path> }) | any;
  syncShapeInStorage: (shape: FabricObject) => void;
}

export type RenderCanvas = {
  fabricRef: React.MutableRefObject<Canvas | null>;
  canvasObjects?: any;
  activeObjectRef: any;
};

export type ImageUpload = {
  file: File;
  canvas: React.MutableRefObject<Canvas>;
  shapeRef: React.MutableRefObject<FabricObject | null>;
  syncShapeInStorage: (shape: FabricObject) => void;
};

export type RightSidebarProps = {
  elementAttributes: Attributes;
  setElementAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  fabricRef: React.RefObject<Canvas | null>;
  activeObjectRef: React.RefObject<FabricObject | null>;
  isEditingRef: React.MutableRefObject<boolean | null>;
  syncShapeInStorage: (obj: any) => void;
  boardId: string | string[] | undefined;
};

export type ModifyShape = {
  canvas: Canvas;
  property: string;
  value: any;
  activeObjectRef: React.MutableRefObject<FabricObject | null>;
  syncShapeInStorage: (shape: FabricObject) => void;
};

