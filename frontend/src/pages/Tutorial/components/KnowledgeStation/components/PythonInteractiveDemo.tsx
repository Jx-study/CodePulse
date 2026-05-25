import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@/shared/components/Select';
import classNames from 'classnames';
import type {
  PythonDemo,
  PythonInput,
  GraphOutputData,
  QueueCardOutputData,
  MazeOutputData,
  FloodFillOutputData,
} from '@/types/implementation';
import Icon from '@/shared/components/Icon';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import Slider from '@/shared/components/Slider';
import GraphOutputRenderer from './GraphOutputRenderer';
import QueueGameRenderer from './QueueGameRenderer/QueueGameRenderer';
import MazeOutputRenderer, {
  type MazeOutputRendererHandle,
  type MazeViewPhase,
} from './MazeOutputRenderer';
import FloodFillRenderer from './FloodFillRenderer';
import styles from './PythonInteractiveDemo.module.scss';
import i18next from '@/i18n';

// Pyodide CDN（unpkg，固定版本保穩定性）
const PYODIDE_CDN = "https://unpkg.com/pyodide@0.27.0/pyodide.js";
const PYODIDE_INDEX_URL = "https://unpkg.com/pyodide@0.27.0/";

type ViewMode = "demo" | "code";
type RunStatus = "idle" | "loading-pyodide" | "running" | "done" | "error";

interface Props {
  demo: PythonDemo;
}

// ── Pyodide 全域緩存（跨元件共享，只載入一次）───────────────────
let pyodideInstance: any = null;
let pyodideLoadPromise: Promise<any> | null = null;

async function getPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (!pyodideLoadPromise) {
    pyodideLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PYODIDE_CDN;
      script.onload = async () => {
        try {
          const py = await (window as any).loadPyodide({
            indexURL: PYODIDE_INDEX_URL,
          });
          pyodideInstance = py;
          resolve(py);
        } catch (err) {
          reject(err);
        }
      };
      script.onerror = () =>
        reject(
          new Error(
            i18next.t('pythonDemo.loadError', { ns: 'tutorial' }),
          ),
        );
      document.head.appendChild(script);
    });
  }
  return pyodideLoadPromise;
}

const PythonInteractiveDemo: React.FC<Props> = ({ demo }) => {
  const { t } = useTranslation('tutorial');
  const [viewMode, setViewMode] = useState<ViewMode>("demo");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [graphData, setGraphData] = useState<GraphOutputData | null>(null);
  const [queueCardData, setQueueCardData] =
    useState<QueueCardOutputData | null>(null);
  const [mazeData, setMazeData] = useState<MazeOutputData | null>(null);
  const [floodFillData, setFloodFillData] = useState<FloodFillOutputData | null>(null);
  const mazeRef = useRef<MazeOutputRendererHandle>(null);
  const [mazeViewPhase, setMazeViewPhase] = useState<MazeViewPhase | null>(null);

  useEffect(() => {
    if (!mazeData) setMazeViewPhase(null);
  }, [mazeData]);

  // 控制項值，key = PythonInput.variable
  const [inputValues, setInputValues] = useState<
    Record<string, string | number>
  >(() =>
    Object.fromEntries(
      (demo.inputs ?? []).map((inp) => [inp.variable, inp.default]),
    ),
  );

  const handleInputChange = useCallback(
    (variable: string, value: string | number) => {
      setInputValues((prev) => ({ ...prev, [variable]: value }));
    },
    [],
  );

  const handleRun = useCallback(async () => {
    try {
      setStatus("loading-pyodide");
      const pyodide = await getPyodide();

      setStatus("running");

      for (const [key, val] of Object.entries(inputValues)) {
        pyodide.globals.set(key, val);
      }

      pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
      `);

      // 捕捉回傳值（最後一個 Python 表達式）
      const pyReturnValue = await pyodide.runPythonAsync(demo.code);
      const stdout: string = pyodide.runPython("sys.stdout.getvalue()");

      setOutput(stdout || t('pythonDemo.noOutput'));

      if (demo.outputType === "graph" && pyReturnValue) {
        try {
          setGraphData(JSON.parse(pyReturnValue));
        } catch {
          // JSON 解析失敗不影響 stdout 輸出
        }
        setQueueCardData(null);
        setMazeData(null);
        setFloodFillData(null);
      } else if (demo.outputType === 'queue-card' && pyReturnValue) {
        try {
          setQueueCardData(JSON.parse(pyReturnValue));
        } catch {
          // JSON 解析失敗不影響 stdout 輸出
        }
        setGraphData(null);
        setMazeData(null);
        setFloodFillData(null);
      } else if (demo.outputType === 'maze' && pyReturnValue) {
        try {
          setMazeData(JSON.parse(pyReturnValue));
        } catch {
          // JSON 解析失敗不影響 stdout 輸出
        }
        setGraphData(null);
        setQueueCardData(null);
        setFloodFillData(null);
      } else if (demo.outputType === 'flood-fill' && pyReturnValue) {
        try {
          setFloodFillData(JSON.parse(pyReturnValue));
        } catch {
          // JSON 解析失敗不影響 stdout 輸出
        }
        setGraphData(null);
        setQueueCardData(null);
        setMazeData(null);
      } else {
        setGraphData(null);
        setQueueCardData(null);
        setMazeData(null);
        setFloodFillData(null);
      }

      setStatus("done");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setOutput(t('pythonDemo.executionError', { message }));
      setStatus("error");
      setGraphData(null);
      setQueueCardData(null);
      setMazeData(null);
      setFloodFillData(null);
    }
  }, [demo.code, demo.outputType, inputValues, t]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(demo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [demo.code]);

  const isRunning = status === "loading-pyodide" || status === "running";
  const runLabel =
    status === "loading-pyodide"
      ? t('pythonDemo.loadingPyodide')
      : status === "running"
        ? t('pythonDemo.running')
        : t('pythonDemo.runButton');

  return (
    <div className={styles.container}>
      <div className={styles.titleBar}>
        <span className={styles.pythonBadge}>{t('pythonDemo.badge')}</span>
        <span className={styles.demoTitle}>{demo.title}</span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <Button
            variant="ghost"
            className={classNames(styles.tab, {
              [styles.active]: viewMode === "demo",
            })}
            onClick={() => setViewMode("demo")}
          >
            {t('pythonDemo.runTab')}
          </Button>
          <Button
            variant="ghost"
            className={classNames(styles.tab, {
              [styles.active]: viewMode === "code",
            })}
            onClick={() => setViewMode("code")}
          >
            {t('pythonDemo.codeTab')}
          </Button>
        </div>
        <Button
          variant="ghost"
          className={styles.copyBtn}
          onClick={handleCopy}
          iconLeft={<Icon name={copied ? "check" : "copy"} />}
        >
          {copied ? t('pythonDemo.copied') : t('pythonDemo.copyCode')}
        </Button>
      </div>

      {viewMode === "demo" && (
        <div className={styles.demoArea}>
          {demo.inputs && demo.inputs.length > 0 && (
            <div className={styles.inputsPanel}>
              {demo.inputs.map((inp) => {
                if (inp.visibleWhen) {
                  const { variable, value } = inp.visibleWhen;
                  if (inputValues[variable] !== value) return null;
                }
                return (
                  <InputControl
                    key={inp.variable}
                    input={inp}
                    value={inputValues[inp.variable]}
                    onChange={handleInputChange}
                  />
                );
              })}
            </div>
          )}

          <div className={styles.runRow}>
            <Button
              variant="primary"
              className={styles.runBtn}
              onClick={handleRun}
              disabled={isRunning}
            >
              {runLabel}
            </Button>
            {demo.outputType === 'maze' &&
              mazeData &&
              mazeViewPhase === 'generating' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => mazeRef.current?.skipGeneration()}
                >
                  {t('pythonDemo.skipGeneration')}
                </Button>
              )}
          </div>

          {/* 圖形輸出（outputType:'graph' 時顯示，取代或補充 console） */}
          {demo.outputType === "graph" && graphData && (
            <GraphOutputRenderer data={graphData} />
          )}

          {/* Queue 卡片遊戲（outputType:'queue-card' 時顯示） */}
          {demo.outputType === "queue-card" && queueCardData && (
            <QueueGameRenderer data={queueCardData} />
          )}

          {demo.outputType === 'maze' && mazeData && (
            <MazeOutputRenderer
              ref={mazeRef}
              data={mazeData}
              onViewPhaseChange={setMazeViewPhase}
            />
          )}

          {demo.outputType === 'flood-fill' && floodFillData && (
            <FloodFillRenderer data={floodFillData} />
          )}

          {/* 輸出 console（graph/queue-card/maze/flood-fill 模式且已有資料時隱藏，避免顯示「無輸出」佔版面） */}
          {(demo.outputType !== 'graph' &&
            demo.outputType !== 'queue-card' &&
            demo.outputType !== 'maze' &&
            demo.outputType !== 'flood-fill') ||
          (demo.outputType === 'graph' && !graphData) ||
          (demo.outputType === 'queue-card' && !queueCardData) ||
          (demo.outputType === 'maze' && !mazeData) ||
          (demo.outputType === 'flood-fill' && !floodFillData) ||
          status === 'error' ? (
            <pre
              className={classNames(styles.console, {
                [styles.error]: status === "error",
                [styles.empty]: !output,
              })}
            >
              {output || t('pythonDemo.clickToRun')}
            </pre>
          ) : null}
        </div>
      )}

      {viewMode === "code" && (
        <div className={styles.codeArea}>
          <pre className={styles.codeBlock}>
            <code>{demo.code}</code>
          </pre>
          <p className={styles.localHint}>
            {t('pythonDemo.localHint')}
          </p>
        </div>
      )}
    </div>
  );
};

interface InputControlProps {
  input: PythonInput;
  value: string | number;
  onChange: (variable: string, value: string | number) => void;
}

const InputControl: React.FC<InputControlProps> = ({
  input,
  value,
  onChange,
}) => {
  if (input.type === "slider") {
    return (
      <div className={styles.inputRow}>
        <label className={styles.inputLabel}>{input.label}</label>
        <Slider
          min={input.min ?? 1}
          max={input.max ?? 10}
          step={input.step ?? 1}
          value={value as number}
          onChange={(v) => onChange(input.variable, v)}
          className={styles.slider}
          ariaLabel={input.label}
        />
        <span className={styles.inputValue}>{value}</span>
      </div>
    );
  }
  if (input.type === "select") {
    return (
      <div className={styles.inputRow}>
        <label className={styles.inputLabel}>{input.label}</label>
        <Select
          value={value as string}
          options={(input.options ?? []).map((opt) => ({
            value: opt,
            label: opt,
          }))}
          onChange={(e) => onChange(input.variable, e.target.value)}
          size="sm"
        />
      </div>
    );
  }
  return (
    <div className={styles.inputRow}>
      <label className={styles.inputLabel}>{input.label}</label>
      <Input
        type="text"
        value={value as string}
        onChange={(e) => onChange(input.variable, e.target.value)}
        className={styles.textInput}
        fullWidth={false}
      />
    </div>
  );
};

export default PythonInteractiveDemo;
