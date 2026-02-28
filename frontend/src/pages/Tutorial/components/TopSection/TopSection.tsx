import { Fragment, useMemo, useRef, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DragOverlay } from '@dnd-kit/core';
import { SmartPointerSensor } from '@/shared/utils/SmartPointerSensor';
import { Panel, Group, PanelImperativeHandle } from 'react-resizable-panels';
import ResizeHandle from '../ResizeHandle';
import PanelHeader from '../PanelHeader';
import { TabConfig } from '@/shared/components/Tabs';
import CodeEditor from '@/modules/core/components/CodeEditor/CodeEditor';
import { usePanelContext } from '../../context/PanelContext';
import { InspectorPanelInternal, type InspectorPanelInternalProps } from '../../Tutorial';
import styles from './TopSection.module.scss';

interface CanvasPanelProps {
  canvasPanelRef: React.RefObject<PanelImperativeHandle | null>;
  isMobile: boolean;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  currentStepData: any;
  currentLinks: any[];
  canvasSize: { width: number; height: number };
  topicTypeConfig: any;
  currentStatusColorMap: any;
  currentStatusConfig: any;
  isDirected: boolean;
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

interface TopSectionProps {
  // DnD 相關
  activeDragId: string | null;
  mainPanelOrder: string[];
  rightPanelOrder: string[];
  handleDragStart: (event: any) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;

  // 響應式
  isMobile: boolean;

  // Panel Refs
  leftPanelRef: React.RefObject<PanelImperativeHandle | null>;
  rightPanelRef: React.RefObject<PanelImperativeHandle | null>;
  canvasPanelRef: React.RefObject<PanelImperativeHandle | null>;
  inspectorPanelRef: React.RefObject<PanelImperativeHandle | null>;

  // CanvasPanel Component
  CanvasPanel: React.ComponentType<CanvasPanelProps>;
  canvasPanelProps: CanvasPanelProps;

  // InspectorPanel Props
  inspectorPanelProps: InspectorPanelInternalProps;

  // Collapse 控制
  isLeftPanelCollapsed: boolean;
  handleToggleLeftPanel: () => void;

  // Topic 配置
  topicTypeConfig: any;

  // CodeEditor
  codeMode: "pseudo" | "python";
  handleModeToggle: (mode: "pseudo" | "python") => void;
  currentCodeConfig: any;
  highlightLines: number[];
}

export function TopSection(props: TopSectionProps) {
  const {
    activeDragId,
    mainPanelOrder,
    rightPanelOrder,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isMobile,
    leftPanelRef,
    rightPanelRef,
    inspectorPanelRef,
    CanvasPanel,
    canvasPanelProps,
    inspectorPanelProps,
    isLeftPanelCollapsed,
    handleToggleLeftPanel,
    topicTypeConfig,
    codeMode,
    handleModeToggle,
    currentCodeConfig,
    highlightLines,
  } = props;

  const { panelSizes, setCollapsed } = usePanelContext();

  const codeEditorDefaultSizeRef = useRef(
    isLeftPanelCollapsed ? 0 : (isMobile ? 30 : panelSizes.codeEditor)
  );
  const prevMainPanelOrderRef = useRef(mainPanelOrder);
  if (prevMainPanelOrderRef.current !== mainPanelOrder) {
    prevMainPanelOrderRef.current = mainPanelOrder;
    codeEditorDefaultSizeRef.current = isLeftPanelCollapsed ? 0 : (isMobile ? 30 : panelSizes.codeEditor);
  }

  const collapsingRef = useRef(false);

  const handleToggleLeftPanelWithLock = useCallback(() => {
    if (!isLeftPanelCollapsed) {
      collapsingRef.current = true;
    }
    handleToggleLeftPanel();
  }, [handleToggleLeftPanel, isLeftPanelCollapsed]);

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // CodeEditor Tabs 配置
  const codeEditorTabs: TabConfig[] = useMemo(() => [
    { key: 'pseudo', label: 'Pseudo' },
    { key: 'python', label: 'Python' },
  ], []);

  return (
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
            id={`tutorial-layout-h-${mainPanelOrder.join('-')}`}
          >
            {mainPanelOrder[0] === "codeEditor" ? (
              <>
                <Panel
                  id="code-editor-panel"
                  key="codeEditor"
                  defaultSize={codeEditorDefaultSizeRef.current}
                  minSize="20%"
                  collapsible
                  panelRef={leftPanelRef}
                  onResize={(size) => {
                    if (collapsingRef.current) {
                      if (size.asPercentage === 0) {
                        collapsingRef.current = false;
                        setCollapsed('codeEditor', true);
                      }
                      return;
                    }
                    const collapsed = size.asPercentage === 0;
                    if (collapsed !== isLeftPanelCollapsed) {
                      setCollapsed('codeEditor', collapsed);
                    }
                  }}
                >
                  <div className={styles.pseudoCodeSection}>
                    <PanelHeader
                      title="代碼實作"
                      tabs={codeEditorTabs}
                      activeTab={codeMode}
                      onTabChange={(key) => handleModeToggle(key as "pseudo" | "python")}
                    />
                    <div className={styles.pseudoCodeEditor}>
                      <CodeEditor
                        key={`editor-${mainPanelOrder.join("-")}`}
                        mode="single"
                        language="python"
                        value={currentCodeConfig?.[codeMode]?.content || ""}
                        highlightedLine={highlightLines}
                        readOnly={codeMode === "pseudo"}
                        theme="auto"
                      />
                    </div>
                  </div>
                </Panel>

                <ResizeHandle
                  direction={isMobile ? "vertical" : "horizontal"}
                  onDoubleClick={handleToggleLeftPanelWithLock}
                  showCollapseButton={!isMobile}
                  isCollapsed={isLeftPanelCollapsed}
                  onToggleCollapse={handleToggleLeftPanelWithLock}
                  collapseButtonPosition="end"
                  collapseDirection="left"
                />

                <Panel
                  id="right-panel-container"
                  key="rightPanel"
                  defaultSize={isMobile ? 70 : panelSizes.rightPanel}
                  minSize={isMobile ? "50%" : "60%"}
                  panelRef={rightPanelRef}
                >
                  <div className={styles.rightPanel}>
                    <SortableContext
                      items={rightPanelOrder}
                      strategy={verticalListSortingStrategy}
                    >
                      <Group
                        key={`group-${rightPanelOrder.join("-")}`}
                        orientation="vertical"
                        id="tutorial-layout-v-v1"
                      >
                        {rightPanelOrder.map((panelId, index) => {
                          if (panelId === "canvas") {
                            return (
                              <Fragment key={panelId}>
                                <CanvasPanel {...canvasPanelProps} />
                                {index < rightPanelOrder.length - 1 && (
                                  <ResizeHandle direction="vertical" />
                                )}
                              </Fragment>
                            );
                          } else if (panelId === "inspector") {
                            return (
                              <Fragment key={panelId}>
                                <Panel
                                  id="inspector-panel"
                                  panelRef={inspectorPanelRef}
                                  defaultSize={30}
                                  minSize="20%"
                                >
                                  <InspectorPanelInternal {...inspectorPanelProps} />
                                </Panel>
                                {index < rightPanelOrder.length - 1 && (
                                  <ResizeHandle direction="vertical" />
                                )}
                              </Fragment>
                            );
                          }
                          return null;
                        })}
                      </Group>
                    </SortableContext>
                  </div>
                </Panel>
              </>
            ) : (
              <>
                <Panel
                  id="right-panel-container"
                  key="rightPanel"
                  defaultSize={isMobile ? 70 : panelSizes.rightPanel}
                  minSize={isMobile ? "50%" : "60%"}
                  panelRef={rightPanelRef}
                >
                  <div className={styles.rightPanel}>
                    <SortableContext
                      items={rightPanelOrder}
                      strategy={verticalListSortingStrategy}
                    >
                      <Group
                        key={`group-${rightPanelOrder.join("-")}`}
                        orientation="vertical"
                        id="tutorial-layout-v-v1"
                      >
                        {rightPanelOrder.map((panelId, index) => {
                          if (panelId === "canvas") {
                            return (
                              <Fragment key={panelId}>
                                <CanvasPanel {...canvasPanelProps} />
                                {index < rightPanelOrder.length - 1 && (
                                  <ResizeHandle direction="vertical" />
                                )}
                              </Fragment>
                            );
                          } else if (panelId === "inspector") {
                            return (
                              <Fragment key={panelId}>
                                <Panel
                                  id="inspector-panel"
                                  panelRef={inspectorPanelRef}
                                  defaultSize={25}
                                  minSize="20%"
                                >
                                  <InspectorPanelInternal {...inspectorPanelProps} />
                                </Panel>
                                {index < rightPanelOrder.length - 1 && (
                                  <ResizeHandle direction="vertical" />
                                )}
                              </Fragment>
                            );
                          }
                          return null;
                        })}
                      </Group>
                    </SortableContext>
                  </div>
                </Panel>

                <ResizeHandle
                  direction={isMobile ? "vertical" : "horizontal"}
                  onDoubleClick={handleToggleLeftPanelWithLock}
                  showCollapseButton={!isMobile}
                  isCollapsed={isLeftPanelCollapsed}
                  onToggleCollapse={handleToggleLeftPanelWithLock}
                  collapseButtonPosition="start"
                  collapseDirection="right"
                />

                <Panel
                  id="code-editor-panel"
                  key="codeEditor"
                  defaultSize={codeEditorDefaultSizeRef.current}
                  minSize="20%"
                  collapsible
                  panelRef={leftPanelRef}
                  onResize={(size) => {
                    if (collapsingRef.current) {
                      if (size.asPercentage === 0) {
                        collapsingRef.current = false;
                        setCollapsed('codeEditor', true);
                      }
                      return;
                    }
                    const collapsed = size.asPercentage === 0;
                    if (collapsed !== isLeftPanelCollapsed) {
                      setCollapsed('codeEditor', collapsed);
                    }
                  }}
                >
                  <div className={styles.pseudoCodeSection}>
                    <PanelHeader
                      title="代碼實作"
                      tabs={codeEditorTabs}
                      activeTab={codeMode}
                      onTabChange={(key) => handleModeToggle(key as "pseudo" | "python")}
                    />
                    <div className={styles.pseudoCodeEditor}>
                      <CodeEditor
                        key={`editor-${mainPanelOrder.join("-")}`}
                        mode="single"
                        language="python"
                        value={currentCodeConfig?.[codeMode]?.content || ""}
                        highlightedLine={highlightLines}
                        readOnly={codeMode === "pseudo"}
                        theme="auto"
                      />
                    </div>
                  </div>
                </Panel>
              </>
            )}
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
                    touchAction: "none",
                    cursor: "grabbing",
                  },
                }}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default TopSection;
