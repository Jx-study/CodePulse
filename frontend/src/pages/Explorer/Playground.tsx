import { useState, useRef, useCallback, useMemo } from "react";
import CytoscapeCanvas from "@/modules/core/Render/CytoscapeCanvas";
import { buildCallGraphElements, CALL_GRAPH_STYLESHEET, CALL_GRAPH_LAYOUT } from "@/modules/explorer/elements/callGraphElements";
import { buildCfgElements, CFG_STYLESHEET, CFG_LAYOUT } from "@/modules/explorer/elements/cfgElements";
import CodeEditor from "@/modules/core/components/CodeEditor";
import ControlBar from "@/modules/core/components/ControlBar";
import Button from "@/shared/components/Button";
import EmptyState from "@/shared/components/EmptyState";
import Icon from "@/shared/components/Icon";
import TabList from "@/shared/components/Tabs/TabList";
import type { TraceEvent, CallGraph, CfgGraphMap, CfgGraph } from "@/types/trace";
import styles from "./Playground.module.scss";

// ── Default code ──────────────────────────────────────────────────────────────

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
type RunStatus = "idle" | "running" | "error";
type DrillState = { mode: "call_graph" } | { mode: "cfg"; funcId: string };

// ── Helper ────────────────────────────────────────────────────────────────────

function rebuildCallStack(trace: TraceEvent[], upToStep: number): string[] {
  const stack: string[] = [];
  for (let i = 0; i <= upToStep && i < trace.length; i++) {
    const ev = trace[i];
    if (ev.tag === "CALL") stack.push(ev.meta?.func_name ?? "");
    else if (ev.tag === "RETURN" && stack.length > 0) stack.pop();
  }
  return stack;
}

// ── Component ─────────────────────────────────────────────────────────────────

function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>("animation");

  // Playback state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Drill state (call_graph ↔ cfg)
  const [drill, setDrill] = useState<DrillState>({ mode: "call_graph" });

  // Trace data
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [callGraph, setCallGraph] = useState<CallGraph | null>(null);
  const [cfgGraph, setCfgGraph] = useState<CfgGraphMap>({});
  const [isTruncated, setIsTruncated] = useState(false);
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // Playback handlers
  const totalSteps = trace.length;
  const currentEvent = trace[currentStep] ?? null;
  const activeLineno = currentEvent?.meta?.lineno as number | undefined;
  const globalVars = useMemo(() => currentEvent?.global_vars ?? {}, [currentEvent]);
  const localVars = useMemo(() => currentEvent?.local_vars ?? {}, [currentEvent]);
  const callStack = useMemo(() => rebuildCallStack(trace, currentStep), [trace, currentStep]);
  const activeFrame = callStack[callStack.length - 1] ?? null;

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleReset = useCallback(() => { setIsPlaying(false); setCurrentStep(0); }, []);
  const handleNext = useCallback(() => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const handlePrev = useCallback(() => setCurrentStep((s) => Math.max(s - 1, 0)), []);
  const handleStepChange = useCallback((step: number) => setCurrentStep(step), []);
  const handleSpeedChange = useCallback((speed: number) => setPlaybackSpeed(speed), []);

  // Run handler
  const handleRun = useCallback(async () => {
    setRunStatus("running");
    setErrorMsg(null);
    stopPolling();

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
      setRunStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Submit failed");
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze/status/${taskId}`);
        if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
        const status = await res.json();

        if (status.status === "completed") {
          stopPolling();
          const rRes = await fetch(`/api/analyze/result/${taskId}`);
          if (!rRes.ok) throw new Error(`Result fetch failed: ${rRes.status}`);
          const result = await rRes.json();
          setTrace(result.execution_trace ?? []);
          setIsTruncated(result.is_truncated ?? false);
          setRunStatus("idle");

          // cfg_graph 直接存入（key 已是 func name string）
          setCfgGraph(result.cfg_graph ?? {});

          // call_graph.nodes 做 func_name → funcName mapping（後端 JSON key 是 snake_case）
          if (result.call_graph) {
            const mappedCallGraph: CallGraph = {
              ...result.call_graph,
              nodes: result.call_graph.nodes.map((n: { id: string; func_name: string; cfg: CfgGraph | null }) => ({
                id: n.id,
                funcName: n.func_name,
                cfg: n.cfg,
              })),
            };
            setCallGraph(mappedCallGraph);
          }
        } else if (status.status === "failed") {
          stopPolling();
          setRunStatus("error");
          setErrorMsg("Analysis failed on server");
        }
      } catch (e) {
        stopPolling();
        setRunStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Polling failed");
      }
    }, 2000);
  }, [code]);

  return (
    <div className={styles.playground}>
      <div className={styles.mainContent}>

        {/* Left: collapsible editor */}
        <div className={`${styles.editorPanel} ${isEditorOpen ? styles.editorPanelOpen : styles.editorPanelClosed}`}>
          <div className={styles.editorInner}>
            {errorMsg && (
              <div className={styles.errorBanner}>
                <Icon name="exclamation-triangle" />
                {errorMsg}
              </div>
            )}
            <div className={styles.editorHeader}>
              <div className={styles.editorFilename}>
                <span className={styles.filenameDot} />
                <span className={styles.filename}>main.py</span>
              </div>
              <div className={styles.editorHeaderActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  className={styles.runBtn}
                  onClick={handleRun}
                  disabled={runStatus === "running"}
                  icon={runStatus === "running" ? "hourglass-half" : "play"}
                >
                  {runStatus === "running" ? "Running…" : "Run"}
                </Button>
                <button
                  className={styles.collapseBtn}
                  onClick={() => setIsEditorOpen(false)}
                  aria-label="Collapse editor"
                >
                  <Icon name="chevron-left" />
                </button>
              </div>
            </div>
            <div className={styles.editorBody}>
              <CodeEditor
                mode="single"
                language="python"
                value={code}
                onChange={setCode}
                theme="auto"
              />
            </div>
          </div>
        </div>

        {/* Expand button when editor is closed */}
        {!isEditorOpen && (
          <button
            className={styles.expandBtn}
            onClick={() => setIsEditorOpen(true)}
            aria-label="Expand editor"
          >
            <Icon name="chevron-right" />
          </button>
        )}

        {/* Right: viz + execution state + control bar */}
        <div className={styles.vizPanel}>

          {/* Tab bar */}
          <div className={styles.vizTabBar}>
            <TabList
              variant="underline"
              size="sm"
              activeTab={activeTab}
              onChange={(key) => setActiveTab(key as ViewTab)}
              aria-label="Visualization mode"
              tabs={[
                { key: "animation", label: "Algorithm Animation", icon: <Icon name="diagram-project" /> },
                { key: "graph", label: "Call Graph / CFG", icon: <Icon name="code-branch" /> },
              ]}
            />
            {activeLineno != null && (
              <span className={styles.lineIndicator}>line {activeLineno}</span>
            )}
            {isTruncated && (
              <span className={styles.truncatedBadge}>⚠ truncated</span>
            )}
          </div>

          {/* Graph area */}
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
            ) : drill.mode === "cfg" ? (() => {
              const node = callGraph.nodes.find((n) => n.id === (drill as { mode: "cfg"; funcId: string }).funcId);
              return (
                <div className={styles.cfgPanel}>
                  <div className={styles.cfgHeader}>
                    <button className={styles.cfgBackBtn} onClick={() => setDrill({ mode: "call_graph" })}>
                      <Icon name="chevron-left" />
                      Call Graph
                    </button>
                    <span className={styles.cfgLabel}>CFG · {node?.funcName ?? (drill as { mode: "cfg"; funcId: string }).funcId}</span>
                  </div>
                  <CytoscapeCanvas
                    elements={buildCfgElements(
                      cfgGraph[node?.funcName ?? ""] ?? { nodes: [], edges: [] },
                      activeLineno,
                    )}
                    stylesheet={CFG_STYLESHEET}
                    layout={CFG_LAYOUT}
                  />
                </div>
              );
            })() : (
              <CytoscapeCanvas
                elements={buildCallGraphElements(callGraph, currentStep)}
                stylesheet={CALL_GRAPH_STYLESHEET}
                layout={CALL_GRAPH_LAYOUT}
                onNodeClick={(funcId) => setDrill({ mode: "cfg", funcId })}
              />
            )}
          </div>

          {/* Execution state */}
          <div className={styles.executionState}>
            <div className={styles.executionStateHeader}>
              <span className={styles.executionStateLabel}>EXECUTION_STATE</span>
              {totalSteps > 0 && (
                <span className={styles.executionStateStep}>
                  STEP {currentStep + 1}/{totalSteps}
                </span>
              )}
            </div>
            <div className={styles.executionStateBody}>

              {/* Global Frame + Call Stack */}
              <div className={styles.framesCol}>
                <h3 className={styles.colTitle}>Global Frame</h3>
                <div className={styles.frame}>
                  {Object.keys(globalVars).length === 0 ? (
                    <div className={styles.frameVar}>
                      <span className={styles.frameVarName}>—</span>
                    </div>
                  ) : (
                    Object.entries(globalVars).map(([k, v]) => (
                      <div key={k} className={styles.frameVar}>
                        <span className={styles.frameVarName}>{k}</span>
                        <span className={styles.frameVarVal}>{v}</span>
                      </div>
                    ))
                  )}
                </div>

                <h3 className={`${styles.colTitle} ${styles.colTitleSpaced}`}>Call Stack</h3>
                {callStack.length === 0 ? (
                  <div className={styles.frame}>
                    <span className={styles.frameVarName}>—</span>
                  </div>
                ) : (
                  [...callStack].reverse().map((fname, i) => (
                    <div key={i} className={`${styles.frame} ${i === 0 ? styles.frameActive : ""}`}>
                      <div className={styles.frameName}>
                        {i === 0 && <span className={styles.frameActiveIndicator}>➔ </span>}
                        {fname === "<module>" ? "(global)" : fname}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Local Variables */}
              <div className={styles.objectsCol}>
                <h3 className={styles.colTitle}>
                  Local Variables
                  {activeFrame && <span className={styles.frameActiveLabel}> · {activeFrame === "<module>" ? "(global)" : activeFrame}</span>}
                </h3>
                {Object.keys(localVars).length === 0 ? (
                  <div className={styles.heapObject}>
                    <span className={styles.frameVarName}>—</span>
                  </div>
                ) : (
                  Object.entries(localVars).map(([k, v]) => (
                    <div key={k} className={styles.heapObject}>
                      <div className={styles.heapFields}>
                        <div className={styles.heapField}>
                          <div className={styles.heapFieldKey}>{k}</div>
                          <div className={styles.heapFieldVal}>{String(v)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Console placeholder */}
              <div className={styles.consoleCol}>
                <h3 className={styles.colTitle}>
                  <Icon name="terminal" />
                  Console
                </h3>
                <div className={styles.consoleLines}>
                  <div className={styles.consoleLine}>
                    <span className={styles.consoleOutput}>— stdout capture coming soon —</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Control bar */}
          <div className={styles.controlRow}>
            {totalSteps > 0 ? (
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
              <div className={styles.emptyControl}>Run code to start</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Playground;
