import React, { useCallback, useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import classNames from 'classnames';
import Button from '@/shared/components/Button';
import Select from '@/shared/components/Select';
import Slider from '@/shared/components/Slider';
import styles from './WhackAMoleRenderer.module.scss';

type MoleState = 'hidden' | 'popup' | 'hit';
type GameStatus = 'idle' | 'playing' | 'gameover';
type Mode = '1d' | '2d';
type Difficulty = 'easy' | 'medium' | 'hard';

interface DiffConfig {
  spawnInterval: number;
  moleVisibleMs: number;
  maxConcurrent: number;
}

function getDifficultyConfig(d: Difficulty): DiffConfig {
  if (d === 'easy') return { spawnInterval: 1500, moleVisibleMs: 2500, maxConcurrent: 1 };
  if (d === 'hard') return { spawnInterval: 600, moleVisibleMs: 1200, maxConcurrent: 3 };
  return { spawnInterval: 1000, moleVisibleMs: 1800, maxConcurrent: 2 };
}

function getMoleImage(s: MoleState): string {
  if (s === 'popup') return '/images/games/Mole_PopUp.png';
  if (s === 'hit') return '/images/games/Mole_Hit.png';
  return '/images/games/Mole_Hole.png';
}

function getIndexLabel(mode: Mode, r: number, c: number): string {
  return mode === '1d' ? `[${c}]` : `[${r}][${c}]`;
}

function makeValues(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 20) + 1),
  );
}

function makeEmptyHoles(n: number): MoleState[] {
  return Array.from({ length: n }, () => 'hidden' as MoleState);
}

const GAME_DURATION_SEC = 30;
const CELL_GAP = 10;
const CELL_MAX = 80;
const CELL_MIN = 36;

interface GameState {
  status: GameStatus;
  holes: MoleState[];
  score: number;
  missed: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;
}

const MODE_OPTIONS = [
  { value: '1d', label: '1D 陣列' },
  { value: '2d', label: '2D 陣列' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '簡單' },
  { value: 'medium', label: '普通' },
  { value: 'hard', label: '困難' },
];

const WhackAMoleRenderer: React.FC = () => {
  // Config state
  const [mode, setMode] = useState<Mode>('1d');
  const [cols, setCols] = useState(8);
  const [rows, setRows] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [values, setValues] = useState<number[][]>(() => makeValues(1, 8));

  const effectiveRows = mode === '1d' ? 1 : rows;
  const total = effectiveRows * cols;

  const [playBonk] = useSound('/sfx/bonk.mp3', { volume: 0.8 });
  const [playPop] = useSound('/sfx/pop-cartoon.mp3', { volume: 0.7 });
  const [playBgm, { stop: stopBgm }] = useSound(
    '/bgm/The Pink Panther Theme (Full).mp3',
    { volume: 0.35, loop: true },
  );

  const [game, setGame] = useState<GameState>(() => ({
    status: 'idle',
    holes: makeEmptyHoles(total),
    score: 0,
    missed: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: GAME_DURATION_SEC,
  }));

  const holesRef = useRef(game.holes);
  holesRef.current = game.holes;

  const [nextMoleIdx, setNextMoleIdx] = useState<number | null>(null);
  const nextMoleIdxRef = useRef<number | null>(null);

  const popupHideTimersRef = useRef<Map<number, number>>(new Map());
  const hitRecoverTimersRef = useRef<Map<number, number>>(new Map());

  // Dynamic cell sizing via ResizeObserver
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(CELL_MAX);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const recalc = () => {
      const w = el.clientWidth;
      const computed = Math.floor((w - CELL_GAP * (cols - 1)) / cols);
      setCellSize(Math.max(CELL_MIN, Math.min(CELL_MAX, computed)));
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols]);

  // Hammer cursor state
  const gridAreaRef = useRef<HTMLDivElement>(null);
  const [hammerVisible, setHammerVisible] = useState(false);
  const [hammerPos, setHammerPos] = useState({ x: 0, y: 0 });
  const [hitKey, setHitKey] = useState(0);

  // Reset game when config changes
  const resetGame = useCallback(
    (newEffRows: number, newCols: number, newVals: number[][]) => {
      popupHideTimersRef.current.forEach(clearTimeout);
      popupHideTimersRef.current.clear();
      hitRecoverTimersRef.current.forEach(clearTimeout);
      hitRecoverTimersRef.current.clear();
      stopBgm();
      const n = newEffRows * newCols;
      setValues(newVals);
      setGame({
        status: 'idle',
        holes: makeEmptyHoles(n),
        score: 0,
        missed: 0,
        combo: 0,
        maxCombo: 0,
        timeLeft: GAME_DURATION_SEC,
      });
    },
    // stopBgm is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as Mode;
    setMode(newMode);
    const effRows = newMode === '1d' ? 1 : rows;
    resetGame(effRows, cols, makeValues(effRows, cols));
  };

  const handleColsChange = (v: number) => {
    setCols(v);
    resetGame(effectiveRows, v, makeValues(effectiveRows, v));
  };

  const handleRowsChange = (v: number) => {
    setRows(v);
    if (mode === '2d') {
      resetGame(v, cols, makeValues(v, cols));
    }
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value as Difficulty);
  };

  // Effect: playing → BGM + 倒數；其他 → 停 BGM
  useEffect(() => {
    if (game.status !== 'playing') {
      stopBgm();
      return;
    }

    playBgm();

    const countdownId = window.setInterval(() => {
      setGame((prev) => {
        if (prev.status !== 'playing') return prev;
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, status: 'gameover', holes: makeEmptyHoles(prev.holes.length) };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      clearInterval(countdownId);
      stopBgm();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.status]);

  // Effect: 離開 playing 時清除地鼠計時器 + 下一隻提示
  useEffect(() => {
    if (game.status !== 'playing') {
      popupHideTimersRef.current.forEach(clearTimeout);
      popupHideTimersRef.current.clear();
      hitRecoverTimersRef.current.forEach(clearTimeout);
      hitRecoverTimersRef.current.clear();
      nextMoleIdxRef.current = null;
      setNextMoleIdx(null);
    }
  }, [game.status]);

  // Effect: playing 時地鼠生成
  useEffect(() => {
    if (game.status !== 'playing') return;

    const cfg = getDifficultyConfig(difficulty);
    const spawnId = window.setInterval(() => {
      const h = holesRef.current;
      if (h.length === 0) return;
      const popupCount = h.filter((x) => x === 'popup').length;
      if (popupCount >= cfg.maxConcurrent) return;
      const hidden = h.map((v, i) => (v === 'hidden' ? i : -1)).filter((i) => i >= 0);
      if (hidden.length === 0) return;

      // Use pre-committed index if still valid, otherwise pick randomly
      const committed = nextMoleIdxRef.current;
      const idx =
        committed !== null && h[committed] === 'hidden'
          ? committed
          : hidden[Math.floor(Math.random() * hidden.length)];

      setGame((prev) => {
        if (prev.status !== 'playing') return prev;
        const nh = [...prev.holes];
        nh[idx] = 'popup';
        return { ...prev, holes: nh };
      });
      playPop();

      // Pre-compute next candidate (excluding the hole just spawned)
      const remaining = hidden.filter((i) => i !== idx);
      const next =
        remaining.length > 0
          ? remaining[Math.floor(Math.random() * remaining.length)]
          : null;
      nextMoleIdxRef.current = next;
      setNextMoleIdx(next);

      const hideId = window.setTimeout(() => {
        setGame((prev) => {
          if (prev.status !== 'playing') return prev;
          if (prev.holes[idx] !== 'popup') return prev;
          const nh = [...prev.holes];
          nh[idx] = 'hidden';
          return { ...prev, holes: nh, missed: prev.missed + 1, combo: 0, score: Math.max(0, prev.score - 5) };
        });
        popupHideTimersRef.current.delete(idx);
      }, cfg.moleVisibleMs);
      popupHideTimersRef.current.set(idx, hideId);
    }, cfg.spawnInterval);

    return () => {
      clearInterval(spawnId);
      nextMoleIdxRef.current = null;
      setNextMoleIdx(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.status, difficulty, effectiveRows, cols]);

  const handleWhack = useCallback(
    (idx: number) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const cellVal = values[r]?.[c] ?? 10;

      setGame((prev) => {
        if (prev.status !== 'playing') return prev;
        if (prev.holes[idx] !== 'popup') return prev;

        const tid = popupHideTimersRef.current.get(idx);
        if (tid !== undefined) {
          clearTimeout(tid);
          popupHideTimersRef.current.delete(idx);
        }

        const nh = [...prev.holes];
        nh[idx] = 'hit';
        const newCombo = prev.combo + 1;
        return { ...prev, holes: nh, score: prev.score + cellVal, combo: newCombo, maxCombo: Math.max(prev.maxCombo, newCombo) };
      });

      const recoverId = window.setTimeout(() => {
        setGame((prev) => {
          if (prev.holes[idx] !== 'hit') return prev;
          const nh = [...prev.holes];
          nh[idx] = 'hidden';
          return { ...prev, holes: nh };
        });
        hitRecoverTimersRef.current.delete(idx);
      }, 600);
      hitRecoverTimersRef.current.set(idx, recoverId);
    },
    [cols, values],
  );

  // Hammer cursor handlers
  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = gridAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHammerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleGridMouseDown = () => {
    setHitKey((k) => k + 1);
    playBonk();
  };

  const clearAllTimers = () => {
    popupHideTimersRef.current.forEach(clearTimeout);
    popupHideTimersRef.current.clear();
    hitRecoverTimersRef.current.forEach(clearTimeout);
    hitRecoverTimersRef.current.clear();
  };

  const handleStart = () => {
    clearAllTimers();
    setGame({ status: 'playing', holes: makeEmptyHoles(total), score: 0, missed: 0, combo: 0, maxCombo: 0, timeLeft: GAME_DURATION_SEC });
  };

  const handleRestart = () => {
    clearAllTimers();
    stopBgm();
    setGame({ status: 'idle', holes: makeEmptyHoles(total), score: 0, missed: 0, combo: 0, maxCombo: 0, timeLeft: GAME_DURATION_SEC });
  };

  const { status, holes, score, missed, combo, maxCombo, timeLeft } = game;

  const renderHole = (idx: number) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    const mole = holes[idx];
    const val = values[r]?.[c] ?? 0;

    const isNextHint = status === 'playing' && mole === 'hidden' && idx === nextMoleIdx;

    const holeInner = (
      <button
        type="button"
        className={classNames(styles.hole, mole === 'popup' && styles.popup, mole === 'hit' && styles.hit, isNextHint && styles.nextHint)}
        onClick={() => handleWhack(idx)}
        aria-label={getIndexLabel(mode, r, c)}
      >
        <img src={getMoleImage(mole)} alt="" draggable={false} />
        {mole === 'popup' && <span className={styles.valueLabel}>+{val}</span>}
        {mode === '2d' && (
          <span className={styles.indexLabel2d}>{getIndexLabel('2d', r, c)}</span>
        )}
      </button>
    );

    if (mode === '1d') {
      return (
        <div key={idx} className={styles.holeWrapper}>
          {holeInner}
          <span className={styles.indexLabelBelow}>{getIndexLabel('1d', r, c)}</span>
        </div>
      );
    }

    return <div key={idx}>{holeInner}</div>;
  };

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ '--cell-size': `${cellSize}px` } as React.CSSProperties}
    >
      {/* Config bar */}
      <div className={styles.configBar}>
        <div className={styles.configItem}>
          <span className={styles.configLabel}>模式</span>
          <Select
            value={mode}
            options={MODE_OPTIONS}
            onChange={handleModeChange}
            size="sm"
            disabled={status === 'playing'}
          />
        </div>
        <div className={styles.configItem}>
          <span className={styles.configLabel}>格子數</span>
          <Slider
            min={4} max={12} step={1}
            value={cols}
            onChange={handleColsChange}
            showValue
            disabled={status === 'playing'}
          />
        </div>
        {mode === '2d' && (
          <div className={styles.configItem}>
            <span className={styles.configLabel}>列數</span>
            <Slider
              min={2} max={5} step={1}
              value={rows}
              onChange={handleRowsChange}
              showValue
              disabled={status === 'playing'}
            />
          </div>
        )}
        <div className={styles.configItem}>
          <span className={styles.configLabel}>難度</span>
          <Select
            value={difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={handleDifficultyChange}
            size="sm"
            disabled={status === 'playing'}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className={styles.statsBar}>
        <div className={styles.statsMain}>
          <span>分數：{score}</span>
          <span>Missed：{missed}</span>
          <span>Combo：{combo}</span>
          <span>最高連擊：{maxCombo}</span>
        </div>
        <div className={styles.statsSecondary}>
          {status === 'playing' && <span>時間：{timeLeft}s</span>}
          {status === 'playing' && nextMoleIdx !== null && (
            <span className={styles.nextHintLabel}>
              下一隻：{getIndexLabel(mode, Math.floor(nextMoleIdx / cols), nextMoleIdx % cols)}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {status === 'idle' && (
          <Button variant="primary" onClick={handleStart}>
            Start
          </Button>
        )}
        {status === 'gameover' && (
          <>
            <div className={styles.gameoverPanel}>
              <p>游戲結束 — 最終分數 {score}，最高連擊 {maxCombo}，Missed {missed}</p>
            </div>
            <Button variant="secondary" onClick={handleRestart}>
              Restart
            </Button>
          </>
        )}
      </div>

      {/* Grid */}
      <div
        ref={gridAreaRef}
        className={styles.gridArea}
        onMouseMove={handleGridMouseMove}
        onMouseEnter={() => setHammerVisible(true)}
        onMouseLeave={() => setHammerVisible(false)}
        onMouseDown={handleGridMouseDown}
      >
        {hammerVisible && (
          <img
            key={hitKey}
            src="/images/games/Hammer.png"
            className={classNames(styles.hammerCursor, hitKey > 0 && styles.hammerHitting)}
            style={{ left: hammerPos.x, top: hammerPos.y }}
            alt=""
            draggable={false}
          />
        )}
        {mode === '1d' ? (
          <div className={styles.grid1d}>{holes.map((_, i) => renderHole(i))}</div>
        ) : (
          <div
            className={styles.grid2d}
            style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
          >
            {holes.map((_, i) => renderHole(i))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhackAMoleRenderer;
