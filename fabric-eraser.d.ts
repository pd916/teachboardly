import "fabric";

declare module "fabric" {
  namespace fabric {
    export class EraserBrush extends BaseBrush {
      width: number;
      inverted: boolean;
    }
  }
}
