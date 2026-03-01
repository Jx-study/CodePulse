import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Panel, PanelImperativeHandle } from "react-resizable-panels";
import { DragEndEvent } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Breadcrumb from "@/shared/components/Breadcrumb";
import Button from "@/shared/components/Button";
import { D3Canvas } from "@/modules/core/Render/D3Canvas";
import ControlBar from "@/modules/core/components/ControlBar";
import LimitWarningToast from "@/shared/components/LimitWarningToast";
import type { BreadcrumbItem } from "@/types";
import { getImplementationByLevelId } from "@/services/ImplementationService";
import PanelHeader from "./components/PanelHeader";
import { PANEL_REGISTRY } from "./components/PanelRegistry";
import type { TabConfig } from "@/shared/components/Tabs";
import TopSection from "./components/TopSection";
import styles from "./Tutorial.module.scss";
import { Link } from "@/modules/core/Render/D3Renderer";
import { Node as DataNode } from "@/modules/core/DataLogic/Node";
import { BaseElement } from "@/modules/core/DataLogic/BaseElement";
import { useDataStructureLogic } from "@/modules/core/hooks/useDataStructureLogic";
import { useAlgorithmLogic } from "@/modules/core/hooks/useAlgorithmLogic";
import { PanelProvider, usePanelContext } from "./context/PanelContext";
import KnowledgeStation from "./components/KnowledgeStation";
import {
  buildStatusColorMap,
  DEFAULT_STATUS_CONFIG,
} from "@/types/statusConfig";

// ==================== Canvas Panel Component ====================
interface CanvasPanelProps {
  canvasPanelRef: React.RefObject<PanelImperativeHandle | null>;
  isMobile: boolean;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  currentStepData: any;
  currentLinks: Link[];
  canvasSize: { width: number; height: number };
  topicTypeConfig: any;
  currentStatusColorMap: any;
  currentStatusConfig: any;

  // 保留 ControlBar props (內嵌在 Canvas 中)
  isPlaying: boolean;
  currentStep: number;
  activeStepsLength: number;
  playbackSpeed: number;
  handlePlay: () => void;
  handlePause: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  handleReset: () => void;
  setPlaybackSpeed: (speed: number) => void;
  handleStepChange: (step: number) => void;
}

const CanvasPanel = ({
  canvasPanelRef,
  isMobile,
  canvasContainerRef,
  currentStepData,
  currentLinks,
  canvasSize,
  topicTypeConfig,
  currentStatusColorMap,
  currentStatusConfig,
  isPlaying,
  currentStep,
  activeStepsLength,
  playbackSpeed,
  handlePlay,
  handlePause,
  handleNext,
  handlePrev,
  handleReset,
  setPlaybackSpeed,
  handleStepChange,
}: CanvasPanelProps) => {
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
      >
        <PanelHeader
          title="視覺化動畫"
          draggable={!isMobile}
          dragHandleProps={dragHandleProps}
        />
        <div ref={canvasContainerRef} className={styles.visualizationArea}>
          <D3Canvas
            elements={currentStepData?.elements || []}
            links={currentLinks}
            width={canvasSize.width}
            height={canvasSize.height}
            structureType={topicTypeConfig?.id}
            statusColorMap={currentStatusColorMap}
            statusConfig={currentStatusConfig}
          />
        </div>
        <div className={styles.stepDescription}>
          {currentStepData?.description}
        </div>

        {/* ControlBar 直接渲染,無 PanelHeader */}
        <ControlBar
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={activeStepsLength}
          playbackSpeed={playbackSpeed}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onPrev={handlePrev}
          onReset={handleReset}
          onSpeedChange={setPlaybackSpeed}
          onStepChange={handleStepChange}
        />
      </div>
    </Panel>
  );
};
function TutorialContent() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  // Use panel context for drag and drop
  const {
    mainPanelOrder,
    rightPanelOrder,
    swapMainPanels,
    reorderRightPanels,
    panelSizes,
    collapsedPanels,
    setCollapsed,
  } = usePanelContext();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Panel refs for programmatic control
  const leftPanelRef = useRef<PanelImperativeHandle>(null);
  const rightPanelRef = useRef<PanelImperativeHandle>(null);
  const canvasPanelRef = useRef<PanelImperativeHandle>(null);
  const inspectorPanelRef = useRef<PanelImperativeHandle>(null);

  // Collapse states (使用 context 的 collapsed state)
  const isLeftPanelCollapsed = collapsedPanels.has("codeEditor");

  // Knowledge Station state
  const [isKnowledgeStationOpen, setIsKnowledgeStationOpen] = useState(false);

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

  // 2. 狀態管理(同時呼叫兩個 Hook，但只用其中一個的結果)
  const dsLogic = useDataStructureLogic(isAlgorithm ? null : topicTypeConfig);
  const algoLogic = useAlgorithmLogic(isAlgorithm ? topicTypeConfig : null);

  const logic = isAlgorithm ? algoLogic : dsLogic;
  const { activeSteps, executeAction } = logic;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const isProcessing =
    isPlaying ||
    (activeSteps.length > 1 &&
      currentStep > 0 &&
      currentStep < activeSteps.length - 1);

  const maxNodes = topicTypeConfig?.maxNodes;
  const randomCountRef = useRef(5);

  const handleRandomCountChange = (count: number) => {
    randomCountRef.current = count;
  };
  const [hasTailMode, setHasTailMode] = useState(false);
  const [showLimitToast, setShowLimitToast] = useState(false);
  const [viewMode, setViewMode] = useState<string>("");
  const [isDirected, setIsDirected] = useState(false);

  // 計算目前的動畫步驟數據
  const currentStepData = activeSteps[currentStep];

  // 新增：根據 hasTailMode 動態計算當前的 codeConfig
  const currentCodeConfig = useMemo(() => {
    if (!topicTypeConfig) return null;
    if (topicTypeConfig.getCodeConfig) {
      return topicTypeConfig.getCodeConfig({ hasTailMode });
    }
    return topicTypeConfig.codeConfig ?? null;
  }, [topicTypeConfig, hasTailMode]);

  // 計算需要高亮的行號 (只有 pseudo 模式才有 mappings)
  const highlightLines = useMemo(() => {
    if (!currentCodeConfig || !currentStepData?.actionTag) return [];
    if (codeMode !== "pseudo") return []; // python 不需要高亮

    const pseudoConfig = currentCodeConfig.pseudo;
    const mappings = pseudoConfig?.mappings;
    return (mappings && mappings[currentStepData.actionTag]) || [];
  }, [currentCodeConfig, currentStepData, codeMode]);

  // 切換模式時重置動畫
  const handleModeToggle = (mode: "pseudo" | "python") => {
    setCodeMode(mode);
    handleReset();
  };

  // 3. 初始重置
  useEffect(() => {
    if (topicTypeConfig) {
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [topicTypeConfig]);

  useEffect(() => {
    if (!isAlgorithm && topicTypeConfig && !isProcessing) {
      executeAction("refresh", { hasTailMode, isDirected });
      setCurrentStep(0);
    }
  }, [hasTailMode, isAlgorithm, isDirected]);

  // 4. 動畫播放邏輯
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep >= activeSteps.length - 1) {
          setIsPlaying(false);
          return prevStep;
        }
        return prevStep + 1;
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activeSteps.length]);

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
        // 遍歷每個節點的 pointers 陣列
        sourceNode.pointers.forEach((targetNode) => {
          links.push({
            key: `${sourceNode.id}->${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
          });
        });
      });
    }
    return links;
  }, [currentStepData]);

  // 6. 控制行為
  const handleAddNode = (value: number, mode: string, index?: number) => {
    if (isAlgorithm) return;
    if (maxNodes !== undefined) {
      const currentCount = dsLogic.data?.length ?? (dsLogic.data?.nodes?.length ?? 0);
      if (currentCount >= maxNodes) {
        setShowLimitToast(true);
        return;
      }
    }
    const steps = executeAction("add", {
      value,
      mode,
      index,
      hasTailMode,
    });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleDeleteNode = (mode: string, index?: number) => {
    if (isAlgorithm) return;
    const steps = executeAction("delete", { mode, index, hasTailMode });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSearchNode = (value: number, mode?: string) => {
    if (isAlgorithm) return;
    const steps = executeAction("search", { value, mode, hasTailMode });
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
      ...params,
    });
    setCurrentStep(0);
    setIsPlaying(false); // 不需要自動播放
  };

  // 重設：回到預設 10, 40, 30, 20
  const handleResetData = () => {
    executeAction("reset", { hasTailMode, mode: viewMode, isDirected });
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // 載入輸入資料：解析字串並更新
  const handleLoadData = (raw: string) => {
    if (raw.startsWith("GRID:") || raw.startsWith("GRAPH:")) {
      const steps = executeAction("load", {
        data: raw,
        randomCount: randomCountRef.current,
        hasTailMode,
        isDirected,
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

    if (parsed.length === 0) return alert("請輸入有效的數字格式 (例如: 1,2,3)");
    if (maxNodes !== undefined && parsed.length > maxNodes) {
      setShowLimitToast(true);
      return;
    }
    const steps = executeAction("load", {
      data: parsed,
      hasTailMode,
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

  const handleViewModeChange = (mode: "graph" | "grid") => {
    if (isProcessing) return;
    setViewMode(mode);

    executeAction("switchMode", { mode });
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleGraphAction = (action: string, payload: any) => {
    if (isProcessing) return;

    const steps = dsLogic.executeAction(action, payload);

    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, activeSteps.length - 1));
  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const handleReset = () => {
    executeAction("reset", { hasTailMode, mode: viewMode, isDirected });
    setCurrentStep(0);
    setIsPlaying(false);
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
      setCollapsed("codeEditor", false);
    } else {
      panel.collapse();
      setCollapsed("codeEditor", true);
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

  // ==================== Inspector Panel Component ====================
  const InspectorPanelInternal = () => {
    const { activePanels } = usePanelContext();
    const [activeInspectorTab, setActiveInspectorTab] =
      useState<string>("actionBar");

    // 從 PANEL_REGISTRY 過濾出 Inspector Tabs
    const inspectorTabs: TabConfig[] = useMemo(() => {
      return Object.values(PANEL_REGISTRY)
        .filter((config) => config.isTab && config.tabGroup === "inspector")
        .filter((config) => activePanels.includes(config.id))
        .map((config) => ({
          key: config.id,
          label: config.title,
          icon: config.icon,
        }));
    }, [activePanels]);

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

    // 渲染當前 Tab 的內容
    const renderTabContent = () => {
      const panelConfig = PANEL_REGISTRY[activeInspectorTab];

      if (!panelConfig) {
        return null;
      }

      const PanelComponent = panelConfig.component;

      // 為 actionBar 準備特殊的 props
      if (activeInspectorTab === "actionBar") {
        return (
          <div className={styles.tabContent}>
            <Suspense fallback={<div>載入中...</div>}>
              <PanelComponent
                topicTypeConfig={topicTypeConfig}
                category={category}
                onLoadData={handleLoadData}
                onRandomData={handleRandomData}
                onResetData={handleResetData}
                disabled={isProcessing}
                onRun={handleRunAlgorithm}
                onAddNode={handleAddNode}
                onDeleteNode={handleDeleteNode}
                onSearchNode={handleSearchNode}
                onPeek={handlePeek}
                onMaxNodesChange={handleRandomCountChange}
                onTailModeChange={setHasTailMode}
                onGraphAction={handleGraphAction}
                isDirected={isDirected}
                onIsDirectedChange={setIsDirected}
                onLimitExceeded={() =>
                  maxNodes !== undefined && setShowLimitToast(true)
                }
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                currentData={logic.data}
              />
            </Suspense>
          </div>
        );
      }

      // 為 variableStatus 準備 variables props
      if (activeInspectorTab === "variableStatus") {
        return (
          <div className={styles.tabContent}>
            <Suspense fallback={<div>載入中...</div>}>
              <PanelComponent variables={currentStepData?.variables} />
            </Suspense>
          </div>
        );
      }

      // 其他 Tab (callStack) 不需要 props
      return (
        <div className={styles.tabContent}>
          <Suspense fallback={<div>載入中...</div>}>
            <PanelComponent />
          </Suspense>
        </div>
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
          title="資訊面板"
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

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: topicTypeConfig.categoryName,
      path: `/dashboard?category=${category}`,
    },
    { label: topicTypeConfig.name, path: null },
  ];

  // Props for CanvasPanel
  const canvasPanelProps: CanvasPanelProps = {
    canvasPanelRef,
    isMobile,
    canvasContainerRef,
    currentStepData,
    currentLinks,
    canvasSize,
    topicTypeConfig,
    currentStatusColorMap,
    currentStatusConfig,
    isPlaying,
    currentStep,
    activeStepsLength: activeSteps.length,
    playbackSpeed,
    handlePlay,
    handlePause,
    handleNext,
    handlePrev,
    handleReset,
    setPlaybackSpeed,
    handleStepChange,
  };

  return (
    <div className={styles.tutorialPage}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} showBackButton={true} />
        {!isMobile && (
          <div className={styles.buttonGroup}>
            <Button
              variant="secondary"
              onClick={() => setIsKnowledgeStationOpen(true)}
              title="開啟知識補充站"
              icon="lightbulb"
            >
              知識補充站
            </Button>
            <Button
              variant="secondary"
              className={styles.swapButton}
              onClick={handleSwapMainPanels}
              title="交換左右面板"
              icon="right-left"
            >
              交換佈局
            </Button>
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
        InspectorPanelInternal={InspectorPanelInternal}
        isLeftPanelCollapsed={isLeftPanelCollapsed}
        handleToggleLeftPanel={handleToggleLeftPanel}
        topicTypeConfig={topicTypeConfig}
        codeMode={codeMode}
        handleModeToggle={handleModeToggle}
        currentCodeConfig={currentCodeConfig}
        highlightLines={highlightLines}
      />

      {/* Knowledge Station Dialog */}
      {topicTypeConfig && (
        <KnowledgeStation
          isOpen={isKnowledgeStationOpen}
          onClose={() => setIsKnowledgeStationOpen(false)}
          topicTypeConfig={topicTypeConfig}
        />
      )}

      {/* 資料數量限制警告 Toast */}
      <LimitWarningToast
        isOpen={showLimitToast}
        onClose={() => setShowLimitToast(false)}
        maxLimit={maxNodes ?? 10}
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
