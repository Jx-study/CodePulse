import {
  Fragment,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Group as PanelGroup,
  Panel,
  type PanelImperativeHandle,
} from "react-resizable-panels";
import ResizeHandle from "@/shared/components/ResizeHandle";
import CytoscapeCanvas from "@/modules/core/Render/CytoscapeCanvas";
import {
  buildCallGraphElements,
  CALL_GRAPH_STYLESHEET,
  CALL_GRAPH_LAYOUT,
} from "@/modules/explorer/elements/callGraphElements";
import {
  buildCfgElements,
  CFG_STYLESHEET,
  CFG_LAYOUT,
} from "@/modules/explorer/elements/cfgElements";
import CodeEditor from "@/modules/core/components/CodeEditor";
import ControlBar from "@/modules/core/components/ControlBar";
import Button from "@/shared/components/Button";
import EmptyState from "@/shared/components/EmptyState";
import Icon from "@/shared/components/Icon";
import TabList from "@/shared/components/Tabs/TabList";
import { toast } from "@/shared/components/Toast";
import { LeftActivityBar, RightActivityBar } from "./components/ActivityBar";
import StatusBar from "./components";
import type { PlaygroundHistoryRecord } from "@/types/playgroundHistory";
import { PlaygroundHistoryDialog } from "./components/PlaygroundHistoryDialog";
import DockablePanel from "./components/DockablePanel";
import type { PanelId } from "./components/DockablePanel";
import AiAnalysisDialog from "./components/AiAnalysisDialog";
import AlgoDetectionDialog from "./components/AlgoDetectionDialog";
import { InputPromptDialog } from "./components/InputPromptDialog";
import type { CodeEditorHandle } from "@/modules/core/components/CodeEditor/CodeEditor";
import type { StdoutEvent } from "@/types/trace";
import {
  ALGORITHM_TO_CONVERTER_KEY,
  ALGORITHM_TO_IMPL_KEY,
} from "@/data/implementations/traceConverters";
import { useStatusConfig } from "@/modules/core/hooks/useStatusConfig";
import { D3Canvas } from "@/modules/core/Render/D3Canvas";
import { usePlaygroundPlayback } from "./hooks/usePlaygroundPlayback";
import { usePlaygroundAnimationSteps } from "./hooks/usePlaygroundAnimationSteps";
import { usePlaygroundPanelLayout } from "./hooks/usePlaygroundPanelLayout";
import { usePlaygroundRun } from "./hooks/usePlaygroundRun";
import styles from "./Playground.module.scss";

const DEFAULT_CODE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
print("Sorted array is:", bubble_sort(arr))`;

type ViewTab = "animation" | "graph";

function Playground() {
  const { t } = useTranslation("playground");
  const editorRef = useRef<CodeEditorHandle>(null);
  const editorPanelRef = useRef<PanelImperativeHandle>(null);

  const [code, setCode] = useState(DEFAULT_CODE);
  const [activeTab, setActiveTab] = useState<ViewTab>("animation");
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  // History dialog
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [quotaRecords, setQuotaRecords] = useState<PlaygroundHistoryRecord[] | null>(null);
  const quotaResolveRef = useRef<((decision: "proceed" | "skip") => void) | null>(null);

  // Panel layout
  const {
    leftDockedId,
    rightOrder,
    collapsedPanels,
    isDragActive,
    handleTogglePanel,
    handleDragStart,
    handleDragEnd,
  } = usePlaygroundPanelLayout();

  // Quota gate — opens history dialog and waits for resolution
  const onQuotaFull = useCallback(
    (records: PlaygroundHistoryRecord[]): Promise<"proceed" | "skip"> =>
      new Promise((resolve) => {
        setQuotaRecords(records);
        setIsHistoryOpen(true);
        quotaResolveRef.current = resolve;
      }),
    [],
  );

  // Playback
  const {
    currentStep,
    isPlaying,
    playbackSpeed,
    handlePlay,
    handlePause,
    handleReset,
    handleNext,
    handlePrev,
    handleStepChange,
    handleSpeedChange,
    resetAll,
    setTotalSteps,
  } = usePlaygroundPlayback();

  // Run logic
  const {
    runStage,
    trace,
    rawTrace,
    rawIndexMap,
    callGraph,
    cfgGraph,
    stdoutEvents,
    isTruncated,
    aiResult,
    top3Candidates,
    appliedAlgo,
    setAppliedAlgo,
    drill,
    setDrill,
    isAlgoDialogOpen,
    setIsAlgoDialogOpen,
    handleRun,
    handleForceRun,
    handleEditCode,
    loadFromHistory,
    inputPrompt,
  } = usePlaygroundRun({
    code,
    editorRef,
    onResetPlayback: resetAll,
    onQuotaFull,
  });

  // Animation steps + derived vars
  const {
    animationSteps,
    allStepsElements,
    totalSteps,
    activeLineno,
    globalVars,
    localVars,
    callStack,
    activeFrame,
  } = usePlaygroundAnimationSteps({
    trace,
    rawTrace,
    rawIndexMap,
    appliedAlgo,
    activeTab,
    currentStep,
  });

  // Keep playback ref in sync
  useEffect(() => {
    setTotalSteps(totalSteps);
  }, [totalSteps, setTotalSteps]);

  useEffect(() => {
    if (isTruncated) toast.warning(t("run.truncated"));
  }, [isTruncated, t]);

  useEffect(() => {
    if (!animationSteps.length && activeTab === "animation") {
      setActiveTab("graph");
    }
  }, [animationSteps.length, activeTab]);

  useEffect(() => {
    if (
      runStage === "done" &&
      aiResult?.detected_algorithm &&
      aiResult.detected_algorithm in ALGORITHM_TO_CONVERTER_KEY
    ) {
      setIsAlgoDialogOpen(true);
    }
  }, [runStage, aiResult, setIsAlgoDialogOpen]);

  const { statusConfig, statusColorMap } = useStatusConfig(
    appliedAlgo ? (ALGORITHM_TO_IMPL_KEY[appliedAlgo] ?? null) : null,
  );

  const isLocked = runStage !== "idle";
  const isAnimationUnlocked = ["analysis", "gemini", "done"].includes(runStage);
  const hasAnimationTemplate =
    animationSteps.length > 0 ||
    (runStage !== "idle" && !!appliedAlgo && appliedAlgo in ALGORITHM_TO_CONVERTER_KEY);

  const visibleRightPanels = rightOrder.filter(
    (id) => id !== leftDockedId && !collapsedPanels.has(id),
  );

  const handleToggleEditor = useCallback(() => {
    const panel = editorPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.playground}>
        <LeftActivityBar
          isEditorOpen={isEditorOpen}
          onToggleEditor={handleToggleEditor}
          leftDockedId={leftDockedId}
          collapsedPanels={collapsedPanels}
          onToggleCollapse={handleTogglePanel}
          isDragActive={isDragActive}
          isHistoryOpen={isHistoryOpen}
          onOpenHistory={() => {
            setQuotaRecords(null);
            setIsHistoryOpen(true);
          }}
        />

        <PanelGroup
          orientation="horizontal"
          className={styles.panelGroupH}
          key={`h-${visibleRightPanels.length > 0 ? 1 : 0}`}
        >
          <Panel
            defaultSize="30%"
            minSize="20%"
            maxSize="45%"
            collapsible
            panelRef={editorPanelRef}
            style={{ minWidth: 0 }}
            onResize={(size) => {
              setIsEditorOpen(size.asPercentage > 0);
            }}
            className={styles.leftSidebarPanel}
          >
            <PanelGroup
              orientation="vertical"
              key={
                leftDockedId && !collapsedPanels.has(leftDockedId)
                  ? `left-2`
                  : `left-1`
              }
            >
              <Panel
                defaultSize={
                  leftDockedId && !collapsedPanels.has(leftDockedId)
                    ? "60%"
                    : "100%"
                }
                minSize="30%"
              >
                <div className={styles.editorPanelInner}>
                  <div className={styles.editorHeader}>
                    <div className={styles.editorFilename}>
                      <span className={styles.filenameDot} />
                      <span className={styles.filename}>main.py</span>
                    </div>
                    {isLocked ? (
                      <div className={styles.editorBtnGroup}>
                        {runStage === "done" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleForceRun}
                            icon="rotate-right"
                          >
                            {t("ui.rerun")}
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          className={styles.editCodeBtn}
                          onClick={handleEditCode}
                          icon="pen-to-square"
                        >
                          {t("ui.editCode")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className={styles.runBtn}
                        onClick={() => handleRun()}
                        disabled={false}
                        icon="play"
                      >
                        {t("ui.run")}
                      </Button>
                    )}
                  </div>
                  <div
                    className={`${styles.editorBody} ${isLocked ? styles.editorBodyLocked : ""}`}
                  >
                    {isLocked && <div className={styles.editorLockMask} />}
                    <CodeEditor
                      ref={editorRef}
                      mode="single"
                      language="python"
                      value={code}
                      highlightedLine={activeLineno ?? null}
                      onChange={setCode}
                      theme="auto"
                      readOnly={isLocked}
                    />
                  </div>
                </div>
              </Panel>

              {leftDockedId && !collapsedPanels.has(leftDockedId) && (
                <>
                  <ResizeHandle direction="vertical" />
                  <Panel defaultSize="40%" minSize="20%">
                    <DockablePanel
                      id={leftDockedId}
                      subLabel={
                        leftDockedId === "localVars" && activeFrame
                          ? `· ${activeFrame === "<module>" ? t("ui.globalFrame") : activeFrame}`
                          : undefined
                      }
                    >
                      <PanelContent
                        id={leftDockedId}
                        globalVars={globalVars}
                        localVars={localVars}
                        callStack={callStack}
                        stdoutEvents={stdoutEvents}
                        currentStep={currentStep}
                      />
                    </DockablePanel>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          <ResizeHandle direction="horizontal" />

          <Panel className={styles.canvasPanel} style={{ minWidth: 0 }}>
            <div className={styles.canvasArea}>
              <StatusBar stage={runStage} />

              <div className={styles.canvasTabBar}>
                <TabList
                  variant="underline"
                  size="sm"
                  activeTab={activeTab}
                  onChange={(key) => {
                    setActiveTab(key as ViewTab);
                    handleStepChange(0);
                    handlePause();
                  }}
                  aria-label="Visualization mode"
                  tabs={[
                    ...(hasAnimationTemplate
                      ? [
                          {
                            key: "animation",
                            label: t("ui.tabAnimation"),
                            icon: <Icon name="diagram-project" />,
                          },
                        ]
                      : []),
                    {
                      key: "graph",
                      label: t("ui.tabGraph"),
                      icon: <Icon name="code-branch" />,
                    },
                  ]}
                />
                {isTruncated && (
                  <span className={styles.truncatedBadge}>⚠ truncated</span>
                )}
                <Button
                  variant="unstyled"
                  className={`${styles.aiBtn} ${
                    runStage === "idle"
                      ? styles.aiBtnDisabled
                      : runStage === "done"
                        ? styles.aiBtnActive
                        : styles.aiBtnLoading
                  }`}
                  disabled={runStage !== "done"}
                  onClick={() => setIsAiDialogOpen(true)}
                  title={t("ui.aiAnalysisTitle")}
                  aria-label={t("ui.aiAnalysisTitle")}
                >
                  {runStage === "analysis" ? (
                    <>
                      <span className={styles.aiBtnDot} /> {t("ui.aiAnalysisLoading")}
                    </>
                  ) : (
                    <>{t("ui.aiAnalysis")}</>
                  )}
                </Button>
              </div>

              <div
                className={`${styles.graphArea} ${activeTab === "animation" ? styles.graphAreaCanvas : ""}`}
              >
                {activeTab === "animation" ? (
                  animationSteps.some((s) => (s.elements?.length ?? 0) > 0) ? (
                    <D3Canvas
                      elements={animationSteps[currentStep]?.elements ?? []}
                      allStepsElements={allStepsElements}
                      structureType="array"
                      enableZoom
                      enablePan
                      statusColorMap={statusColorMap}
                      statusConfig={statusConfig}
                    />
                  ) : (
                    <EmptyState
                      size="md"
                      icon={<Icon name="film" />}
                      title={t("empty.animationTitle")}
                      description={t("empty.animationDesc")}
                    />
                  )
                ) : !callGraph ? (
                  <EmptyState
                    size="md"
                    icon={<Icon name="diagram-project" />}
                    title={t("empty.graphTitle")}
                    description={t("empty.graphDesc")}
                  />
                ) : drill.mode === "cfg" ? (
                  (() => {
                    const node = callGraph.nodes.find(
                      (n) => n.id === (drill as { mode: "cfg"; funcId: string }).funcId,
                    );
                    return (
                      <div className={styles.cfgPanel}>
                        <div className={styles.cfgHeader}>
                          <Button
                            variant="unstyled"
                            className={styles.cfgBackBtn}
                            onClick={() => setDrill({ mode: "call_graph" })}
                            iconLeft={<Icon name="chevron-left" />}
                          >
                            {t("ui.callGraph")}
                          </Button>
                          <span className={styles.cfgLabel}>
                            {t("ui.cfgPrefix")}{" "}
                            {node?.funcName === "<module>"
                              ? t("ui.globalFrame")
                              : (node?.funcName ??
                                (drill as { mode: "cfg"; funcId: string }).funcId)}
                          </span>
                        </div>
                        <CytoscapeCanvas
                          elements={buildCfgElements(
                            cfgGraph[
                              node?.funcName === "<module>"
                                ? "<global>"
                                : (node?.funcName ?? "")
                            ] ?? { nodes: [], edges: [] },
                            activeLineno?.[0],
                          )}
                          stylesheet={CFG_STYLESHEET}
                          layout={CFG_LAYOUT}
                        />
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <CytoscapeCanvas
                      elements={buildCallGraphElements(callGraph, currentStep, cfgGraph)}
                      stylesheet={CALL_GRAPH_STYLESHEET}
                      layout={CALL_GRAPH_LAYOUT}
                      onNodeClick={(funcId) => {
                        const node = callGraph?.nodes.find((n) => n.id === funcId);
                        if (!node) return;
                        const hasCfg =
                          node.funcName === "<module>"
                            ? "<global>" in cfgGraph &&
                              (cfgGraph["<global>"] as any)?.nodes?.length > 0
                            : node.funcName in cfgGraph;
                        if (!hasCfg) return;
                        setDrill({ mode: "cfg", funcId });
                      }}
                    />
                    <div className={styles.callGraphLegend}>
                      <span className={styles.legendItem}>
                        <span className={styles.legendLineSolid} /> call
                      </span>
                      <span className={styles.legendItem}>
                        <span className={styles.legendLineDashed} /> return
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`${styles.controlRow} ${runStage === "idle" ? styles.controlRowHidden : ""}`}
              >
                {totalSteps > 0 && isAnimationUnlocked ? (
                  <ControlBar
                    isPlaying={isPlaying}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    playbackSpeed={playbackSpeed}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onReset={handleReset}
                    onSpeedChange={handleSpeedChange}
                    onStepChange={handleStepChange}
                  />
                ) : (
                  <div className={styles.emptyControl}>
                    {runStage === "idle" ? t("ui.runToStart") : t("ui.waitingAnalysis")}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {visibleRightPanels.length > 0 && <ResizeHandle direction="horizontal" />}

          {visibleRightPanels.length > 0 && (
            <Panel
              defaultSize="20%"
              minSize="15%"
              maxSize="35%"
              className={styles.rightSidebarPanel}
              style={{ minWidth: 0 }}
            >
              <PanelGroup orientation="vertical" key={visibleRightPanels.join(",")}>
                {visibleRightPanels.map((id, idx) => (
                  <Fragment key={id}>
                    <Panel
                      defaultSize={Math.floor(100 / visibleRightPanels.length)}
                      minSize="15%"
                    >
                      <DockablePanel
                        id={id}
                        subLabel={
                          id === "localVars" && activeFrame
                            ? `· ${activeFrame === "<module>" ? t("ui.globalFrame") : activeFrame}`
                            : undefined
                        }
                      >
                        <PanelContent
                          id={id}
                          globalVars={globalVars}
                          localVars={localVars}
                          callStack={callStack}
                          stdoutEvents={stdoutEvents}
                          currentStep={currentStep}
                        />
                      </DockablePanel>
                    </Panel>
                    {idx < visibleRightPanels.length - 1 && (
                      <ResizeHandle direction="vertical" />
                    )}
                  </Fragment>
                ))}
              </PanelGroup>
            </Panel>
          )}
        </PanelGroup>

        <SortableContext
          items={rightOrder.filter((id) => id !== leftDockedId)}
          strategy={verticalListSortingStrategy}
        >
          <RightActivityBar
            rightOrder={rightOrder}
            leftDockedId={leftDockedId}
            collapsedPanels={collapsedPanels}
            isDragActive={isDragActive}
            onTogglePanel={handleTogglePanel}
          />
        </SortableContext>
      </div>

      <AiAnalysisDialog
        isOpen={isAiDialogOpen}
        onClose={() => setIsAiDialogOpen(false)}
        runStage={runStage}
        aiResult={aiResult}
      />
      <AlgoDetectionDialog
        isOpen={isAlgoDialogOpen}
        onClose={() => setIsAlgoDialogOpen(false)}
        aiResult={aiResult}
        top3Candidates={top3Candidates}
        onApply={(name) => {
          setAppliedAlgo(name);
        }}
      />
      <InputPromptDialog
        isOpen={inputPrompt !== null}
        prompt={inputPrompt?.prompt ?? ""}
        inputIndex={inputPrompt?.inputIndex ?? 0}
        onSubmit={(value) => inputPrompt?.resolve(value)}
        onCancel={() => inputPrompt?.resolve(null)}
      />
      <PlaygroundHistoryDialog
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setQuotaRecords(null);
          quotaResolveRef.current?.("skip");
          quotaResolveRef.current = null;
        }}
        onReplay={(record) => {
          setCode(record.user_code);
          loadFromHistory(record);
        }}
        quotaRecords={quotaRecords}
        onQuotaResolved={(decision) => {
          quotaResolveRef.current?.(decision);
          quotaResolveRef.current = null;
        }}
      />
    </DndContext>
  );
}

// PanelContent — inline helper, no separate file needed
interface PanelContentProps {
  id: PanelId;
  globalVars: Record<string, string>;
  localVars: Record<string, any>;
  callStack: string[];
  stdoutEvents: StdoutEvent[];
  currentStep: number;
}

function PanelContent({
  id,
  globalVars,
  localVars,
  callStack,
  stdoutEvents,
  currentStep,
}: PanelContentProps) {
  const { t } = useTranslation("playground");
  if (id === "globalVars") {
    return Object.entries(globalVars).length === 0 ? (
      <span style={{ color: "var(--text-tertiary)" }}>—</span>
    ) : (
      <>
        {Object.entries(globalVars).map(([k, v]) => (
          <VarRow key={k} name={k} val={String(v)} />
        ))}
      </>
    );
  }
  if (id === "localVars") {
    return Object.entries(localVars).length === 0 ? (
      <span style={{ color: "var(--text-tertiary)" }}>—</span>
    ) : (
      <>
        {Object.entries(localVars).map(([k, v]) => (
          <VarRow key={k} name={k} val={String(v)} />
        ))}
      </>
    );
  }
  if (id === "callStack") {
    return callStack.length === 0 ? (
      <span style={{ color: "var(--text-tertiary)" }}>—</span>
    ) : (
      <>
        {[...callStack].reverse().map((fname, i) => (
          <div
            key={i}
            style={{
              borderLeft: `2px solid ${i === 0 ? "var(--color-primary)" : "var(--border)"}`,
              padding: "2px 6px 2px 8px",
              marginBottom: 3,
              fontFamily: "monospace",
              fontSize: 11,
              color: i === 0 ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
          >
            {i === 0 && (
              <span style={{ color: "var(--color-primary)", marginRight: 4 }}>➔</span>
            )}
            {fname === "<module>" ? t("ui.globalFrame") : fname}
          </div>
        ))}
      </>
    );
  }
  if (id === "console") {
    const lines = stdoutEvents.filter((e) => e.step <= currentStep);
    return lines.length === 0 ? (
      <span style={{ color: "var(--text-tertiary)" }}>—</span>
    ) : (
      <>
        {lines.map((e, i) => (
          <div
            key={i}
            style={{
              fontFamily: "monospace",
              fontSize: 10.5,
              color: "var(--text-primary)",
              lineHeight: 1.7,
            }}
          >
            {e.text}
          </div>
        ))}
      </>
    );
  }
  return null;
}

function VarRow({ name, val }: { name: string; val: string }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "1px 0", fontSize: 11 }}>
      <span
        style={{
          color: "var(--color-primary)",
          flex: "0 0 80px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: "monospace",
        }}
      >
        {name}
      </span>
      <span style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
        {val}
      </span>
    </div>
  );
}

export default Playground;
