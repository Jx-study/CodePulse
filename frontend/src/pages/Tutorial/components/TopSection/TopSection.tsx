import { Fragment, useMemo } from 'react';
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

  // InspectorPanel Component
  InspectorPanelInternal: React.ComponentType;

  // Collapse 控制
  isLeftPanelCollapsed: boolean;
  handleToggleLeftPanel: () => void;

  // Topic 配置
  topicTypeConfig: any;

  // CodeEditor 新功能 (from main branch)
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
    InspectorPanelInternal,
    isLeftPanelCollapsed,
    handleToggleLeftPanel,
    topicTypeConfig,
    codeMode,
    handleModeToggle,
    currentCodeConfig,
    highlightLines,
  } = props;

  const { panelSizes, setCollapsed } = usePanelContext();

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
                  defaultSize={
                    isLeftPanelCollapsed
                      ? 0
                      : (isMobile ? 30 : panelSizes.codeEditor)
                  }
                  minSize="20%"
                  collapsible
                  panelRef={leftPanelRef}
                  onResize={(size) => {
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
                  onDoubleClick={handleToggleLeftPanel}
                  showCollapseButton={!isMobile}
                  isCollapsed={isLeftPanelCollapsed}
                  onToggleCollapse={handleToggleLeftPanel}
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
                                  <InspectorPanelInternal />
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
                                  <InspectorPanelInternal />
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
                  onDoubleClick={handleToggleLeftPanel}
                  showCollapseButton={!isMobile}
                  isCollapsed={isLeftPanelCollapsed}
                  onToggleCollapse={handleToggleLeftPanel}
                  collapseButtonPosition="start"
                  collapseDirection="right"
                />

                <Panel
                  id="code-editor-panel"
                  key="codeEditor"
                  defaultSize={
                    isLeftPanelCollapsed
                      ? 0
                      : (isMobile ? 30 : panelSizes.codeEditor)
                  }
                  minSize="20%"
                  collapsible
                  panelRef={leftPanelRef}
                  onResize={(size) => {
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
