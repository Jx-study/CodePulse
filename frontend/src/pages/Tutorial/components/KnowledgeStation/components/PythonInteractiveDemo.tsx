import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import type { PythonDemo, PythonInput, GraphOutputData } from '@/types/implementation';
import Icon from '@/shared/components/Icon';
import GraphOutputRenderer from './GraphOutputRenderer';
import styles from './PythonInteractiveDemo.module.scss';

// Pyodide CDN（unpkg，固定版本保穩定性）
const PYODIDE_CDN = 'https://unpkg.com/pyodide@0.27.0/pyodide.js';
const PYODIDE_INDEX_URL = 'https://unpkg.com/pyodide@0.27.0/';

type ViewMode = 'demo' | 'code';
type RunStatus = 'idle' | 'loading-pyodide' | 'running' | 'done' | 'error';

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
      const script = document.createElement('script');
      script.src = PYODIDE_CDN;
      script.onload = async () => {
        try {
          const py = await (window as any).loadPyodide({ indexURL: PYODIDE_INDEX_URL });
          pyodideInstance = py;
          resolve(py);
        } catch (err) {
          reject(err);
        }
      };
      script.onerror = () => reject(new Error('無法載入 Pyodide，請確認網路連線或瀏覽器未封鎖 cdn.pyodide.org'));
      document.head.appendChild(script);
    });
  }
  return pyodideLoadPromise;
}

const PythonInteractiveDemo: React.FC<Props> = ({ demo }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('demo');
  const [status, setStatus] = useState<RunStatus>('idle');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [graphData, setGraphData] = useState<GraphOutputData | null>(null);

  // 控制項值，key = PythonInput.variable
  const [inputValues, setInputValues] = useState<Record<string, string | number>>(
    () =>
      Object.fromEntries(
        (demo.inputs ?? []).map((inp) => [inp.variable, inp.default])
      )
  );

  const handleInputChange = useCallback(
    (variable: string, value: string | number) => {
      setInputValues((prev) => ({ ...prev, [variable]: value }));
    },
    []
  );

  const handleRun = useCallback(async () => {
    try {
      setStatus('loading-pyodide');
      const pyodide = await getPyodide();

      setStatus('running');

      for (const [key, val] of Object.entries(inputValues)) {
        pyodide.globals.set(key, val);
      }

      pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
      `);

      // 捕捉回傳值（最後一個 Python 表達式）
      const pyReturnValue = await pyodide.runPythonAsync(demo.code);
      const stdout: string = pyodide.runPython('sys.stdout.getvalue()');

      setOutput(stdout || '（程式執行完畢，無輸出）');

      // outputType:'graph' 時解析回傳的 JSON
      if (demo.outputType === 'graph' && pyReturnValue) {
        try {
          setGraphData(JSON.parse(pyReturnValue));
        } catch {
          // JSON 解析失敗不影響 stdout 輸出
        }
      } else {
        setGraphData(null);
      }

      setStatus('done');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setOutput(`執行錯誤：\n${message}`);
      setStatus('error');
      setGraphData(null);
    }
  }, [demo.code, demo.outputType, inputValues]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(demo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [demo.code]);

  const isRunning = status === 'loading-pyodide' || status === 'running';
  const runLabel =
    status === 'loading-pyodide'
      ? '載入 Python 環境...'
      : status === 'running'
        ? '執行中...'
        : '▶ 執行小程序';

  return (
    <div className={styles.container}>
      <div className={styles.titleBar}>
        <span className={styles.pythonBadge}>Python 互動</span>
        <span className={styles.demoTitle}>{demo.title}</span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <button
            className={classNames(styles.tab, {
              [styles.active]: viewMode === 'demo',
            })}
            onClick={() => setViewMode('demo')}
          >
            小程序運行
          </button>
          <button
            className={classNames(styles.tab, {
              [styles.active]: viewMode === 'code',
            })}
            onClick={() => setViewMode('code')}
          >
            原始碼
          </button>
        </div>
        <button className={styles.copyBtn} onClick={handleCopy}>
          <Icon name={copied ? 'check' : 'copy'} />
          {copied ? '已複製' : '複製代碼'}
        </button>
      </div>

      {viewMode === 'demo' && (
        <div className={styles.demoArea}>
          {demo.inputs && demo.inputs.length > 0 && (
            <div className={styles.inputsPanel}>
              {demo.inputs.map((inp) => (
                <InputControl
                  key={inp.variable}
                  input={inp}
                  value={inputValues[inp.variable]}
                  onChange={handleInputChange}
                />
              ))}
            </div>
          )}

          <button
            className={styles.runBtn}
            onClick={handleRun}
            disabled={isRunning}
          >
            {runLabel}
          </button>

          {/* 圖形輸出（outputType:'graph' 時顯示，取代或補充 console） */}
          {demo.outputType === 'graph' && graphData && (
            <GraphOutputRenderer data={graphData} />
          )}

          {/* 輸出 console（graph 模式且已有資料時隱藏，避免顯示「無輸出」佔版面） */}
          {(demo.outputType !== 'graph' || !graphData || output.includes('錯誤')) && (
            <pre
              className={classNames(styles.console, {
                [styles.error]: status === 'error',
                [styles.empty]: !output,
              })}
            >
              {output || '點擊「執行小程序」查看結果...'}
            </pre>
          )}
        </div>
      )}

      {viewMode === 'code' && (
        <div className={styles.codeArea}>
          <pre className={styles.codeBlock}>
            <code>{demo.code}</code>
          </pre>
          <p className={styles.localHint}>
            複製後在本地執行：<code>python script.py</code>（需 Python 3.10+）
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
  if (input.type === 'slider') {
    return (
      <div className={styles.inputRow}>
        <label className={styles.inputLabel}>{input.label}</label>
        <input
          type="range"
          min={input.min ?? 1}
          max={input.max ?? 10}
          step={input.step ?? 1}
          value={value as number}
          onChange={(e) => onChange(input.variable, Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.inputValue}>{value}</span>
      </div>
    );
  }
  if (input.type === 'select') {
    return (
      <div className={styles.inputRow}>
        <label className={styles.inputLabel}>{input.label}</label>
        <select
          value={value as string}
          onChange={(e) => onChange(input.variable, e.target.value)}
          className={styles.select}
        >
          {input.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className={styles.inputRow}>
      <label className={styles.inputLabel}>{input.label}</label>
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(input.variable, e.target.value)}
        className={styles.textInput}
      />
    </div>
  );
};

export default PythonInteractiveDemo;
