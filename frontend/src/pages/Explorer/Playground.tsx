import { useState, useRef, useCallback } from "react";
import CytoscapeCanvas from "@/modules/core/Render/CytoscapeCanvas";
import { buildCallGraphElements, CALL_GRAPH_STYLESHEET, CALL_GRAPH_LAYOUT } from "@/modules/explorer/elements/callGraphElements";
import { buildCfgElements, CFG_STYLESHEET, CFG_LAYOUT } from "@/modules/explorer/elements/cfgElements";
import CodeEditor from "@/modules/core/components/CodeEditor";
import ControlBar from "@/modules/core/components/ControlBar";
import Button from "@/shared/components/Button";
import EmptyState from "@/shared/components/EmptyState";
import Icon from "@/shared/components/Icon";
import TabList from "@/shared/components/Tabs/TabList";
import type { TraceEvent, CallGraph } from "@/types/trace";
import styles from "./Playground.module.scss";

// ── Mock data ─────────────────────────────────────────────────────────────────

interface MockFrame {
  name: string;
  isActive: boolean;
  vars: { name: string; value: string }[];
}

interface MockObject {
  ref: string;
  type: string;
  fields: { key: string; value: string; isRef?: boolean }[];
}

const MOCK_FRAMES: MockFrame[] = [
  {
    name: "Global frame",
    isActive: false,
    vars: [
      { name: "bubble_sort", value: "function" },
      { name: "arr", value: "ref_1" },
    ],
  },
  {
    name: "bubble_sort",
    isActive: true,
    vars: [
      { name: "arr", value: "ref_1" },
      { name: "n", value: "7" },
      { name: "i", value: "0" },
      { name: "j", value: "2" },
    ],
  },
];

const MOCK_OBJECTS: MockObject[] = [
  {
    ref: "ref_1",
    type: "list",
    fields: [
      { key: "0", value: "64" },
      { key: "1", value: "34" },
      { key: "2", value: "25" },
      { key: "3", value: "12" },
      { key: "4", value: "22" },
      { key: "5", value: "11" },
      { key: "6", value: "90" },
    ],
  },
];

const MOCK_CONSOLE = [
  { text: "Program started", type: "prompt" as const },
  { text: "Entering bubble_sort()", type: "output" as const },
  { text: "Pass 0: comparing index 2 and 3", type: "output" as const },
];

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
          setCallGraph(result.call_graph ?? null);
          setIsTruncated(result.is_truncated ?? false);
          setRunStatus("idle");
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
                    elements={buildCfgElements(node?.cfg ?? { nodes: [], edges: [] }, activeLineno)}
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

              {/* Frames */}
              <div className={styles.framesCol}>
                <h3 className={styles.colTitle}>Frames</h3>
                {MOCK_FRAMES.map((frame) => (
                  <div key={frame.name} className={`${styles.frame} ${frame.isActive ? styles.frameActive : ""}`}>
                    <div className={styles.frameName}>{frame.name}</div>
                    {frame.vars.map((v) => (
                      <div key={v.name} className={styles.frameVar}>
                        <span className={styles.frameVarName}>{v.name}</span>
                        <span className={v.value.startsWith("ref_") ? styles.frameVarRef : styles.frameVarVal}>
                          {v.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Objects */}
              <div className={styles.objectsCol}>
                <h3 className={styles.colTitle}>Objects</h3>
                {MOCK_OBJECTS.map((obj) => (
                  <div key={obj.ref} className={styles.heapObject}>
                    <div className={styles.heapObjectMeta}>
                      <span className={styles.heapRef}>{obj.ref}</span>
                      <span className={styles.heapType}>{obj.type}</span>
                    </div>
                    <div className={styles.heapFields}>
                      {obj.fields.map((f) => (
                        <div key={f.key} className={styles.heapField}>
                          <div className={styles.heapFieldKey}>{f.key}</div>
                          <div className={f.isRef ? styles.heapFieldRef : styles.heapFieldVal}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Console */}
              <div className={styles.consoleCol}>
                <h3 className={styles.colTitle}>
                  <Icon name="terminal" />
                  Console
                </h3>
                <div className={styles.consoleLines}>
                  {MOCK_CONSOLE.map((line, i) => (
                    <div key={i} className={styles.consoleLine}>
                      {line.type === "prompt" && <span className={styles.consolePrompt}>&gt;</span>}
                      <span className={line.type === "prompt" ? styles.consoleText : styles.consoleOutput}>
                        {line.text}
                      </span>
                    </div>
                  ))}
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
