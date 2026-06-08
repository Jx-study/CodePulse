import type { BaseCanvasProps } from "@/types/components/display";
import type { BaseElement } from "../modules/core/DataLogic/BaseElement";
import type { Link } from "../modules/core/Render/D3Renderer";
import type { StatusColorMap, StatusConfig } from "@/types/statusConfig";
import type { PanelImperativeHandle } from "react-resizable-panels";
import type { AlgorithmViewMode } from "@/types/implementation";
import type { D3CanvasRef } from "../modules/core/Render/D3Canvas";
import type { GraphCanvasRef } from "../modules/core/Render/GraphCanvas";

export type { BaseCanvasProps };

export interface CanvasPanelProps {
  canvasPanelRef: React.RefObject<PanelImperativeHandle | null>;
  isMobile: boolean;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  currentStepData: any;
  allStepsElements?: BaseElement[][];
  currentLinks: Link[];
  canvasSize: { width: number; height: number };
  topicTypeConfig: any;
  currentStatusColorMap: any;
  currentStatusConfig: any;
  isDirected: boolean;
  showBidirectionalArrows: boolean;
  viewMode: AlgorithmViewMode | "";
  isPlaying: boolean;
  currentStep: number;
  activeStepsLength: number;
  playbackSpeed: number;
  handlePlay: () => void;
  handlePause: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  handleResetStep: () => void;
  setPlaybackSpeed: (speed: number) => void;
  handleStepChange: (step: number) => void;
  graphCanvasRef: React.RefObject<GraphCanvasRef | null>;
  d3CanvasRef: React.RefObject<D3CanvasRef | null>;
  useGraphCanvas: boolean;
  showControls: boolean;
}

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
