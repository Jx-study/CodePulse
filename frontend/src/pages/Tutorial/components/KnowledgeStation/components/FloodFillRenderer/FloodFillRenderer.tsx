import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import ControlBar from '@/modules/core/components/ControlBar/ControlBar';
import type { FloodFillOutputData } from '@/types/implementation';
import { rasterizePattern } from './patternRasterizer';
import styles from './FloodFillRenderer.module.scss';

const CELL_SIZE = 5;
const BASE_MS = 40;

const PALETTE: string[] = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#e91e63',
];

interface ActiveFlood {
  color: number;
  cells: [number, number][];
  startStep: number;
}

type AnimStatus = 'idle' | 'active';

interface AnimState {
  status: AnimStatus;
  floods: ActiveFlood[];
  maxSteps: number;
}

function buildDisplayGrid(
  permanent: number[][],
  anim: AnimState,
  step: number,
): number[][] {
  const display = permanent.map((row) => [...row]);
  if (anim.status !== 'active') return display;

  const pending: [number, number, number, number][] = [];
  for (const flood of anim.floods) {
    const count = Math.min(Math.max(step - flood.startStep + 1, 0), flood.cells.length);
    for (let i = 0; i < count; i++) {
      const [r, c] = flood.cells[i];
      pending.push([flood.startStep + i, flood.color, r, c]);
    }
  }
  pending.sort((a, b) => a[0] - b[0]);
  for (const [, color, r, c] of pending) {
    if (display[r]?.[c] !== undefined && display[r][c] === 0) {
      display[r][c] = color;
    }
  }
  return display;
}

function drawCanvas(
  ctx: CanvasRenderingContext2D,
  display: number[][],
  original: number[][],
): void {
  const H = display.length;
  const W = display[0].length;
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (original[r][c] === 1) {
        ctx.fillStyle = '#1a1a2e';
      } else if (display[r][c] > 0) {
        ctx.fillStyle = PALETTE[display[r][c] - 1];
      } else {
        ctx.fillStyle = '#f0f0f0';
      }
      ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function computeStats(display: number[][], original: number[][]): Map<number, number> {
  const counts = new Map<number, number>();
  for (let r = 0; r < display.length; r++) {
    for (let c = 0; c < display[0].length; c++) {
      if (original[r][c] === 1) continue;
      const color = Math.max(0, display[r][c]);
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
  }
  return counts;
}

function computeTrueMaxSteps(floods: ActiveFlood[]): number {
  const bestStep = new Map<string, number>();
  for (const flood of floods) {
    for (let i = 0; i < flood.cells.length; i++) {
      const [r, c] = flood.cells[i];
      const key = `${r},${c}`;
      const globalStep = flood.startStep + i;
      const prev = bestStep.get(key);
      if (prev === undefined || globalStep < prev) {
        bestStep.set(key, globalStep);
      }
    }
  }
  let max = 0;
  for (const s of bestStep.values()) {
    if (s > max) max = s;
  }
  return max + 1;
}

function computeFloodFillCells(
  original: number[][],
  permanent: number[][],
  startR: number,
  startC: number,
): [number, number][] {
  const H = original.length;
  const W = original[0].length;
  const targetColor = permanent[startR][startC];
  if (targetColor === -1) return [];
  const visited = new Set<number>();
  const queue: [number, number][] = [[startR, startC]];
  const result: [number, number][] = [];
  visited.add(startR * W + startC);
  const DIRS: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    result.push([r, c]);
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
      const key = nr * W + nc;
      if (visited.has(key)) continue;
      if (original[nr][nc] === 1) continue;
      if (permanent[nr][nc] !== targetColor) continue;
      visited.add(key);
      queue.push([nr, nc]);
    }
  }
  return result;
}

interface Props {
  data: FloodFillOutputData;
}

const FloodFillRenderer: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalGridRef = useRef<number[][] | null>(null);
  const permanentGridRef = useRef<number[][] | null>(null);
  const animRef = useRef<AnimState>({ status: 'idle', floods: [], maxSteps: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [step, setStep] = useState(0);
  const [barTotalSteps, setBarTotalSteps] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedColor, setSelectedColor] = useState(1);
  const [colorStats, setColorStats] = useState<Map<number, number>>(new Map());
  /** 重置時遞增，確保 step 已為 0 時仍會觸發畫布重繪 */
  const [paintVersion, setPaintVersion] = useState(0);

  const commitToPermGrid = useCallback((currentStep: number) => {
    if (animRef.current.status !== 'active') return;
    const perm = permanentGridRef.current;
    if (!perm) return;

    const pending: [number, number, number, number][] = [];
    for (const flood of animRef.current.floods) {
      const count = Math.min(Math.max(currentStep - flood.startStep + 1, 0), flood.cells.length);
      for (let i = 0; i < count; i++) {
        const [r, c] = flood.cells[i];
        pending.push([flood.startStep + i, flood.color, r, c]);
      }
    }
    pending.sort((a, b) => a[0] - b[0]);
    for (const [, color, r, c] of pending) {
      if (perm[r]?.[c] !== undefined && perm[r][c] === 0) {
        perm[r][c] = color;
      }
    }
  }, []);

  useEffect(() => {
    const grid = rasterizePattern(
      data.pattern,
      data.width,
      data.height,
      data.border_width,
    );
    originalGridRef.current = grid;
    permanentGridRef.current = grid.map((row) =>
      row.map((v) => (v === 1 ? -1 : 0)),
    );
    animRef.current = { status: 'idle', floods: [], maxSteps: 0 };
    setStep(0);
    setBarTotalSteps(1);
    setIsPlaying(false);
  }, [data]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !originalGridRef.current || !permanentGridRef.current) return;

    const display = buildDisplayGrid(
      permanentGridRef.current,
      animRef.current,
      step,
    );
    drawCanvas(ctx, display, originalGridRef.current);
    setColorStats(computeStats(display, originalGridRef.current));

    const anim = animRef.current;
    if (
      anim.status === 'active' &&
      anim.maxSteps > 0 &&
      step >= anim.maxSteps - 1
    ) {
      commitToPermGrid(step);
      animRef.current = { status: 'idle', floods: [], maxSteps: 0 };
      setIsPlaying(false);
      setBarTotalSteps(1);
      setStep(0);
    }
  }, [step, data, commitToPermGrid, paintVersion]);

  useEffect(() => {
    if (!isPlaying) return;
    if (animRef.current.status !== 'active') return;
    const max = animRef.current.maxSteps;
    if (max <= 0) return;
    if (step >= max - 1) return;

    timerRef.current = setTimeout(() => {
      setStep((s) => s + 1);
    }, BASE_MS / speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, step, speed]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const orig = originalGridRef.current;
    const perm = permanentGridRef.current;
    if (!canvas || !orig || !perm) return;

    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const r = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (orig[r]?.[c] === 1) return;

    commitToPermGrid(step);

    if (perm[r][c] !== 0) return;

    const newCells = computeFloodFillCells(orig, perm, r, c);
    if (newCells.length === 0) return;

    const remainingFloods = animRef.current.floods.filter((f) => {
      if (f.cells.length === 0) return false;
      return step < f.startStep + f.cells.length - 1;
    });
    const newFlood: ActiveFlood = {
      color: selectedColor,
      cells: newCells,
      startStep: step,
    };
    const allFloods = [...remainingFloods, newFlood];
    const newMaxSteps = Math.max(computeTrueMaxSteps(allFloods), 1);

    animRef.current = {
      status: 'active',
      floods: allFloods,
      maxSteps: newMaxSteps,
    };
    setBarTotalSteps(Math.max(newMaxSteps, 1));
    setIsPlaying(true);
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const orig = originalGridRef.current;
    if (!orig) return;
    permanentGridRef.current = orig.map((row) => row.map((v) => (v === 1 ? -1 : 0)));
    animRef.current = { status: 'idle', floods: [], maxSteps: 0 };
    setStep(0);
    setBarTotalSteps(1);
    setIsPlaying(false);
    setPaintVersion((v) => v + 1);
  };

  const W = data.width;
  const H = data.height;
  const totalBar = Math.max(barTotalSteps, 1);
  const safeStep = Math.min(step, Math.max(totalBar - 1, 0));

  return (
    <div className={styles.wrapper}>
      <div className={styles.canvasArea}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={W * CELL_SIZE}
          height={H * CELL_SIZE}
          onClick={handleCanvasClick}
        />
        <div className={styles.statsOverlay}>
          <div className={styles.statItem}>
            <span
              className={styles.colorSwatch}
              style={{ background: '#f0f0f0' }}
            />
            <span>{colorStats.get(0) ?? 0}</span>
          </div>
          {PALETTE.map((color, i) => {
            const count = colorStats.get(i + 1) ?? 0;
            if (count === 0) return null;
            return (
              <div key={i} className={styles.statItem}>
                <span
                  className={styles.colorSwatch}
                  style={{ background: color }}
                />
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.palette} role="listbox" aria-label="填色色盤">
        {PALETTE.map((color, i) => (
          <button
            key={i}
            type="button"
            role="option"
            aria-label={`選擇顏色 ${i + 1}`}
            aria-selected={selectedColor === i + 1}
            className={classNames(styles.paletteColor, {
              [styles.paletteColorSelected]: selectedColor === i + 1,
            })}
            style={{ background: color }}
            onClick={() => setSelectedColor(i + 1)}
          />
        ))}
      </div>

      <div className={styles.controlBarSlot}>
        <ControlBar
          isPlaying={isPlaying}
          currentStep={safeStep}
          totalSteps={totalBar}
          playbackSpeed={speed}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onNext={() => setStep((s) => Math.min(s + 1, Math.max(totalBar - 1, 0)))}
          onPrev={() => setStep((s) => Math.max(0, s - 1))}
          onReset={handleReset}
          onSpeedChange={setSpeed}
          onStepChange={(n) => setStep(Math.min(n, Math.max(totalBar - 1, 0)))}
        />
      </div>
    </div>
  );
};

export default FloodFillRenderer;
