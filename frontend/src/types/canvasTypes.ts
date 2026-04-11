import type { BaseElement } from "../modules/core/DataLogic/BaseElement";
import type { Link } from "../modules/core/Render/D3Renderer";
import type { StatusColorMap, StatusConfig } from "@/types/statusConfig";

export interface BaseCanvasProps {
  elements: BaseElement[];
  links?: Link[];
  width?: number;
  height?: number;
  structureType?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  statusColorMap?: StatusColorMap;
  statusConfig?: StatusConfig;
  showStatusLegend?: boolean;
  isDirected?: boolean;
  allStepsElements?: BaseElement[][];
  disableAutoFit?: boolean;
}
