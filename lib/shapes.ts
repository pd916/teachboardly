import { CustomFabricObject, ImageUpload, ModifyShape } from "@/types/type";
import {Rect, Path, IText, Group,  Circle, Triangle, Line, Polygon, FabricImage} from "fabric"

import { v4 as uuidv4 } from "uuid";


export const createRectangle = (pointer: PointerEvent) => {
    const rect = new Rect({
        top: pointer.x,
        left: pointer.y,
        width: 100,
        height: 100,
        fill: "#aabbcc",
        objectId: uuidv4(),
    }as CustomFabricObject<Rect>)
    return rect
}

export const createEraser = (pointer: PointerEvent) => {
    const pathData = `M ${pointer.x} ${pointer.y} L ${pointer.x + 0.1} ${pointer.y + 0.1}`;

  const eraserPath = new Path(pathData, {
    strokeWidth: 20,          // eraser size
    stroke: 'rgba(0,0,0,1)',  // stroke color doesn't matter due to composite mode
    globalCompositeOperation: 'destination-out', // makes it erase instead of draw
    fill: "",
    objectId: uuidv4(),
  });

  return eraserPath;   
}

export const createCircle = (pointer:PointerEvent) => {
    return new Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 100,
    fill: "#aabbcc",
    objectId: uuidv4(),
  } as any);
}

export const createTriangle = (pointer:PointerEvent) => {
     return new Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: "#aabbcc",
    erasable: true, 
    objectId: uuidv4(),
  }as unknown as CustomFabricObject<Triangle>);
}

export const createLine = (pointer: { x: number; y: number }) => {
  const x1 = pointer.x;
  const y1 = pointer.y;
  const x2 = pointer.x + 100;
  const y2 = pointer.y;

  const objectId = uuidv4(); // generate once

  // Create main line
  const line = new Line([x1, y1, x2, y2], {
    stroke: "#aabbcc",
    strokeWidth: 2,
  });
  line.set("objectId", objectId); // assign custom property

  // Create arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowSize = 10;
  const arrow = new Triangle({
    left: x2,
    top: y2,
    originX: "center",
    originY: "center",
    width: arrowSize,
    height: arrowSize,
    fill: "#aabbcc",
    angle: (angle * 180) / Math.PI + 90,
    selectable: false,
  });
  arrow.set("objectId", objectId); // assign same ID if needed

  // Group line + arrow
  const group = new Group([line, arrow], {
    selectable: true,
  });
  group.set("objectId", objectId); // assign ID to group

  return group;
};

export const createDottedline = (pointer:PointerEvent) => {
     const length = 100; // length of the line

  const dottedLine = new Line(
    [pointer.x, pointer.y, pointer.x + length, pointer.y], // horizontal line
    {
      stroke: "#aabbcc",
      strokeWidth: 2,
      strokeDashArray: [5, 5], // creates dotted/dashed effect: 5px dash, 5px gap
    }
  );

  // Add custom property after creation
  (dottedLine as any)._startX = pointer.x;
  (dottedLine as any)._startY = pointer.y;
  (dottedLine as any).objectId = uuidv4();

  return dottedLine;
}

export const createPolygon = (pointer: PointerEvent) => {
    const sides = 6;      // Change this to 5, 8, etc. for different shapes
  const radius = 50;
  const angleStep = (2 * Math.PI) / sides;

  // Generate the points around the center (pointer)
  const points = Array.from({ length: sides }).map((_, i) => ({
    x: pointer.x + radius * Math.cos(i * angleStep),
    y: pointer.y + radius * Math.sin(i * angleStep),
  }));

  const polygon = new Polygon(points, {
    fill: "#aabbcc",
    stroke: "#000000",
    strokeWidth: 1,
    objectId: uuidv4(),
  } as any); // or as CustomFabricObject<Polygon>

  return polygon;
}

export const createPi = (pointer: PointerEvent) => {
  return new IText("π", {
    left: pointer.x,
    top: pointer.y,
    fontSize: 48,
    fill: "black",
    objectId: uuidv4(),
  });
};

export const createAlpha = (pointer: PointerEvent) => {
  return new IText("α", {
    left: pointer.x,
    top: pointer.y,
    fontSize: 48,
    fill: "black",
    objectId: uuidv4(),
  });
};

export const createMu = (pointer: PointerEvent) => {
  return new IText("μ", {
    left: pointer.x,
    top: pointer.y,
    fontSize: 48,
    fill: "black",
    objectId: uuidv4(),
  });
};


export const createOmega = (pointer: PointerEvent) => {
  return new IText("ω", {
    left: pointer.x,
    top: pointer.y,
    fontSize: 48,
    fill: "black",
    fontFamily: "Arial",
    objectId: uuidv4(),
  });
};

export const createSquare = (pointer: PointerEvent) => {
  return new IText("x²", {
    left: pointer.x,
    top: pointer.y,
    fontSize: 48,
    fill: "black",
    fontFamily: "Arial",
    objectId: uuidv4(),
  });
};

export const createSymbol = (pointer: PointerEvent) => {
  return new IText("∑", {
    left: pointer.x,
    top: pointer.y,
    fontSize: 48,
    fill: "black",
    objectId: uuidv4(),
  });
};

export const createText = (pointer: PointerEvent, text: string) => {
  return new IText(text, {
    left: pointer.x,
    top: pointer.y,
    fill: "#aabbcc",
    fontFamily: "Helvetica",
    fontSize: 36,
    fontWeight: "400",
    objectId: uuidv4(),
    selectable: true,        // allow selection
    editable: true,          // allow editing text
    hasControls: true,       // show resize/rotate handles
    lockScalingFlip: true 
  });
};

export const createSpecificShape = (
  shapeType: string,
  pointer: PointerEvent
) => {
  switch (shapeType) {
    case "rectangle":
      return createRectangle(pointer);

    case "eraser":
      return createEraser(pointer);

    case "circle":
      return createCircle(pointer);

    case "triangle":
      return createTriangle(pointer);

    case "line":
      return createLine(pointer);

    case "dottedline":
      return createDottedline(pointer);

    case "polygon":
      return createPolygon(pointer);
    
       case "pi":
      return createPi(pointer);

    case "alpha":
      return createAlpha(pointer);

    case "mu":
      return createMu(pointer);

    case "omega":
      return createOmega(pointer);

    case "square":
      return createSquare(pointer);

    case "symbol":
      return createSymbol(pointer);

    case "text":
      return createText(pointer, "Tap to Type");

    default:
      return null;
  }
};


export const handleImageUpload = ({
  file,
  canvas,
  shapeRef,
  syncShapeInStorage,
}: ImageUpload) => {
  const reader = new FileReader();
  console.log(reader.result, FabricImage, "img")

   reader.onload = async () => {
    try {
      console.log(reader.result, "Loaded image result");
      const img = await FabricImage.fromURL(reader.result as string, {
        crossOrigin: 'anonymous', // optional, depends on your image source
      });

      img.scaleToWidth(200);
      img.scaleToHeight(200);

      // @ts-ignore
      img.objectId = uuidv4();

      canvas?.current?.add(img);
      shapeRef.current = img;

      // if needed:
      syncShapeInStorage(img);

      canvas?.current?.requestRenderAll();
    } catch (err) {
      console.error("Image load failed:", err);
    }
  }

  reader.readAsDataURL(file);
};

export const modifyShape = ({
  canvas,
  property,
  value,
  activeObjectRef,
  syncShapeInStorage,
}: ModifyShape) => {
  const selectedElement = canvas.getActiveObject();

  if (!selectedElement || selectedElement?.type === "activeSelection") return;

  // if  property is width or height, set the scale of the selected element
  if (property === "width") {
    selectedElement.set("scaleX", 1);
    selectedElement.set("width", value);  
  } else if (property === "height") {
    selectedElement.set("scaleY", 1);
    selectedElement.set("height", value);
  } else {
    if (selectedElement[property as keyof object] === value) return;
    selectedElement.set(property as keyof object, value);
  }

  // set selectedElement to activeObjectRef
  activeObjectRef.current = selectedElement;

  canvas.requestRenderAll()
  syncShapeInStorage(selectedElement);
};


