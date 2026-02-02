import { useState, useEffect, useMemo, useRef, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Panel, Group, PanelImperativeHandle } from "react-resizable-panels";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Breadcrumb from "@/shared/components/Breadcrumb";
import CodeEditor from "@/modules/core/components/CodeEditor/CodeEditor";
import { D3Canvas } from "@/modules/core/Render/D3Canvas";
import ControlBar from "@/modules/core/components/ControlBar/ControlBar";
import type { BreadcrumbItem } from "@/types";
import { getImplementationByLevelId } from "@/services/ImplementationService";
import styles from "./Tutorial.module.scss";
import { Link } from "@/modules/core/Render/D3Renderer";
import { Node as DataNode } from "@/modules/core/DataLogic/Node";
import { DataActionBar } from "@/modules/core/components/DataActionBar/DataActionBar";
import { AlgorithmActionBar } from "@/modules/core/components/AlgorithmActionBar/AlgorithmActionBar";
import { BaseElement } from "@/modules/core/DataLogic/BaseElement";
import { useDataStructureLogic } from "@/modules/core/hooks/useDataStructureLogic";
import { useAlgorithmLogic } from "@/modules/core/hooks/useAlgorithmLogic";
import { ResizeHandle } from "./components/ResizeHandle/ResizeHandle";
import { PanelHeader } from "./components/PanelHeader/PanelHeader";
import { PanelProvider, usePanelContext } from "./context/PanelContext";

function TutorialContent() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  // Use panel context for drag and drop
  const { mainPanelOrder, rightPanelOrder, swapMainPanels, reorderRightPanels } = usePanelContext();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Panel refs for programmatic control
  const leftPanelRef = useRef<PanelImperativeHandle>(null);
  const canvasPanelRef = useRef<PanelImperativeHandle>(null);

  // Collapse states
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isCanvasPanelCollapsed, setIsCanvasPanelCollapsed] = useState(false);
  const [isControlBarCollapsed, setIsControlBarCollapsed] = useState(false);
  const [isActionBarCollapsed, setIsActionBarCollapsed] = useState(false);

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

  // 1. 根據路由參數載入配置
  const topicTypeConfig = useMemo(() => {
    if (!levelId) return null;

    // 透過 levelId 取得實作配置
    const implementation = getImplementationByLevelId(levelId);
    return implementation;
  }, [levelId]);

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

  const [maxNodes, setMaxNodes] = useState(10);
  const [hasTailMode, setHasTailMode] = useState(false);

  // 監聽 canvas 容器尺寸變化
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({
          width: Math.max(400, width - 32), // 減去 padding
          height: Math.max(300, height - 32),
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 3. 計算目前的動畫步驟
  useEffect(() => {
    if (topicTypeConfig) {
      setCurrentStep(0);
      setIsPlaying(false);
    }
    // 注意：這裡刻意不加 listData，避免與 handleAddNode 的動畫衝突
  }, [topicTypeConfig]);

  useEffect(() => {
    if (!isAlgorithm && topicTypeConfig && !isProcessing) {
      executeAction("refresh", { hasTailMode });
      setCurrentStep(0);
    }
  }, [hasTailMode, isAlgorithm]);

  const currentStepData = activeSteps[currentStep];

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
    const steps = executeAction("add", {
      value,
      mode,
      index,
      maxNodes,
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
  const handleRandomData = () => {
    executeAction("random", { maxNodes, hasTailMode });
    setCurrentStep(0);
    setIsPlaying(false); // 不需要自動播放
  };

  // 重設：回到預設 10, 40, 30, 20
  const handleResetData = () => {
    executeAction("reset", { hasTailMode });
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // 載入輸入資料：解析字串並更新
  const handleLoadData = (raw: string) => {
    const parsed = raw
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));

    if (parsed.length === 0) return alert("請輸入有效的數字格式 (例如: 1,2,3)");
    const steps = executeAction("load", {
      data: parsed,
      maxNodes,
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

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, activeSteps.length - 1));
  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const handleReset = () => {
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
      setIsLeftPanelCollapsed(false);
    } else {
      panel.collapse();
      setIsLeftPanelCollapsed(true);
    }
  };

  const handleToggleCanvasPanel = () => {
    const panel = canvasPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
      setIsCanvasPanelCollapsed(false);
    } else {
      panel.collapse();
      setIsCanvasPanelCollapsed(true);
    }
  };

  const handleToggleControlBar = () => {
    setIsControlBarCollapsed((prev) => !prev);
  };

  const handleToggleActionBar = () => {
    setIsActionBarCollapsed((prev) => !prev);
  };

  // Drag and Drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to trigger drag
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    // Check if we're reordering main panels (horizontal)
    if (mainPanelOrder.includes(active.id as string) && mainPanelOrder.includes(over.id as string)) {
      const oldIndex = mainPanelOrder.indexOf(active.id as string);
      const newIndex = mainPanelOrder.indexOf(over.id as string);
      // For main panels, we just swap them
      swapMainPanels();
    }
    // Check if we're reordering right panels (vertical)
    else if (rightPanelOrder.includes(active.id as string) && rightPanelOrder.includes(over.id as string)) {
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

  const renderActionBar = () => {
    if (!topicTypeConfig) return <div>載入中...</div>;

    if (topicTypeConfig.type === "algorithm") {
      return (
        <AlgorithmActionBar
          onLoadData={handleLoadData}
          onRandomData={handleRandomData}
          onResetData={handleResetData}
          onRun={handleRunAlgorithm}
          disabled={isProcessing}
          category={category as any}
          algorithmId={topicTypeConfig?.id}
        />
      );
    } else if (topicTypeConfig.type === "dataStructure") {
      if (
        ["linkedlist", "stack", "queue", "array", "binarytree", "bst"].includes(
          topicTypeConfig.id,
        )
      ) {
        return (
          <DataActionBar
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onSearchNode={handleSearchNode}
            onPeek={handlePeek}
            onLoadData={handleLoadData}
            onResetData={handleResetData}
            onRandomData={handleRandomData}
            onMaxNodesChange={setMaxNodes}
            onTailModeChange={setHasTailMode}
            structureType={topicTypeConfig.id as any}
            disabled={isProcessing}
          />
        );
      }
    } else {
      return <div>未知的實作類型</div>;
    }
    return <div>此主題暫無操作介面</div>;
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: topicTypeConfig.categoryName,
      path: `/dashboard?category=${category}`,
    },
    { label: topicTypeConfig.name, path: null },
  ];

  // Debug logging
  useEffect(() => {
    console.log("Tutorial Debug:", {
      currentStep,
      totalSteps: activeSteps.length,
      isPlaying,
      playbackSpeed,
      currentStepData: {
        stepNumber: currentStepData?.stepNumber,
        description: currentStepData?.description,
        elementsCount: currentStepData?.elements?.length,
      },
    });
  }, [
    currentStep,
    currentStepData,
    isPlaying,
    playbackSpeed,
    activeSteps.length,
  ]);

  // Wrapper component that provides sortable functionality
  const SortablePanel = ({
    panelId,
    children,
  }: {
    panelId: string;
    children: (dragHandleProps: any, isDragging: boolean) => ReactNode;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: panelId,
    });

    const dragHandleProps = {
      ...attributes,
      ...listeners,
      style: {
        touchAction: 'none',
      }
    };

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition || 'transform 200ms ease',
      height: '100%',
      // 被拖拽的元素完全透明，讓 DragOverlay 代替顯示
      opacity: isDragging ? 0 : 1,
    };

    return (
      <div ref={setNodeRef} style={style}>
        {children(dragHandleProps, isDragging)}
      </div>
    );
  };

  return (
    <div className={styles.tutorialPage}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} showBackButton={true} />
        {!isMobile && (
          <button
            className={styles.swapButton}
            onClick={swapMainPanels}
            title="交換左右面板"
          >
            ⇄ 交換佈局
          </button>
        )}
      </div>

      <div className={styles.topSection}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={mainPanelOrder}
            strategy={horizontalListSortingStrategy}
          >
            <Group
              orientation={isMobile ? "vertical" : "horizontal"}
              id="tutorial-layout-h-v1"
            >
              {mainPanelOrder.flatMap((panelId, index) => {
                const isLeft = panelId === "codeEditor";
                const elements = [];

                if (isLeft) {
                  elements.push(
                    <Panel
                      key="codeEditor"
                      defaultSize={isMobile ? 30 : 30}
                      minSize="20%"
                      collapsible
                      panelRef={leftPanelRef}
                      onResize={() => {
                        setIsLeftPanelCollapsed(
                          leftPanelRef.current?.isCollapsed() ?? false,
                        );
                      }}
                    >
                      <div className={styles.pseudoCodeSection}>
                        <PanelHeader title="Pseudo Code" />
                        <div className={styles.pseudoCodeEditor}>
                          <CodeEditor
                            mode="single"
                            language="python"
                            value={topicTypeConfig.pseudoCode}
                            readOnly={true}
                            theme="auto"
                          />
                        </div>
                      </div>
                    </Panel>
                  );
                } else {
                  elements.push(
                    <Panel key="rightPanel" defaultSize={isMobile ? 70 : 65} minSize={isMobile ? "50%" : "60%"}>
                      <div className={styles.rightPanel}>
                        <SortableContext
                          items={rightPanelOrder}
                          strategy={verticalListSortingStrategy}
                        >
                          <Group orientation="vertical" id="tutorial-layout-v-v1">
                            {rightPanelOrder.flatMap((panelId, index) => {
                              const panels = [];

                              if (panelId === "canvas") {
                                panels.push(
                                  <SortablePanel key="canvas" panelId="canvas">
                                    {(dragHandleProps, isDragging) => (
                                      <Panel
                                        defaultSize={50}
                                        minSize="30%"
                                        collapsible
                                        panelRef={canvasPanelRef}
                                        onResize={() => {
                                          setIsCanvasPanelCollapsed(
                                            canvasPanelRef.current?.isCollapsed() ?? false,
                                          );
                                        }}
                                      >
                                        <div className={styles.visualizationSection}>
                                          <PanelHeader
                                            title="視覺化動畫"
                                            collapsible
                                            isCollapsed={isCanvasPanelCollapsed}
                                            onToggleCollapse={handleToggleCanvasPanel}
                                            draggable={!isMobile}
                                            dragHandleProps={dragHandleProps}
                                          />
                                          {!isCanvasPanelCollapsed && (
                                            <>
                                              <div
                                                ref={canvasContainerRef}
                                                className={styles.visualizationArea}
                                              >
                                                <D3Canvas
                                                  elements={currentStepData?.elements || []}
                                                  links={currentLinks}
                                                  width={canvasSize.width}
                                                  height={canvasSize.height}
                                                  structureType={topicTypeConfig?.id}
                                                />
                                              </div>
                                              <div className={styles.stepDescription}>
                                                {currentStepData?.description}
                                              </div>
                                              <div className={styles.controlBarSection}>
                                                <PanelHeader
                                                  title="播放控制"
                                                  collapsible
                                                  isCollapsed={isControlBarCollapsed}
                                                  onToggleCollapse={handleToggleControlBar}
                                                />
                                                {!isControlBarCollapsed && (
                                                  <div className={styles.controlBarContainer}>
                                                    <ControlBar
                                                      isPlaying={isPlaying}
                                                      currentStep={currentStep}
                                                      totalSteps={activeSteps.length}
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
                                                )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </Panel>
                                    )}
                                  </SortablePanel>
                                );
                              } else if (panelId === "actionBar") {
                                panels.push(
                                  <SortablePanel key="actionBar" panelId="actionBar">
                                    {(dragHandleProps, isDragging) => (
                                      <Panel defaultSize={40} minSize="20%">
                                        <div className={styles.actionPanel}>
                                          <PanelHeader
                                            title="資料操作"
                                            collapsible
                                            isCollapsed={isActionBarCollapsed}
                                            onToggleCollapse={handleToggleActionBar}
                                            draggable={!isMobile}
                                            dragHandleProps={dragHandleProps}
                                          />
                                          {!isActionBarCollapsed && (
                                            <div className={styles.actionBarContainer}>
                                              {renderActionBar()}
                                            </div>
                                          )}
                                        </div>
                                      </Panel>
                                    )}
                                  </SortablePanel>
                                );
                              }

                              if (index < rightPanelOrder.length - 1) {
                                panels.push(
                                  <ResizeHandle
                                    key={`resize-${panelId}`}
                                    direction="vertical"
                                    onDoubleClick={panelId === "canvas" ? handleToggleCanvasPanel : undefined}
                                  />
                                );
                              }

                              return panels;
                            })}
                          </Group>
                        </SortableContext>
                      </div>
                    </Panel>
                  );
                }

                if (index < mainPanelOrder.length - 1) {
                  elements.push(
                    <ResizeHandle
                      key={`resize-${panelId}`}
                      direction={isMobile ? "vertical" : "horizontal"}
                      onDoubleClick={handleToggleLeftPanel}
                      showCollapseButton={!isMobile}
                      isCollapsed={isLeftPanelCollapsed}
                      onToggleCollapse={handleToggleLeftPanel}
                      collapseButtonPosition="end"
                    />
                  );
                }

                return elements;
              })}
            </Group>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeDragId ? (
              <div className={styles.dragOverlay}>
                <PanelHeader
                  title={activeDragId === "canvas" ? "視覺化動畫" : "資料操作"}
                  draggable={true}
                  dragHandleProps={{
                    style: {
                      touchAction: 'none',
                      cursor: 'grabbing',
                    }
                  }}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Algorithm Info Section - Bottom */}
      <div className={styles.algorithmInfoSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>演算法說明</h3>
        </div>
        <div className={styles.infoContent}>
          <div className={styles.infoBlock}>
            <h4>演算法簡介</h4>
            <p>{topicTypeConfig.introduction}</p>
          </div>

          <div className={styles.infoBlock}>
            <h4>複雜度分析</h4>
            <div className={styles.complexityTable}>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>
                  時間複雜度（最佳）：
                </span>
                <span className={styles.complexityValue}>
                  {topicTypeConfig.complexity.timeBest}
                </span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>
                  時間複雜度（平均）：
                </span>
                <span className={styles.complexityValue}>
                  {topicTypeConfig.complexity.timeAverage}
                </span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>
                  時間複雜度（最差）：
                </span>
                <span className={styles.complexityValue}>
                  {topicTypeConfig.complexity.timeWorst}
                </span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>空間複雜度：</span>
                <span className={styles.complexityValue}>
                  {topicTypeConfig.complexity.space}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
