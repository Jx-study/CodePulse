// frontend/src/pages/Explorer/Playground.tsx
import { Fragment, useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  hasSortableData,
} from "@dnd-kit/sortable";
import { Group as PanelGroup, Panel, Separator as PanelSeparator, type PanelImperativeHandle } from "react-resizable-panels";
import CytoscapeCanvas from "@/modules/core/Render/CytoscapeCanvas";
import { buildCallGraphElements, CALL_GRAPH_STYLESHEET, CALL_GRAPH_LAYOUT } from "@/modules/explorer/elements/callGraphElements";
import { buildCfgElements, CFG_STYLESHEET, CFG_LAYOUT } from "@/modules/explorer/elements/cfgElements";
import CodeEditor from "@/modules/core/components/CodeEditor";
import ControlBar from "@/modules/core/components/ControlBar";
import Button from "@/shared/components/Button";
import EmptyState from "@/shared/components/EmptyState";
import Icon from "@/shared/components/Icon";
import TabList from "@/shared/components/Tabs/TabList";
import { toast } from "@/shared/components/Toast/toast";
import { LeftActivityBar, RightActivityBar } from "./components/ActivityBar";
import { StatusBar } from "./components/StatusBar";
import type { RunStage } from "./components/StatusBar";
import { DockablePanel } from "./components/DockablePanel";
import type { PanelId } from "./components/DockablePanel";
import { AiAnalysisDialog } from "./components/AiAnalysisDialog";
import type { AiResult, AlgoCandidate } from "./components/AiAnalysisDialog";
import type { TraceEvent, CallGraph, CfgGraphMap, CfgGraph, StdoutEvent } from "@/types/trace";
import styles from "./Playground.module.scss";

// Constants
const DEFAULT_CODE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
print("Sorted array is:", bubble_sort(arr))`;

// Types
type ViewTab   = "animation" | "graph";
type DrillState = { mode: "call_graph" } | { mode: "cfg"; funcId: string };

// Helper
function rebuildCallStack(trace: TraceEvent[], upToStep: number): string[] {
  const stack: string[] = [];
  for (let i = 0; i <= upToStep && i < trace.length; i++) {
    const ev = trace[i];
    if (ev.tag === "CALL") stack.push(ev.meta?.func_name ?? "");
    else if (ev.tag === "RETURN" && stack.length > 0) stack.pop();
  }
  return stack;
}

// Component
function Playground() {
  // Editor
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>("animation");

  // Playback
  const [currentStep, setCurrentStep]   = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Drill (call graph ↔ cfg)
  const [drill, setDrill] = useState<DrillState>({ mode: "call_graph" });

  // Trace data
  const [trace, setTrace]               = useState<TraceEvent[]>([]);
  const [callGraph, setCallGraph]       = useState<CallGraph | null>(null);
  const [cfgGraph, setCfgGraph]         = useState<CfgGraphMap>({});
  const [isTruncated, setIsTruncated]   = useState(false);
  const [stdoutEvents, setStdoutEvents] = useState<StdoutEvent[]>([]);

  // Run + stage
  const [runStage, setRunStage] = useState<RunStage>("idle");

  // Panel layout state
  // leftDockedId: which panel (if any) is docked below the editor on the left
  // rightOrder: order of all 4 panel IDs on the right bar
  // collapsedPanels: panels whose content is hidden (icon still shows)
  const [leftDockedId, setLeftDockedId]       = useState<PanelId | null>(null);
  const [rightOrder, setRightOrder]           = useState<PanelId[]>(["console", "localVars", "callStack", "globalVars"]);
  const [collapsedPanels, setCollapsedPanels] = useState<Set<PanelId>>(new Set());

  // AI Analysis
  const [aiResult, setAiResult]             = useState<AiResult | null>(null);
  const [top3Candidates, setTop3Candidates] = useState<AlgoCandidate[]>([]);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  // DnD
  const [isDragActive, setIsDragActive] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const editorPanelRef = useRef<PanelImperativeHandle>(null);

  const handleToggleEditor = useCallback(() => {
    const panel = editorPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  // Derived
  const totalSteps    = trace.length;
  const currentEvent  = trace[currentStep] ?? null;
  const activeLineno  = currentEvent?.meta?.lineno as number | undefined;
  const globalVars    = useMemo(() => currentEvent?.global_vars ?? {}, [currentEvent]);
  const localVars     = useMemo(() => currentEvent?.local_vars  ?? {}, [currentEvent]);
  const callStack     = useMemo(() => rebuildCallStack(trace, currentStep), [trace, currentStep]);
  const activeFrame   = callStack[callStack.length - 1] ?? null;

  // Animation unlocked once sandbox is done (stage = analysis or gemini or done)
  const isAnimationUnlocked = ["analysis", "gemini", "done"].includes(runStage);

  // Panels visible in the right sidebar (not docked left, not collapsed)
  const visibleRightPanels = rightOrder.filter(
    (id) => id !== leftDockedId && !collapsedPanels.has(id)
  );

  // Playback handlers
  const handlePlay       = useCallback(() => setIsPlaying(true), []);
  const handlePause      = useCallback(() => setIsPlaying(false), []);
  const handleReset      = useCallback(() => { setIsPlaying(false); setCurrentStep(0); }, []);
  const handleNext       = useCallback(() => setCurrentStep(s => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const handlePrev       = useCallback(() => setCurrentStep(s => Math.max(s - 1, 0)), []);
  const handleStepChange = useCallback((step: number) => setCurrentStep(step), []);
  const handleSpeedChange = useCallback((speed: number) => setPlaybackSpeed(speed), []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentStep(s => {
        if (s >= totalSteps - 1) { setIsPlaying(false); return s; }
        return s + 1;
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(id);
  }, [isPlaying, playbackSpeed, totalSteps]);

  useEffect(() => {
    if (isTruncated) toast.warning("Output may be truncated — trace limit reached");
  }, [isTruncated]);

  // Run handler
  const handleRun = useCallback(async () => {
    if (!code.trim()) { toast.error("Please enter some code before running."); return; }
    setRunStage("syntax_check");
    stopPolling();
    setTrace([]); setCallGraph(null); setCfgGraph({});
    setIsTruncated(false); setStdoutEvents([]);
    setCurrentStep(0); setIsPlaying(false); setDrill({ mode: "call_graph" });

    let taskId: string;
    try {
      const res = await fetch("/api/analyze/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      taskId = data.task_id;
    } catch (e) {
      setRunStage("idle");
      toast.error(e instanceof Error ? e.message : "Submit failed");
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res    = await fetch(`/api/analyze/status/${taskId}`);
        if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
        const status = await res.json();

        if (status.progress?.stage) {
          setRunStage(status.progress.stage as RunStage);
        }

        if (status.status === "completed") {
          stopPolling();
          const rRes   = await fetch(`/api/analyze/result/${taskId}`);
          if (!rRes.ok) throw new Error(`Result fetch failed: ${rRes.status}`);
          const result = await rRes.json();
          setTrace(result.execution_trace ?? []);
          setIsTruncated(result.is_truncated ?? false);
          setStdoutEvents(result.stdout_events ?? []);
          setRunStage("done");
          setAiResult({
            detected_algorithm: result.detected_algorithm ?? null,
            confidence_score:   result.confidence_score   ?? null,
            time_complexity:    result.time_complexity     ?? null,
            analysis_source:    result.analysis_source     ?? null,
            summary:            result.summary             ?? null,
            suggestions:        result.suggestions         ?? [],
          });
          setTop3Candidates(result.top3_candidates ?? []);
          setDrill({ mode: "call_graph" });
          setCurrentStep(0);
          setCfgGraph(result.cfg_graph ?? {});
          if (result.call_graph) {
            const mappedCallGraph: CallGraph = {
              ...result.call_graph,
              nodes: result.call_graph.nodes.map((n: { id: string; func_name: string; cfg: CfgGraph | null }) => ({
                id: n.id, funcName: n.func_name, cfg: n.cfg,
              })),
              edges: (result.call_graph.edges ?? []).map((e: { source: string; target: string; steps: number[]; return_steps: number[] }) => ({
                source: e.source, target: e.target, steps: e.steps ?? [], returnSteps: e.return_steps ?? [],
              })),
            };
            setCallGraph(mappedCallGraph);
          }
        } else if (status.status === "failed") {
          stopPolling();
          setRunStage("idle");
          toast.error("Analysis failed on server");
        }
      } catch (e) {
        stopPolling();
        setRunStage("idle");
        toast.error(e instanceof Error ? e.message : "Polling failed");
      }
    }, 2000);
  }, [code]);

  // Toggle collapse for a panel
  const handleTogglePanel = useCallback((id: PanelId) => {
    setCollapsedPanels(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // DnD
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = useCallback((_e: DragStartEvent) => setIsDragActive(true), []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setIsDragActive(false);
    const panelId = e.active.data.current?.panelId as PanelId | undefined;
    if (!panelId) return;

    // Scenario 1: Right → Left (drop on left drop zone)
    if (e.over?.id === "left-drop-zone") {
      const previouslyDocked = leftDockedId;
      setLeftDockedId(panelId);
      setRightOrder(prev => {
        // Remove dragged panel from rightOrder
        const without = prev.filter(id => id !== panelId);
        // If something was already docked, return it to end of rightOrder
        if (previouslyDocked && previouslyDocked !== panelId) {
          return [...without, previouslyDocked];
        }
        return without;
      });
      // Ensure it's not collapsed when docked
      setCollapsedPanels(prev => { const next = new Set(prev); next.delete(panelId); return next; });
      return;
    }

    // Scenario 2: Left → Right (undock — the left docked icon was dragged)
    if (panelId === leftDockedId) {
      setLeftDockedId(null);
      setRightOrder(prev => {
        // Insert at the dropped position if over a sortable item, otherwise append
        if (e.over && hasSortableData(e.over)) {
          const overId = e.over.id as PanelId;
          const overIndex = prev.indexOf(overId);
          if (overIndex !== -1) {
            const result = [...prev];
            result.splice(overIndex, 0, panelId);
            return result;
          }
        }
        return [...prev, panelId];
      });
      return;
    }

    // Scenario 3: Right → Right reorder
    if (hasSortableData(e.active) && e.over && hasSortableData(e.over)) {
      const overId = e.over.id as PanelId;
      setRightOrder(prev => {
        const oldIndex = prev.indexOf(panelId);
        const newIndex = prev.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, [leftDockedId]);

  // Render
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.playground}>
        {/* Left Activity Bar — fixed 42px, outside PanelGroup */}
        <LeftActivityBar
          isEditorOpen={isEditorOpen}
          onToggleEditor={handleToggleEditor}
          leftDockedId={leftDockedId}
          collapsedPanels={collapsedPanels}
          onToggleCollapse={handleTogglePanel}
          isDragActive={isDragActive}
        />

        {/* Resizable horizontal layout: left sidebar | canvas | right sidebar */}
        <PanelGroup
          orientation="horizontal"
          className={styles.panelGroupH}
          key={`h-${visibleRightPanels.length > 0 ? 1 : 0}`}
        >
          {/* Left Sidebar Panel */}
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
                key={leftDockedId && !collapsedPanels.has(leftDockedId) ? `left-2` : `left-1`}
              >
                <Panel defaultSize={leftDockedId && !collapsedPanels.has(leftDockedId) ? "60%" : "100%"} minSize="30%">
                  <div className={styles.editorPanelInner}>
                    <div className={styles.editorHeader}>
                      <div className={styles.editorFilename}>
                        <span className={styles.filenameDot} />
                        <span className={styles.filename}>main.py</span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={styles.runBtn}
                        onClick={handleRun}
                        disabled={runStage !== "idle" && runStage !== "done"}
                        icon={
                          runStage !== "idle" && runStage !== "done"
                            ? "hourglass-half"
                            : "play"
                        }
                      >
                        {runStage !== "idle" && runStage !== "done"
                          ? "Running…"
                          : "Run"}
                      </Button>
                    </div>
                    <div className={styles.editorBody}>
                      <CodeEditor
                        mode="single"
                        language="python"
                        value={code}
                        highlightedLine={
                          activeLineno != null ? [activeLineno] : null
                        }
                        onChange={setCode}
                        theme="auto"
                      />
                    </div>
                  </div>
                </Panel>

                {/* Left docked panel — shown when not collapsed */}
                {leftDockedId && !collapsedPanels.has(leftDockedId) && (
                  <>
                    <PanelSeparator className={styles.vResizeHandle} />
                    <Panel defaultSize="40%" minSize="20%">
                      <DockablePanel
                        id={leftDockedId}
                        subLabel={
                          leftDockedId === "localVars" && activeFrame
                            ? `· ${activeFrame === "<module>" ? "(global)" : activeFrame}`
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

          {/* Horizontal resize between left sidebar and canvas */}
          <PanelSeparator className={styles.hResizeHandle} />

          {/* Canvas Panel */}
          <Panel className={styles.canvasPanel} style={{ minWidth: 0 }}>
            <div className={styles.canvasArea}>
              <StatusBar stage={runStage} />

              <div className={styles.canvasTabBar}>
                <TabList
                  variant="underline"
                  size="sm"
                  activeTab={activeTab}
                  onChange={(key) => setActiveTab(key as ViewTab)}
                  aria-label="Visualization mode"
                  tabs={[
                    {
                      key: "animation",
                      label: "Algorithm Animation",
                      icon: <Icon name="diagram-project" />,
                    },
                    {
                      key: "graph",
                      label: "Call Graph / CFG",
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
                  title="查看 AI 分析結果"
                  aria-label="查看 AI 分析結果"
                >
                  {runStage === "gemini" ? (
                    <>
                      <span className={styles.aiBtnDot} /> AI Analysis…
                    </>
                  ) : (
                    <>✦ AI Analysis</>
                  )}
                </Button>
              </div>

              <div className={styles.graphArea}>
                {activeTab === "animation" ? (
                  <div className={styles.animationPlaceholder}>
                    <Icon name="film" />
                    <span>D3 Animation — coming next</span>
                  </div>
                ) : !callGraph ? (
                  <EmptyState
                    icon={<Icon name="circle-xmark" />}
                    title="No graph data"
                    description="Submit code to generate the call graph"
                  />
                ) : drill.mode === "cfg" ? (
                  (() => {
                    const node = callGraph.nodes.find(
                      (n) =>
                        n.id ===
                        (drill as { mode: "cfg"; funcId: string }).funcId,
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
                            Call Graph
                          </Button>
                          <span className={styles.cfgLabel}>
                            CFG ·{" "}
                            {node?.funcName ??
                              (drill as { mode: "cfg"; funcId: string }).funcId}
                          </span>
                        </div>
                        <CytoscapeCanvas
                          elements={buildCfgElements(
                            cfgGraph[node?.funcName ?? ""] ?? {
                              nodes: [],
                              edges: [],
                            },
                            activeLineno,
                          )}
                          stylesheet={CFG_STYLESHEET}
                          layout={CFG_LAYOUT}
                        />
                      </div>
                    );
                  })()
                ) : (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <CytoscapeCanvas
                      elements={buildCallGraphElements(
                        callGraph,
                        currentStep,
                        cfgGraph,
                      )}
                      stylesheet={CALL_GRAPH_STYLESHEET}
                      layout={CALL_GRAPH_LAYOUT}
                      onNodeClick={(funcId) => {
                        const node = callGraph?.nodes.find(
                          (n) => n.id === funcId,
                        );
                        if (!node) return;
                        const hasCfg =
                          node.funcName === "<module>"
                            ? "<module>" in cfgGraph &&
                              (cfgGraph["<module>"] as any)?.nodes?.length > 0
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

              <div className={styles.controlRow}>
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
                    {runStage === "idle"
                      ? "Run code to start"
                      : "Waiting for analysis…"}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Horizontal resize between canvas and right sidebar */}
          {visibleRightPanels.length > 0 && (
            <PanelSeparator className={styles.hResizeHandle} />
          )}

          {/* Right Sidebar Panel */}
          {visibleRightPanels.length > 0 && (
            <Panel
              defaultSize="20%"
              minSize="15%"
              maxSize="35%"
              className={styles.rightSidebarPanel}
              style={{ minWidth: 0 }}
            >
              <PanelGroup
                orientation="vertical"
                key={visibleRightPanels.join(",")}
              >
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
                            ? `· ${activeFrame === "<module>" ? "(global)" : activeFrame}`
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
                      <PanelSeparator className={styles.vResizeHandle} />
                    )}
                  </Fragment>
                ))}
              </PanelGroup>
            </Panel>
          )}
        </PanelGroup>

        {/* Right Activity Bar — fixed 42px, outside PanelGroup */}
        {/* SortableContext wraps the bar so icons can be reordered */}
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
        top3Candidates={top3Candidates}
        onApplyAlgorithm={(name) => {
          // TODO: trigger algorithm animation when animation system is ready
          console.log("Apply algorithm:", name);
        }}
      />
    </DndContext>
  );
}

// PanelContent helper (inline, no separate file)
interface PanelContentProps {
  id: PanelId;
  globalVars: Record<string, string>;
  localVars: Record<string, any>;
  callStack: string[];
  stdoutEvents: StdoutEvent[];
  currentStep: number;
}

function PanelContent({ id, globalVars, localVars, callStack, stdoutEvents, currentStep }: PanelContentProps) {
  if (id === "globalVars") {
    return Object.entries(globalVars).length === 0
      ? <span style={{ color: "var(--text-tertiary)" }}>—</span>
      : <>{Object.entries(globalVars).map(([k, v]) => <VarRow key={k} name={k} val={String(v)} />)}</>;
  }
  if (id === "localVars") {
    return Object.entries(localVars).length === 0
      ? <span style={{ color: "var(--text-tertiary)" }}>—</span>
      : <>{Object.entries(localVars).map(([k, v]) => <VarRow key={k} name={k} val={String(v)} />)}</>;
  }
  if (id === "callStack") {
    return callStack.length === 0
      ? <span style={{ color: "var(--text-tertiary)" }}>—</span>
      : <>{[...callStack].reverse().map((fname, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${i === 0 ? "var(--color-primary)" : "var(--border)"}`, padding: "2px 6px 2px 8px", marginBottom: 3, fontFamily: "monospace", fontSize: 11, color: i === 0 ? "var(--text-primary)" : "var(--text-tertiary)" }}>
            {i === 0 && <span style={{ color: "var(--color-primary)", marginRight: 4 }}>➔</span>}
            {fname === "<module>" ? "(global)" : fname}
          </div>
        ))}</>;
  }
  if (id === "console") {
    const lines = stdoutEvents.filter(e => e.step <= currentStep);
    return lines.length === 0
      ? <span style={{ color: "var(--text-tertiary)" }}>—</span>
      : <>{lines.map((e, i) => <div key={i} style={{ fontFamily: "monospace", fontSize: 10.5, color: "var(--text-primary)", lineHeight: 1.7 }}>{e.text}</div>)}</>;
  }
  return null;
}

function VarRow({ name, val }: { name: string; val: string }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "1px 0", fontSize: 11 }}>
      <span style={{ color: "var(--color-primary)", flex: "0 0 80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{name}</span>
      <span style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>{val}</span>
    </div>
  );
}

export default Playground;
