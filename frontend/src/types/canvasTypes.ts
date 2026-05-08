import type { BaseCanvasProps } from "@/types/components/display";
import type { BaseElement } from "../modules/core/DataLogic/BaseElement";
import type { Link } from "../modules/core/Render/D3Renderer";
import type { StatusColorMap, StatusConfig } from "@/types/statusConfig";

export type { BaseCanvasProps };

export interface D3CanvasProps extends BaseCanvasProps {
  elements: BaseElement[];
  links?: Link[];
  structureType?: string;
  statusColorMap?: StatusColorMap;
  statusConfig?: StatusConfig;
  showStatusLegend?: boolean;
  isDirected?: boolean;
  allStepsElements?: BaseElement[][];
  disableAutoFit?: boolean;
}

export interface AnimatableCanvasRef {
  animateLink: (
    sourceId: string,
    targetId: string,
    toColor: string,
    duration?: number,
    onComplete?: () => void,
  ) => void;
}
