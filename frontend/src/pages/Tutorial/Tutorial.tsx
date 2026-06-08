import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { tutorialService } from "@/services/tutorialService";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useParams } from "react-router-dom";
import { Panel, PanelImperativeHandle } from "react-resizable-panels";
import { DragEndEvent } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Breadcrumb from "@/shared/components/Breadcrumb";
import Button from "@/shared/components/Button";
import { D3Canvas, type D3CanvasRef } from "@/modules/core/Render/D3Canvas";
import {
  GraphCanvas,
  type GraphCanvasRef,
} from "@/modules/core/Render/GraphCanvas";
import type { AnimatableCanvasRef } from "@/types/canvasTypes";
import ControlBar from "@/modules/core/components/ControlBar";
import { toast } from "@/shared/components/Toast";
import type { BreadcrumbItem } from "@/types";
import {
  DEFAULT_LINK_ANIM_CONFIG,
  type AlgorithmViewMode,
} from "@/types/implementation";
import { getImplementationByLevelId } from "@/services/ImplementationService";
import PanelHeader from "./components/PanelHeader";
import { PANEL_REGISTRY } from "./components/PanelRegistry";
import type { TabConfig } from "@/shared/components/Tabs";
import TopSection from "./components/TopSection";
import styles from "./Tutorial.module.scss";
import { Link } from "@/modules/core/Render/D3Renderer";
import { Node as DataNode } from "@/modules/core/DataLogic/Node";
import { BaseElement } from "@/modules/core/DataLogic/BaseElement";
import { useVisualizationLogic } from "@/modules/core/hooks/useVisualizationLogic";
import { PanelProvider, usePanelContext } from "./context/PanelContext";
import KnowledgeStation from "./components/KnowledgeStation";
import FeatureTour from "./components/FeatureTour";
import { xp } from "@/shared/components/XpFloat";
import {
  buildStatusColorMap,
  DEFAULT_STATUS_CONFIG,
} from "@/types/statusConfig";
import { useTranslation } from "react-i18next";
import type { StepDescription } from "@/types";
import type { CodeEditorHandle } from "@/modules/core/components/CodeEditor/CodeEditor";
import type { CanvasPanelProps } from "@/types/canvasTypes";

function renderDescription(
  desc: string | StepDescription | undefined,
  t: (key: string, params?: Record<string, any>) => string,
): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  return t(desc.key, desc.params);
}

// ==================== Canvas Panel Component ====================
const CanvasPanel = ({
  canvasPanelRef,
  isMobile,
  canvasContainerRef,
  currentStepData,
  allStepsElements,
  currentLinks,
  canvasSize,
  topicTypeConfig,
  currentStatusColorMap,
  currentStatusConfig,
  isDirected,
  showBidirectionalArrows,
  viewMode: _viewMode,
  isPlaying,
  currentStep,
  activeStepsLength,
  playbackSpeed,
  handlePlay,
  handlePause,
  handleNext,
  handlePrev,
  handleResetStep,
  setPlaybackSpeed,
  handleStepChange,
  graphCanvasRef,
  d3CanvasRef,
  useGraphCanvas,
  showControls,
}: CanvasPanelProps) => {
  const { t } = useTranslation(topicTypeConfig?.i18nNamespace ?? "animation");
  const { t: tTutorial } = useTranslation("tutorial");
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: "canvas" });

  const dragHandleProps = {
    ref: setActivatorNodeRef,
    ...attributes,
    ...listeners,
  };

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0 : 1,
  };

  return (
    <Panel
      id="canvas-panel"
      defaultSize={75}
      minSize="50%"
      panelRef={canvasPanelRef}
    >
      <div
        ref={setNodeRef}
        style={sortableStyle}
        className={styles.visualizationSection}
        data-tour="canvas-panel"
      >
        <PanelHeader
          title={tTutorial("panelHeader.canvas")}
          draggable={!isMobile}
          dragHandleProps={dragHandleProps}
        />
        <div ref={canvasContainerRef} className={styles.visualizationArea}>
          {useGraphCanvas ? (
            <GraphCanvas
              ref={graphCanvasRef}
              elements={currentStepData?.elements || []}
              allStepsElements={allStepsElements}
              links={currentLinks}
              width={canvasSize.width}
              height={canvasSize.height}
              statusColorMap={currentStatusColorMap}
              statusConfig={currentStatusConfig}
              isDirected={isDirected}
              structureType={topicTypeConfig?.id}
              disableAutoFit={topicTypeConfig?.id === "topological-sort"}
            />
          ) : (
            <D3Canvas
              ref={d3CanvasRef}
              elements={currentStepData?.elements || []}
              allStepsElements={allStepsElements}
              links={currentLinks}
              width={canvasSize.width}
              height={canvasSize.height}
              structureType={topicTypeConfig?.id}
              statusColorMap={currentStatusColorMap}
              statusConfig={currentStatusConfig}
              isDirected={isDirected}
              showBidirectionalArrows={showBidirectionalArrows}
            />
          )}
        </div>
        {showControls && (
          <>
            <div className={styles.stepDescription}>
              {renderDescription(currentStepData?.description, t)}
            </div>
            <div data-tour="control-bar">
              <ControlBar
                isPlaying={isPlaying}
                currentStep={currentStep}
                totalSteps={activeStepsLength}
                playbackSpeed={playbackSpeed}
                onPlay={handlePlay}
                onPause={handlePause}
                onNext={handleNext}
                onPrev={handlePrev}
                onReset={handleResetStep}
                onSpeedChange={setPlaybackSpeed}
                onStepChange={handleStepChange}
              />
            </div>
          </>
        )}
      </div>
    </Panel>
  );
};

// ==================== Inspector Panel Component ====================
export interface InspectorPanelInternalProps {
  isMobile: boolean;
  activeInspectorTab: string;
  setActiveInspectorTab: (tab: string) => void;
  topicTypeConfig: any;
  handleLoadData: (raw: string) => void;
  handleRandomData: (params?: any) => void;
  handleResetData: () => void;
  isProcessing: boolean;
  handleRunAlgorithm: (params?: any) => void;
  handleAddNode: (value: number, mode: string, index?: number) => void;
  handleDeleteNode: (mode: string, index?: number) => void;
  handleSearchNode: (value: number, mode?: string) => void;
  handlePeek: () => void;
  maxNodes: number | undefined;
  setRandomCount: (count: number) => void;
  setHasTailMode: (hasTail: boolean) => void;
  hasTailMode: boolean;
  handleListModeChange: (mode: "singly" | "doubly") => void;
  listMode: "singly" | "doubly";
  handleGraphAction: (action: string, payload: any) => void;
  handleCustomAction: (action: string, payload: any) => void;
  isDirected: boolean;
  setIsDirected: (isDirected: boolean) => void;
  viewMode: AlgorithmViewMode | "";
  handleViewModeChange: (mode: AlgorithmViewMode) => void;
  currentData: any;
  currentStepData: any;
  disabledTabs: Set<string>;
}

export const InspectorPanelInternal = ({
  isMobile,
  activeInspectorTab,
  setActiveInspectorTab,
  topicTypeConfig,
  handleLoadData,
  handleRandomData,
  handleResetData,
  isProcessing,
  handleRunAlgorithm,
  handleAddNode,
  handleDeleteNode,
  handleSearchNode,
  handlePeek,
  maxNodes,
  setRandomCount,
  setHasTailMode,
  hasTailMode,
  handleListModeChange,
  listMode,
  handleGraphAction,
  handleCustomAction,
  isDirected,
  setIsDirected,
  viewMode,
  handleViewModeChange,
  currentData,
  currentStepData,
  disabledTabs,
}: InspectorPanelInternalProps) => {
  const { activePanels } = usePanelContext();
  const { t: tTutorial } = useTranslation("tutorial");

  // 從 PANEL_REGISTRY 過濾出 Inspector Tabs
  const inspectorTabs: TabConfig[] = useMemo(() => {
    return Object.values(PANEL_REGISTRY)
      .filter((config) => config.isTab && config.tabGroup === "inspector")
      .filter((config) => activePanels.includes(config.id))
      .map((config) => ({
        key: config.id,
        label: tTutorial(config.title),
        icon: config.icon,
        disabled: disabledTabs.has(config.id),
      }));
  }, [activePanels, disabledTabs, tTutorial]);

  // 拖拽邏輯
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: "inspector", disabled: isMobile });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const actionBarProps = {
    topicTypeConfig,
    onLoadData: handleLoadData,
    onRandomData: handleRandomData,
    onResetData: handleResetData,
    disabled: isProcessing,
    onRun: handleRunAlgorithm,
    onAddNode: handleAddNode,
    onDeleteNode: handleDeleteNode,
    onSearchNode: handleSearchNode,
    onPeek: handlePeek,
    maxNodes,
    onMaxNodesChange: setRandomCount,
    onTailModeChange: setHasTailMode,
    onListModeChange: handleListModeChange,
    hasTailMode,
    listMode,
    onGraphAction: handleGraphAction,
    onCustomAction: handleCustomAction,
    isDirected,
    onIsDirectedChange: setIsDirected,
    viewMode,
    onViewModeChange: handleViewModeChange,
    currentData,
  };

  // 全部 Tab 同時保持 mounted，以 CSS display:none 隱藏非作用中的，
  // 確保各 Tab 的 local state（insertMode、inputValue 等）不因切換而重置
  const renderTabContent = () => {
    if (inspectorTabs.length === 0) {
      return null;
    }

    return (
      <>
        {inspectorTabs.map((tab) => {
          const panelConfig = PANEL_REGISTRY[tab.key];
          if (!panelConfig) return null;
          const PanelComponent = panelConfig.component;
          const isActive = activeInspectorTab === tab.key;

          let tabProps: Record<string, unknown> = {};
          if (tab.key === "actionBar") tabProps = actionBarProps;
          else if (tab.key === "variableStatus")
            tabProps = { variables: currentStepData?.local_vars };

          return (
            <div
              key={tab.key}
              className={styles.tabContent}
              style={isActive ? undefined : { display: "none" }}
            >
              <Suspense fallback={<div>{tTutorial("common.loading")}</div>}>
                <PanelComponent {...(tabProps as any)} />
              </Suspense>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      {...attributes}
      className={styles.inspectorPanel}
    >
      <PanelHeader
        title={tTutorial("panelHeader.inspector")}
        draggable={!isMobile}
        dragHandleProps={listeners}
        tabs={inspectorTabs}
        activeTab={activeInspectorTab}
        onTabChange={setActiveInspectorTab}
      />
      <div className={styles.tabContentArea}>{renderTabContent()}</div>
    </div>
  );
};

function TutorialContent() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize] = useState({ width: 800, height: 400 });

  // Use panel context for drag and drop
  const {
    mainPanelOrder,
    rightPanelOrder,
    swapMainPanels,
    reorderRightPanels,
    panelSizes,
    collapsedPanels,
  } = usePanelContext();
  const { t: tTutorial } = useTranslation("tutorial");
  const { t: tDashboard } = useTranslation("dashboard");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Panel refs for programmatic control
  const leftPanelRef = useRef<PanelImperativeHandle>(null);
  const rightPanelRef = useRef<PanelImperativeHandle>(null);
  const canvasPanelRef = useRef<PanelImperativeHandle>(null);
  const inspectorPanelRef = useRef<PanelImperativeHandle>(null);
  const graphCanvasRef = useRef<GraphCanvasRef | null>(null);
  const d3CanvasRef = useRef<D3CanvasRef | null>(null);
  const isAnimatingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const handleNextRef = useRef<() => void>(() => {});
  const codeEditorRef = useRef<CodeEditorHandle>(null);

  // Collapse states (使用 context 的 collapsed state)
  const isLeftPanelCollapsed = collapsedPanels.has("codeEditor");

  // Knowledge Station state
  const [isKnowledgeStationOpen, setIsKnowledgeStationOpen] = useState(false);

  // Feature Tour state
  const [showFeatureTour, setShowFeatureTour] = useState(true);
  const handleSkipFeatureTour = () => {
    setShowFeatureTour(false);
    if (!hasStartedAnimation) {
      setTimeout(() => leftPanelRef.current?.collapse(), 0);
    }
  };
  const handleCompleteFeatureTour = () => {
    setShowFeatureTour(false);
    setIsKnowledgeStationOpen(true);
    if (!hasStartedAnimation) {
      setTimeout(() => leftPanelRef.current?.collapse(), 0);
    }
  };

  // Inspector Tab state
  const [activeInspectorTab, setActiveInspectorTab] =
    useState<string>("actionBar");
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);

  // RWD: 检测屏幕宽度
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { category, levelId } = useParams<{
    category: string;
    levelId: string;
  }>();

  // Session 管理
  const { isAuthenticated, showCheckinDialog } = useAuth();
  const sessionIdRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  // Teaching Complete
  const teachingDoneRef = useRef(false);
  const handleTeachingComplete = async () => {
    if (teachingDoneRef.current || !isAuthenticated || !levelId) return;
    try {
      const res = await tutorialService.markTeachingComplete(levelId);
      teachingDoneRef.current = true;
      if (res.xp_earned > 0) {
        xp.show(res.xp_earned, { reason: 'tutorial' });
      }
    } catch {
      // 403 = 未滿 30 秒，靜默忽略
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !levelId) return;

    // Reset teaching state for the new level
    teachingDoneRef.current = false;

    sessionStartRef.current = Date.now();
    tutorialService
      .startSession(levelId)
      .then((id) => {
        sessionIdRef.current = id;
      })
      .catch(() => {});

    const teachingTimer = setTimeout(() => handleTeachingComplete(), 30000);

    return () => {
      clearTimeout(teachingTimer);
      if (sessionIdRef.current === null) return;
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);

      // 用 sendBeacon 確保頁面關閉時請求仍能送出
      const sessionUrl = `/api/tutorials/${levelId}/session/${sessionIdRef.current}`;
      const sessionBlob = new Blob(
        [JSON.stringify({ duration_seconds: elapsed })],
        { type: "application/json" },
      );
      if (!navigator.sendBeacon(sessionUrl, sessionBlob)) {
        tutorialService
          .endSession(levelId, sessionIdRef.current, elapsed)
          .catch(() => {});
      }

      if (!teachingDoneRef.current && elapsed >= 30) {
        const teachingUrl = `/api/tutorials/${levelId}/teaching-complete`;
        const teachingBlob = new Blob([], { type: "application/json" });
        if (!navigator.sendBeacon(teachingUrl, teachingBlob)) {
          tutorialService.markTeachingComplete(levelId).catch(() => {});
        }
      }
    };
  }, [isAuthenticated, levelId]);

  // 新增：代碼模式狀態
  const [codeMode, setCodeMode] = useState<"pseudo" | "python">("pseudo");

  // 1. 根據路由參數載入配置
  const topicTypeConfig = useMemo(() => {
    if (!levelId) return null;

    // 透過 levelId 取得實作配置
    const implementation = getImplementationByLevelId(levelId);
    return implementation;
  }, [levelId]);

  // 計算當前演算法的狀態顏色映射表（memoized）
  const currentStatusColorMap = useMemo(() => {
    if (topicTypeConfig?.statusConfig) {
      return buildStatusColorMap(topicTypeConfig.statusConfig);
    }
    return buildStatusColorMap(DEFAULT_STATUS_CONFIG);
  }, [topicTypeConfig]);

  // 計算當前演算法的狀態配置（memoized）
  const currentStatusConfig = useMemo(() => {
    return topicTypeConfig?.statusConfig ?? DEFAULT_STATUS_CONFIG;
  }, [topicTypeConfig]);

  // 改用 topicTypeConfig.type 判斷類型（不再依賴 URL 參數）
  const isAlgorithm = topicTypeConfig?.type === "algorithm";

  // 2. 狀態管理（統一使用 useVisualizationLogic）
  const logic = useVisualizationLogic(topicTypeConfig);
  const { activeSteps, executeAction } = logic;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const isProcessing =
    isPlaying ||
    (activeSteps.length > 1 &&
      currentStep > 0 &&
      currentStep < activeSteps.length - 1);

  const isAtLastStep =
    hasStartedAnimation &&
    activeSteps.length > 1 &&
    currentStep === activeSteps.length - 1;

  const showControls = hasStartedAnimation || showFeatureTour;

  const disabledTabs = useMemo((): Set<string> => {
    if (!hasStartedAnimation) return new Set(["variableStatus"]);
    if (isAtLastStep) return new Set();
    return new Set(["actionBar"]);
  }, [hasStartedAnimation, isAtLastStep]);

  const maxNodes = topicTypeConfig?.maxNodes;
  const randomCountRef = useRef(5);

  const handleRandomCountChange = (count: number) => {
    randomCountRef.current = count;
  };
  const [hasTailMode, setHasTailMode] = useState(false);
  const [viewMode, setViewMode] = useState<AlgorithmViewMode | "">("");
  const [isDirected, setIsDirected] = useState(false);
  const [renderedIsDirected, setRenderedIsDirected] = useState(false);
  const [listMode, setListMode] = useState<"singly" | "doubly">("singly");

  const useGraphCanvas = useMemo(
    () =>
      topicTypeConfig?.id === "graph" ||
      topicTypeConfig?.id === "dijkstra" ||
      topicTypeConfig?.id === "topological-sort" ||
      ((topicTypeConfig?.id === "bfs" || topicTypeConfig?.id === "dfs") &&
        viewMode !== "grid"),
    [topicTypeConfig?.id, viewMode],
  );

  // 計算目前的動畫步驟數據
  const currentStepData = activeSteps[currentStep];

  // 根據 hasTailMode / listMode 動態計算當前的 codeConfig
  const currentCodeConfig = useMemo(() => {
    if (!topicTypeConfig) return null;
    if (topicTypeConfig.getCodeConfig) {
      return topicTypeConfig.getCodeConfig({
        hasTailMode,
        isDoubly: listMode === "doubly",
        mode: viewMode || "graph",
      });
    }
    return topicTypeConfig.codeConfig ?? null;
  }, [topicTypeConfig, hasTailMode, listMode, viewMode]);

  // 計算需要高亮的行號 (只有 pseudo 模式才有 mappings)
  const highlightLines = useMemo(() => {
    if (!currentCodeConfig || !currentStepData?.actionTag) return [];
    if (codeMode !== "pseudo") return []; // python 不需要高亮

    const pseudoConfig = currentCodeConfig.pseudo;
    const mappings = pseudoConfig?.mappings;
    return (mappings && mappings[currentStepData.actionTag]) || [];
  }, [currentCodeConfig, currentStepData, codeMode]);

  const handleModeToggle = (mode: "pseudo" | "python") => {
    setCodeMode(mode);
  };

  // 3. 初始重置
  useEffect(() => {
    if (topicTypeConfig) {
      setCurrentStep(0);
      setIsPlaying(false);
      setViewMode(topicTypeConfig.defaultViewMode ?? "");
      setIsDirected(topicTypeConfig.defaultIsDirected ?? false);
      setHasStartedAnimation(false);
      setActiveInspectorTab("actionBar");
      // setTimeout 讓 collapse 在當前 render 完成後執行，避免 react-resizable-panels 尚未完成 remount
      setTimeout(() => leftPanelRef.current?.collapse(), 0);
    }
  }, [topicTypeConfig]);

  useEffect(() => {
    const hasData = Array.isArray(logic.data)
      ? logic.data.length > 0
      : logic.data?.nodes?.length > 0;

    if (topicTypeConfig && !isProcessing && hasData) {
      logic.executeAction("refresh", {
        hasTailMode,
        isDirected,
        isDoubly: listMode === "doubly",
      });
      setRenderedIsDirected(isDirected);
      setCurrentStep(0);
    }
  }, [hasTailMode, isDirected, isAlgorithm, listMode]);

  // 4. 動畫播放邏輯
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      handleNextRef.current();
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // 5. FeatureTour：開啟時展開 CodeEditor 讓導覽步驟可見；關閉由 handler 負責收起
  useEffect(() => {
    if (showFeatureTour && !hasStartedAnimation) {
      setTimeout(() => {
        if (leftPanelRef.current?.isCollapsed()) {
          leftPanelRef.current.expand();
        }
      }, 0);
    }
  }, [showFeatureTour]);

  // 6. Progressive disclosure：偵測首次開始播放
  useEffect(() => {
    if (isPlaying && !hasStartedAnimation) {
      setHasStartedAnimation(true);
    }
  }, [isPlaying, hasStartedAnimation]);

  // 7. Progressive disclosure：首次開始後，時序展開 CodeEditor 並切換 tab（只觸發一次）
  useEffect(() => {
    if (!hasStartedAnimation) return;
    const timer = setTimeout(() => {
      const currentPercent = leftPanelRef.current?.getSize().asPercentage ?? 0;
      if (currentPercent < panelSizes.codeEditor) {
        const contentPx = codeEditorRef.current?.getContentWidth() ?? 0;
        const rightPanelPx = rightPanelRef.current?.getSize().inPixels ?? 0;
        const contentPercent = rightPanelPx > 0 ? (contentPx / rightPanelPx) * 100 : 0;
        const targetPercent = Math.min(panelSizes.codeEditor, Math.max(20, contentPercent));
        leftPanelRef.current?.resize(`${targetPercent}%`);
      }
      setActiveInspectorTab("variableStatus");
    }, 400);
    return () => clearTimeout(timer);
  }, [hasStartedAnimation]);


  const allStepsElements = useMemo(() => {
    return activeSteps.map((step) => step?.elements ?? []);
  }, [activeSteps]);

  // 5. 處理連線 (從 Node 的 pointers 提取，支援伸縮動畫)
  const currentLinks = useMemo(() => {
    if (currentStepData?.links) {
      return currentStepData.links;
    }

    const links: Link[] = [];
    if (currentStepData?.elements) {
      const nodes = currentStepData.elements.filter(
        (e: BaseElement) => e instanceof DataNode,
      ) as DataNode[];

      nodes.forEach((sourceNode) => {
        if (sourceNode.next !== null || sourceNode.prev !== null) {
          if (sourceNode.next) {
            links.push({
              key: `${sourceNode.id}-next->${sourceNode.next.id}`,
              sourceId: sourceNode.id,
              targetId: sourceNode.next.id,
              direction: "next",
            });
          }
          if (sourceNode.prev) {
            links.push({
              key: `${sourceNode.id}-prev->${sourceNode.prev.id}`,
              sourceId: sourceNode.id,
              targetId: sourceNode.prev.id,
              direction: "prev",
            });
          }
        } else {
          sourceNode.pointers.forEach((targetNode) => {
            links.push({
              key: `${sourceNode.id}->${targetNode.id}`,
              sourceId: sourceNode.id,
              targetId: targetNode.id,
            });
          });
        }
      });
    }
    return links;
  }, [currentStepData]);

  // 6. 控制行為
  const handleAddNode = (value: number, mode: string, index?: number) => {
    if (isAlgorithm) return;
    if (maxNodes !== undefined) {
      const currentCount = logic.data?.length ?? logic.data?.nodes?.length ?? 0;
      if (currentCount >= maxNodes) {
        toast.warning(tTutorial("toast.maxNodesExceeded", { maxNodes }));
        return;
      }
    }
    const steps = executeAction("add", {
      value,
      mode,
      index,
      hasTailMode,
      isDoubly: listMode === "doubly",
    });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleDeleteNode = (mode: string, index?: number) => {
    if (isAlgorithm) return;
    const steps = executeAction("delete", {
      mode,
      index,
      hasTailMode,
      isDoubly: listMode === "doubly",
    });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSearchNode = (value: number, mode?: string) => {
    if (isAlgorithm) return;
    const steps = executeAction("search", {
      value,
      mode,
      hasTailMode,
      isDoubly: listMode === "doubly",
    });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  // 隨機資料：數字在 -99~99，筆數不超過 maxNodes
  const handleRandomData = (params?: any) => {
    executeAction("random", {
      randomCount: randomCountRef.current,
      hasTailMode,
      mode: viewMode,
      isDirected,
      isDoubly: listMode === "doubly",
      ...params,
    });
    setCurrentStep(0);
    setIsPlaying(false); // 不需要自動播放
  };

  // 重設：回到預設 10, 40, 30, 20
  const handleResetData = () => {
    executeAction("reset", {
      hasTailMode,
      mode: viewMode,
      isDirected,
      isDoubly: listMode === "doubly",
    });
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // 載入輸入資料：解析字串並更新
  const handleLoadData = (raw: string) => {
    if (
      raw.startsWith("GRID:") ||
      raw.startsWith("GRAPH:") ||
      raw.startsWith("KNAPSACK:") ||
      raw.startsWith("NQUEENS:")
    ) {
      const steps = executeAction("load", {
        data: raw,
        randomCount: randomCountRef.current,
        hasTailMode,
        isDirected,
        isDoubly: listMode === "doubly",
      });
      if (steps && steps.length > 0) {
        setCurrentStep(0);
        setIsPlaying(false);
      }
      return;
    }

    if (raw.startsWith("TRIE:")) {
      // 拔掉 "TRIE:" 前綴，然後用空白切成純字串陣列
      const wordsStr = raw.replace("TRIE:", "").trim();
      const parsedWords = wordsStr ? wordsStr.split(" ") : [];

      if (parsedWords.length === 0) {
        toast.warning(tTutorial("toast.invalidWordList"));
        return;
      }

      const steps = executeAction("load", {
        data: parsedWords,
        hasTailMode,
      });

      if (steps && steps.length > 0) {
        setCurrentStep(0);
        setIsPlaying(false);
      }
      return;
    }

    const parsed = raw
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));

    if (parsed.length === 0) {
      toast.warning(tTutorial("toast.invalidFormat"));
      return;
    }
    if (maxNodes !== undefined && parsed.length > maxNodes) {
      toast.warning(tTutorial("toast.maxNodesExceeded", { maxNodes }));
      return;
    }
    const steps = executeAction("load", {
      data: parsed,
      hasTailMode,
      isDoubly: listMode === "doubly",
    });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  const handlePeek = () => {
    if (isAlgorithm) return;
    const steps = executeAction("peek", { hasTailMode });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleRunAlgorithm = (params?: any) => {
    if (!isAlgorithm) return;

    const steps = executeAction("run", params); // 執行演算法
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleViewModeChange = (mode: AlgorithmViewMode) => {
    if (isProcessing) return;
    setViewMode(mode);

    executeAction("switchMode", { mode });
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleGraphAction = (action: string, payload: any) => {
    if (isProcessing) return;

    const steps = logic.executeAction(action, payload);

    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleCustomAction = (action: string, payload: any) => {
    if (isProcessing) return;

    const currentCount = logic.data?.length ?? logic.data?.nodes?.length ?? 0;

    if (action === "add" && maxNodes !== undefined && currentCount >= maxNodes) {
      toast.warning(tTutorial("toast.maxNodesExceeded", { maxNodes }));
      return;
    }

    if ((action === "delete" || action === "peek") && currentCount === 0) {
      toast.warning(tTutorial("toast.emptyDataOperation"));
      return;
    }

    const steps = logic.executeAction(action, payload);

    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleIsDirectedChange = (newValue: boolean) => {
    setIsDirected(newValue);
    setIsPlaying(false);
  };

  const handleListModeChange = (mode: "singly" | "doubly") => {
    const isDoubly = mode === "doubly";
    executeAction("switch_mode", { isDoubly, hasTailMode });
    setListMode(mode);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  isPlayingRef.current = isPlaying;

  const handleNext = useCallback(() => {
    if (currentStep >= activeSteps.length - 1) {
      setIsPlaying(false);
      return;
    }
    if (isAnimatingRef.current) return;

    const nextStepIndex = currentStep + 1;
    const nextStep = activeSteps[nextStepIndex];

    const activeCanvas: AnimatableCanvasRef | null = useGraphCanvas
      ? graphCanvasRef.current
      : d3CanvasRef.current;

    if (!activeCanvas || !nextStep?.links) {
      setCurrentStep(nextStepIndex);
      return;
    }

    const linkAnimConfig =
      topicTypeConfig?.linkAnimConfig ?? DEFAULT_LINK_ANIM_CONFIG;

    const currentLinksMap = new Map<string, Link>(
      currentLinks.map((l: Link) => [l.key, l]),
    );
    const seenEdgePairs = new Set<string>();
    const changedLinks = (nextStep.links as Link[]).filter((l: Link) => {
      const prev = currentLinksMap.get(l.key);
      const statusChanged = l.status !== (prev?.status ?? "default");
      const shouldAnimate = linkAnimConfig.animateOn.includes(l.status ?? "");
      if (!statusChanged || !shouldAnimate) return false;
      const edgePair = [l.sourceId, l.targetId].sort().join(":");
      if (seenEdgePairs.has(edgePair)) return false;
      seenEdgePairs.add(edgePair);
      return true;
    });

    if (changedLinks.length === 0) {
      setCurrentStep(nextStepIndex);
      return;
    }

    const gc = activeCanvas;
    isAnimatingRef.current = true;
    let completed = 0;
    const duration = Math.round(
      (isPlayingRef.current ? 200 : 300) / playbackSpeed,
    );

    changedLinks.forEach((link) => {
      const toColor = currentStatusColorMap
        ? (currentStatusColorMap[link.status ?? ""] ?? "#888")
        : "#888";

      gc.animateLink(link.sourceId, link.targetId, toColor, duration, () => {
        completed += 1;
        if (completed === changedLinks.length) {
          isAnimatingRef.current = false;
          setCurrentStep(nextStepIndex);
        }
      });
    });
  }, [
    currentStep,
    activeSteps,
    currentLinks,
    useGraphCanvas,
    playbackSpeed,
    topicTypeConfig,
    currentStatusColorMap,
  ]);
  handleNextRef.current = handleNext;

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const handleResetStep = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setHasStartedAnimation(false);
  };
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    setIsPlaying(false); // 手動跳轉時暫停播放
  };

  // Panel collapse/expand handlers
  const handleToggleLeftPanel = () => {
    const panel = leftPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  // 交換主面板並記錄當前尺寸
  const handleSwapMainPanels = () => {
    // 獲取當前面板尺寸
    const codeEditorPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    if (!codeEditorPanel || !rightPanel) {
      swapMainPanels();
      return;
    }

    // 從 react-resizable-panels 獲取當前尺寸
    let codeEditorSize = codeEditorPanel.getSize().asPercentage;
    let rightPanelSize = rightPanel.getSize().asPercentage;

    // 如果 codeEditor 是 collapsed (size = 0)，使用之前保存的尺寸
    if (isLeftPanelCollapsed && codeEditorSize === 0) {
      codeEditorSize = panelSizes.codeEditor || 35; // 使用保存的值或預設值
      rightPanelSize = 100 - codeEditorSize;
    }

    // 交換順序
    swapMainPanels(codeEditorSize, rightPanelSize);

    // collapsedPanels 狀態會保留，TopSection 會根據這個狀態設置正確的 defaultSize
  };

  // Drag and Drop handlers
  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    if (
      mainPanelOrder.includes(active.id as string) &&
      mainPanelOrder.includes(over.id as string)
    ) {
      handleSwapMainPanels();
    } else if (
      rightPanelOrder.includes(active.id as string) &&
      rightPanelOrder.includes(over.id as string)
    ) {
      const oldIndex = rightPanelOrder.indexOf(active.id as string);
      const newIndex = rightPanelOrder.indexOf(over.id as string);
      reorderRightPanels(oldIndex, newIndex);
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  if (!topicTypeConfig) {
    return null;
  }

  // ==================== Inspector Panel Props ====================
  const inspectorPanelProps: InspectorPanelInternalProps = {
    isMobile,
    activeInspectorTab,
    setActiveInspectorTab,
    topicTypeConfig,
    handleLoadData,
    handleRandomData,
    handleResetData,
    isProcessing,
    handleRunAlgorithm,
    handleAddNode,
    handleDeleteNode,
    handleSearchNode,
    handlePeek,
    maxNodes,
    setRandomCount: handleRandomCountChange,
    setHasTailMode,
    hasTailMode,
    handleListModeChange: handleListModeChange,
    listMode,
    handleGraphAction,
    handleCustomAction,
    isDirected,
    setIsDirected: handleIsDirectedChange,
    viewMode,
    handleViewModeChange,
    currentData: logic.data,
    currentStepData,
    disabledTabs,
  };

  const categoryKey = category?.replace(/-/g, "_") ?? "";
  const levelKey = levelId?.replace(/-/g, "_") ?? "";
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: tDashboard(`categories.${categoryKey}.name`, {
        defaultValue: topicTypeConfig.categoryName,
      }),
      path: `/dashboard?category=${category}`,
    },
    {
      label: tDashboard(`levels.${levelKey}.name`, {
        defaultValue: topicTypeConfig.name,
      }),
      path: null,
    },
  ];

  // Props for CanvasPanel
  const canvasPanelProps: CanvasPanelProps = {
    canvasPanelRef,
    isMobile,
    canvasContainerRef,
    currentStepData,
    allStepsElements,
    currentLinks,
    canvasSize,
    topicTypeConfig,
    currentStatusColorMap,
    currentStatusConfig,
    isDirected: renderedIsDirected,
    showBidirectionalArrows: listMode === "doubly",
    viewMode,
    isPlaying,
    currentStep,
    activeStepsLength: activeSteps.length,
    playbackSpeed,
    handlePlay,
    handlePause,
    handleNext,
    handlePrev,
    handleResetStep,
    setPlaybackSpeed,
    handleStepChange,
    graphCanvasRef,
    d3CanvasRef,
    useGraphCanvas,
    showControls,
  };

  return (
    <div className={styles.tutorialPage}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} showBackButton={true} />
        {!isMobile && (
          <div className={styles.buttonGroup}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFeatureTour(true)}
              title={tTutorial("page.openTourTitle")}
              icon="circle-question"
              iconOnly
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsKnowledgeStationOpen(true)}
              title={tTutorial("page.openKnowledgeStationTitle")}
              icon="lightbulb"
            >
              {tTutorial("page.knowledgeStation")}
            </Button>
            <span data-tour="swap-button">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSwapMainPanels}
                title={tTutorial("page.swapLayoutTitle")}
                icon="right-left"
              >
                {tTutorial("page.swapLayout")}
              </Button>
            </span>
          </div>
        )}
      </div>

      <TopSection
        activeDragId={activeDragId}
        mainPanelOrder={mainPanelOrder}
        rightPanelOrder={rightPanelOrder}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        handleDragCancel={handleDragCancel}
        isMobile={isMobile}
        leftPanelRef={leftPanelRef}
        rightPanelRef={rightPanelRef}
        canvasPanelRef={canvasPanelRef}
        inspectorPanelRef={inspectorPanelRef}
        CanvasPanel={CanvasPanel}
        canvasPanelProps={canvasPanelProps}
        inspectorPanelProps={inspectorPanelProps}
        isLeftPanelCollapsed={isLeftPanelCollapsed}
        handleToggleLeftPanel={handleToggleLeftPanel}
        topicTypeConfig={topicTypeConfig}
        codeMode={codeMode}
        handleModeToggle={handleModeToggle}
        currentCodeConfig={currentCodeConfig}
        highlightLines={highlightLines}
        codeEditorRef={codeEditorRef}
      />

      {/* Knowledge Station Dialog */}
      {topicTypeConfig && (
        <KnowledgeStation
          isOpen={isKnowledgeStationOpen}
          onClose={() => setIsKnowledgeStationOpen(false)}
          topicTypeConfig={topicTypeConfig}
        />
      )}
      {/* Feature Tour */}
      <FeatureTour
        isOpen={showFeatureTour && !showCheckinDialog}
        onComplete={handleCompleteFeatureTour}
        onSkip={handleSkipFeatureTour}
        isMobile={isMobile}
        isDataStructure={topicTypeConfig?.type === 'dataStructure'}
      />
    </div>
  );
}

export default function Tutorial() {
  return (
    <PanelProvider>
      <TutorialContent />
    </PanelProvider>
  );
}
