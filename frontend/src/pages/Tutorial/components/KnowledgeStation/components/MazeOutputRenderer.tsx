import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ControlBar from "@/modules/core/components/ControlBar/ControlBar";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";
import type { MazeCell, MazeOutputData } from "@/types/implementation";
import styles from "./MazeOutputRenderer.module.scss";

export type MazeViewPhase = "generating" | "game";

export type MazeOutputRendererHandle = {
  /** 略過生成動畫並進入遊戲（等同原「跳過生成」） */
  skipGeneration: () => void;
};

interface Props {
  data: MazeOutputData;
  // 供父層（例如與「執行小程式」並排顯示跳過按鈕）追蹤目前是否為生成階段
  onViewPhaseChange?: (phase: MazeViewPhase) => void;
}

const MOVE_DELAY = 150;
const FOG_RADIUS = 2.5;
const BASE_GEN_SPEED_MS = 15;
type ViewPhase = MazeViewPhase;

type MazeStatus = "idle" | "playing" | "won";
type GameMode = "solo" | "race" | "coop";

interface MazeGameState {
  status: MazeStatus;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  steps: { p1: number; p2: number };
  startTime: number | null;
  winner: "" | "P1" | "P2" | "TIE" | "ALL";
  finishTime: { p1: number | null; p2: number | null };
}

interface LeaderboardEntry {
  rank: number;
  steps: number;
  elapsed: number;
  mode: GameMode;
}

function formatTime(ms: number): string {
  return `${Math.floor(ms / 1000)}.${String(ms % 1000).slice(0, 1)}s`;
}

function calcCellSize(w: number, h: number): number {
  return Math.min(Math.floor(540 / w), Math.floor(320 / h), 36);
}

function buildInitialState(data: MazeOutputData): MazeGameState {
  const [sx, sy] = data.start;
  return {
    status: "idle",
    p1: { x: sx, y: sy },
    p2: { x: sx, y: sy },
    steps: { p1: 0, p2: 0 },
    startTime: null,
    winner: "",
    finishTime: { p1: null, p2: null },
  };
}

function tryMove(
  pos: { x: number; y: number },
  dir: "left" | "right" | "up" | "down",
  grid: MazeCell[][],
  W: number,
  H: number,
): { x: number; y: number } {
  const { x: px, y: py } = pos;
  if (dir === "right" && px < W - 1 && grid[px][py].right) {
    return { x: px + 1, y: py };
  }
  if (dir === "left" && px > 0 && grid[px - 1][py].right) {
    return { x: px - 1, y: py };
  }
  if (dir === "down" && py < H - 1 && grid[px][py].down) {
    return { x: px, y: py + 1 };
  }
  if (dir === "up" && py > 0 && grid[px][py - 1].down) {
    return { x: px, y: py - 1 };
  }
  return pos;
}

function getP1Dir(keys: Set<string>): "left" | "right" | "up" | "down" | null {
  const order: Array<[string, "left" | "right" | "up" | "down"]> = [
    ["ArrowUp", "up"],
    ["ArrowDown", "down"],
    ["ArrowLeft", "left"],
    ["ArrowRight", "right"],
  ];
  for (const [k, d] of order) {
    if (keys.has(k)) return d;
  }
  return null;
}

function getP2Dir(keys: Set<string>): "left" | "right" | "up" | "down" | null {
  if (keys.has("w") || keys.has("W")) return "up";
  if (keys.has("s") || keys.has("S")) return "down";
  if (keys.has("a") || keys.has("A")) return "left";
  if (keys.has("d") || keys.has("D")) return "right";
  return null;
}

function checkVictory(
  state: MazeGameState,
  mode: GameMode,
  finish: [number, number],
  now: number,
): MazeGameState {
  if (state.status !== "playing") return state;

  const [fx, fy] = finish;
  const atFinish = (p: { x: number; y: number }) => p.x === fx && p.y === fy;

  if (mode === "solo") {
    if (atFinish(state.p1)) {
      return {
        ...state,
        status: "won",
        winner: "P1",
        finishTime: { p1: now, p2: null },
      };
    }
    return state;
  }

  const p1Done = atFinish(state.p1);
  const p2Done = atFinish(state.p2);
  let ft = { ...state.finishTime };
  if (p1Done && ft.p1 === null) ft.p1 = now;
  if (p2Done && ft.p2 === null) ft.p2 = now;

  if (mode === "race") {
    if (p1Done && p2Done) {
      const tie = ft.p1 === ft.p2;
      const winner: "P1" | "P2" | "TIE" = tie
        ? "TIE"
        : (ft.p1 as number) < (ft.p2 as number)
          ? "P1"
          : "P2";
      return { ...state, status: "won", winner, finishTime: ft };
    }
    if (p1Done && !p2Done) {
      return {
        ...state,
        status: "won",
        winner: "P1",
        finishTime: { ...ft, p1: ft.p1 ?? now },
      };
    }
    if (!p1Done && p2Done) {
      return {
        ...state,
        status: "won",
        winner: "P2",
        finishTime: { ...ft, p2: ft.p2 ?? now },
      };
    }
    return state;
  }

  if (mode === "coop") {
    if (p1Done && p2Done) {
      return { ...state, status: "won", winner: "ALL", finishTime: ft };
    }
    const ftChanged =
      ft.p1 !== state.finishTime.p1 || ft.p2 !== state.finishTime.p2;
    if (ftChanged) {
      return { ...state, finishTime: ft };
    }
    return state;
  }

  return state;
}

function getLeaderboardSteps(state: MazeGameState, mode: GameMode): number {
  if (mode === "solo") return state.steps.p1;
  if (mode === "coop") return state.steps.p1 + state.steps.p2;
  if (state.winner === "P1") return state.steps.p1;
  if (state.winner === "P2") return state.steps.p2;
  return Math.min(state.steps.p1, state.steps.p2);
}

function drawMaze(
  canvas: HTMLCanvasElement | null,
  state: MazeGameState,
  data: MazeOutputData,
  mode: GameMode,
  fogOn: boolean,
): void {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width: W, height: H, grid, finish } = data;
  const CS = calcCellSize(W, H);

  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, W * CS, H * CS);

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      const hue = (x * 37 + y * 19) % 360;
      ctx.fillStyle = `hsl(${hue}, 40%, 18%)`;
      ctx.fillRect(x * CS + 1, y * CS + 1, CS - 2, CS - 2);
    }
  }

  ctx.shadowColor = "#FF4444";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#FF2222";
  ctx.fillRect(
    finish[0] * CS + CS * 0.2,
    finish[1] * CS + CS * 0.2,
    CS * 0.6,
    CS * 0.6,
  );
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(
    state.p1.x * CS + CS * 0.15,
    state.p1.y * CS + CS * 0.15,
    CS * 0.7,
    CS * 0.7,
  );

  if (mode !== "solo") {
    ctx.fillStyle = "rgba(92, 210, 235, 0.9)";
    ctx.fillRect(
      state.p2.x * CS + CS * 0.25,
      state.p2.y * CS + CS * 0.25,
      CS * 0.5,
      CS * 0.5,
    );
  }

  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (x < W - 1 && !grid[x][y].right) {
        ctx.beginPath();
        ctx.moveTo((x + 1) * CS, y * CS);
        ctx.lineTo((x + 1) * CS, (y + 1) * CS);
        ctx.stroke();
      }
      if (y < H - 1 && !grid[x][y].down) {
        ctx.beginPath();
        ctx.moveTo(x * CS, (y + 1) * CS);
        ctx.lineTo((x + 1) * CS, (y + 1) * CS);
        ctx.stroke();
      }
    }
  }

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, W * CS, H * CS);

  if (fogOn) {
    const fogCanvas = document.createElement("canvas");
    fogCanvas.width = W * CS;
    fogCanvas.height = H * CS;
    const fc = fogCanvas.getContext("2d");
    if (!fc) return;

    fc.fillStyle = "#000000";
    fc.fillRect(0, 0, W * CS, H * CS);

    fc.globalCompositeOperation = "destination-out";
    const r = FOG_RADIUS * CS;
    const drawHole = (px: number, py: number) => {
      const grad = fc.createRadialGradient(
        (px + 0.5) * CS,
        (py + 0.5) * CS,
        0,
        (px + 0.5) * CS,
        (py + 0.5) * CS,
        r,
      );
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.7, "rgba(0,0,0,0.8)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      fc.fillStyle = grad;

      fc.beginPath();
      fc.arc((px + 0.5) * CS, (py + 0.5) * CS, r, 0, Math.PI * 2);
      fc.fill();
    };
    drawHole(state.p1.x, state.p1.y);
    if (mode !== "solo") drawHole(state.p2.x, state.p2.y);
    fc.globalCompositeOperation = "source-over";

    ctx.drawImage(fogCanvas, 0, 0);
  }
}

function drawMazeGen(
  canvas: HTMLCanvasElement | null,
  visited: boolean[][],
  partialGrid: MazeCell[][],
  current: { x: number; y: number } | null,
  data: MazeOutputData,
): void {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width: W, height: H } = data;
  const CS = calcCellSize(W, H);

  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(0, 0, W * CS, H * CS);

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (current && x === current.x && y === current.y) {
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(x * CS + 1, y * CS + 1, CS - 2, CS - 2);
        ctx.shadowBlur = 0;
      } else if (visited[x]?.[y]) {
        const hue = (x * 37 + y * 19) % 360;
        ctx.fillStyle = `hsl(${hue}, 55%, 26%)`;
        ctx.fillRect(x * CS + 1, y * CS + 1, CS - 2, CS - 2);
      }
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (x < W - 1 && !partialGrid[x][y].right) {
        ctx.beginPath();
        ctx.moveTo((x + 1) * CS, y * CS);
        ctx.lineTo((x + 1) * CS, (y + 1) * CS);
        ctx.stroke();
      }
      if (y < H - 1 && !partialGrid[x][y].down) {
        ctx.beginPath();
        ctx.moveTo(x * CS, (y + 1) * CS);
        ctx.lineTo((x + 1) * CS, (y + 1) * CS);
        ctx.stroke();
      }
    }
  }

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, W * CS, H * CS);
}

const MazeOutputRenderer = forwardRef<MazeOutputRendererHandle, Props>(
  function MazeOutputRenderer({ data, onViewPhaseChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number | null>(null);
    const keysHeld = useRef(new Set<string>());
    const lastMove = useRef({ p1: 0, p2: 0 });
    const stateRef = useRef<MazeGameState>(buildInitialState(data));
    const modeRef = useRef<GameMode>("solo");
    const elapsedRef = useRef(0);

    const [gameState, setGameState] = useState<MazeGameState>(() =>
      buildInitialState(data),
    );
    const [mode, setMode] = useState<GameMode>("solo");
    const [fogOn, setFogOn] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [elapsedMs, setElapsedMs] = useState(0);

    const [viewPhase, setViewPhase] = useState<ViewPhase>(() =>
      data.generationSteps && data.generationSteps.length > 0
        ? "generating"
        : "game",
    );
    const [genPlaying, setGenPlaying] = useState(true);
    const [genStepIndex, setGenStepIndex] = useState(0);
    const [genSpeedMultiplier, setGenSpeedMultiplier] = useState(1.0);

    const genVisitedRef = useRef<boolean[][]>([]);
    const genPartialGridRef = useRef<MazeCell[][]>([]);
    const genCurrentRef = useRef<{ x: number; y: number } | null>(null);
    const genStepRef = useRef(0);
    const genFinishTimerRef = useRef<number | null>(null);
    const viewPhaseRef = useRef<ViewPhase>(
      data.generationSteps && data.generationSteps.length > 0
        ? "generating"
        : "game",
    );

    const handleReset = useCallback(() => {
      const s = buildInitialState(data);
      stateRef.current = s;
      setGameState(s);
      lastMove.current = { p1: 0, p2: 0 };
      elapsedRef.current = 0;
      setElapsedMs(0);
    }, [data]);

    useEffect(() => {
      modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
      viewPhaseRef.current = viewPhase;
    }, [viewPhase]);

    useEffect(() => {
      handleReset();
      setLeaderboard([]);
    }, [data, handleReset]);

    useEffect(() => {
      const steps = data.generationSteps;
      genVisitedRef.current = Array.from({ length: data.width }, () =>
        new Array(data.height).fill(false),
      );
      genPartialGridRef.current = Array.from({ length: data.width }, () =>
        Array.from({ length: data.height }, () => ({
          right: false,
          down: false,
        })),
      );
      genStepRef.current = 0;

      if (steps && steps.length > 0) {
        const [fx, fy] = steps[0];
        genVisitedRef.current[fx][fy] = true;
        genCurrentRef.current = { x: fx, y: fy };
        setViewPhase("generating");
        setGenPlaying(true);
        setGenStepIndex(0);
      } else {
        genCurrentRef.current = null;
        setViewPhase("game");
      }
    }, [data]);

    useEffect(() => {
      if (gameState.status !== "playing") {
        return;
      }
      const id = window.setInterval(() => {
        setElapsedMs((prev) => {
          const n = prev + 100;
          elapsedRef.current = n;
          return n;
        });
      }, 100);
      return () => clearInterval(id);
    }, [gameState.status]);

    useEffect(() => {
      if (gameState.status !== "playing") {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }

      const tick = (now: number) => {
        const state = stateRef.current;
        if (state.status !== "playing") return;

        let next = { ...state };
        let changed = false;

        if (now - lastMove.current.p1 > MOVE_DELAY) {
          const dir = getP1Dir(keysHeld.current);
          if (dir) {
            const np1 = tryMove(
              state.p1,
              dir,
              data.grid,
              data.width,
              data.height,
            );
            if (np1 !== state.p1) {
              next = {
                ...next,
                p1: np1,
                steps: { ...next.steps, p1: next.steps.p1 + 1 },
              };
              lastMove.current.p1 = now;
              changed = true;
            }
          }
        }

        if (
          modeRef.current !== "solo" &&
          now - lastMove.current.p2 > MOVE_DELAY
        ) {
          const dir = getP2Dir(keysHeld.current);
          if (dir) {
            const np2 = tryMove(
              state.p2,
              dir,
              data.grid,
              data.width,
              data.height,
            );
            if (np2 !== state.p2) {
              next = {
                ...next,
                p2: np2,
                steps: { ...next.steps, p2: next.steps.p2 + 1 },
              };
              lastMove.current.p2 = now;
              changed = true;
            }
          }
        }

        const afterVictory = checkVictory(
          next,
          modeRef.current,
          data.finish,
          now,
        );
        if (afterVictory !== next) {
          next = afterVictory;
          changed = true;
        }

        if (changed) {
          stateRef.current = next;
          setGameState(next);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [gameState.status, data]);

    useEffect(() => {
      if (viewPhase !== "generating" || !genPlaying) return;
      const steps = data.generationSteps;
      if (!steps || steps.length === 0) return;

      const id = window.setInterval(
        () => {
          const i = genStepRef.current;
          if (i >= steps.length) {
            window.clearInterval(id);
            if (genFinishTimerRef.current)
              window.clearTimeout(genFinishTimerRef.current);
            genFinishTimerRef.current = window.setTimeout(() => {
              genFinishTimerRef.current = null;
              setViewPhase("game");
            }, 500);
            return;
          }
          const [fx, fy, tx, ty] = steps[i];
          if (tx >= 0) {
            genVisitedRef.current[tx][ty] = true;
            const dx = tx - fx;
            const dy = ty - fy;
            if (dx === 1) genPartialGridRef.current[fx][fy].right = true;
            else if (dx === -1) genPartialGridRef.current[tx][ty].right = true;
            else if (dy === 1) genPartialGridRef.current[fx][fy].down = true;
            else if (dy === -1) genPartialGridRef.current[tx][ty].down = true;
            genCurrentRef.current = { x: tx, y: ty };
          } else {
            genCurrentRef.current = { x: fx, y: fy };
          }
          genStepRef.current = i + 1;
          setGenStepIndex(i + 1);
        },
        Math.max(4, Math.round(BASE_GEN_SPEED_MS / genSpeedMultiplier)),
      );

      return () => {
        window.clearInterval(id);
        if (genFinishTimerRef.current) {
          window.clearTimeout(genFinishTimerRef.current);
          genFinishTimerRef.current = null;
        }
      };
    }, [viewPhase, genPlaying, genSpeedMultiplier, data]);

    useEffect(() => {
      if (viewPhase !== "generating") return;
      drawMazeGen(
        canvasRef.current,
        genVisitedRef.current,
        genPartialGridRef.current,
        genCurrentRef.current,
        data,
      );
    }, [viewPhase, genStepIndex, data]);

    useEffect(() => {
      if (viewPhase !== "game") return;
      drawMaze(canvasRef.current, gameState, data, mode, fogOn);
    }, [viewPhase, gameState, fogOn, data, mode]);

    const seekToStep = useCallback(
      (completedCount: number) => {
        if (genFinishTimerRef.current) {
          window.clearTimeout(genFinishTimerRef.current);
          genFinishTimerRef.current = null;
        }

        const steps = data.generationSteps ?? [];
        const clamped = Math.max(0, Math.min(completedCount, steps.length));

        const newVisited = Array.from({ length: data.width }, () =>
          new Array(data.height).fill(false),
        );
        const newGrid = Array.from({ length: data.width }, () =>
          Array.from({ length: data.height }, () => ({
            right: false,
            down: false,
          })),
        );

        let current: { x: number; y: number } | null = null;
        if (steps.length > 0) {
          const [fx0, fy0] = steps[0];
          newVisited[fx0][fy0] = true;
          current = { x: fx0, y: fy0 };
        }

        for (let i = 0; i < clamped; i++) {
          const [fx, fy, tx, ty] = steps[i];
          if (tx >= 0) {
            newVisited[tx][ty] = true;
            const dx = tx - fx;
            const dy = ty - fy;
            if (dx === 1) newGrid[fx][fy].right = true;
            else if (dx === -1) newGrid[tx][ty].right = true;
            else if (dy === 1) newGrid[fx][fy].down = true;
            else if (dy === -1) newGrid[tx][ty].down = true;
            current = { x: tx, y: ty };
          } else {
            current = { x: fx, y: fy };
          }
        }

        genVisitedRef.current = newVisited;
        genPartialGridRef.current = newGrid;
        genCurrentRef.current = current;
        genStepRef.current = clamped;
        setGenStepIndex(clamped);
      },
      [data],
    );

    const handleSkipGen = useCallback(() => {
      if (genFinishTimerRef.current) {
        window.clearTimeout(genFinishTimerRef.current);
        genFinishTimerRef.current = null;
      }
      genPartialGridRef.current = data.grid.map((col) =>
        col.map((cell) => ({ ...cell })),
      );
      genVisitedRef.current = Array.from({ length: data.width }, () =>
        new Array(data.height).fill(true),
      );
      genCurrentRef.current = null;
      genStepRef.current = data.generationSteps?.length ?? 0;
      setGenPlaying(false);
      setViewPhase("game");
    }, [data]);

    useImperativeHandle(
      ref,
      () => ({
        skipGeneration: handleSkipGen,
      }),
      [handleSkipGen],
    );

    useEffect(() => {
      onViewPhaseChange?.(viewPhase);
    }, [viewPhase, onViewPhaseChange]);

    const prevStatusRef = useRef<MazeStatus>(gameState.status);
    useEffect(() => {
      if (
        gameState.status === "won" &&
        prevStatusRef.current !== "won" &&
        gameState.winner
      ) {
        prevStatusRef.current = "won";
        const entry: LeaderboardEntry = {
          rank: 0,
          steps: getLeaderboardSteps(gameState, mode),
          elapsed: elapsedRef.current,
          mode,
        };
        setLeaderboard((prev) => {
          const updated = [...prev, entry]
            .sort((a, b) =>
              a.steps !== b.steps ? a.steps - b.steps : a.elapsed - b.elapsed,
            )
            .map((e, i) => ({ ...e, rank: i + 1 }));
          return updated;
        });
      }
      if (gameState.status !== "won") {
        prevStatusRef.current = gameState.status;
      }
    }, [gameState.status, gameState.winner, gameState.steps, mode]);

    useEffect(() => {
      const onDown = (e: KeyboardEvent) => {
        keysHeld.current.add(e.key);
        if (
          [
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "w",
            "a",
            "s",
            "d",
            "W",
            "A",
            "S",
            "D",
          ].includes(e.key)
        ) {
          e.preventDefault();
        }

        if (
          stateRef.current.status === "idle" &&
          viewPhaseRef.current === "game"
        ) {
          const m = modeRef.current;
          const p1 = getP1Dir(keysHeld.current);
          const p2 = m !== "solo" ? getP2Dir(keysHeld.current) : null;
          if (p1 || p2) {
            const t = performance.now();
            const ns: MazeGameState = {
              ...stateRef.current,
              status: "playing",
              startTime: t,
            };
            stateRef.current = ns;
            setGameState(ns);
            lastMove.current = { p1: t, p2: t };
            elapsedRef.current = 0;
            setElapsedMs(0);
          }
        }
      };
      const onUp = (e: KeyboardEvent) => {
        keysHeld.current.delete(e.key);
      };
      window.addEventListener("keydown", onDown);
      window.addEventListener("keyup", onUp);
      return () => {
        window.removeEventListener("keydown", onDown);
        window.removeEventListener("keyup", onUp);
      };
    }, []);

    const modeLabel = (m: GameMode) =>
      m === "solo" ? "單人" : m === "race" ? "雙人競速" : "雙人合作";

    const cell = calcCellSize(data.width, data.height);
    const totalGenSteps = data.generationSteps?.length ?? 0;
    const genControlCurrentStep =
      totalGenSteps > 0 ? Math.min(genStepIndex, totalGenSteps - 1) : 0;
    const sliderStepToCompleted = (sliderStep: number) => {
      if (totalGenSteps <= 1) return Math.min(sliderStep, totalGenSteps);
      return sliderStep >= totalGenSteps - 1 ? totalGenSteps : sliderStep;
    };

    return (
      <div className={styles.wrapper}>
        <div className={styles.purpose}>
          <div className={styles.purposeTitle}>DFS 迷宮遊戲</div>
          <div className={styles.purposeBody}>
            <p>
              DFS 遞迴生成完美迷宮（無環、唯一路徑）。↑↓←→ 控制 P1，WASD 控制
              P2。
            </p>
            <p>
              點擊按鈕選擇模式，從 <strong>左上角出發</strong>，到達{" "}
              <strong className={styles.finish}>紅色終點</strong>！
            </p>
          </div>
        </div>

        <div className={styles.controls}>
          {viewPhase === "generating" ? (
            <div className={styles.genControlBarWrap}>
              <ControlBar
                isPlaying={genPlaying}
                currentStep={genControlCurrentStep}
                totalSteps={totalGenSteps}
                playbackSpeed={genSpeedMultiplier}
                onPlay={() => setGenPlaying(true)}
                onPause={() => setGenPlaying(false)}
                onNext={() => {
                  setGenPlaying(false);
                  seekToStep(Math.min(genStepIndex + 1, totalGenSteps));
                }}
                onPrev={() => {
                  setGenPlaying(false);
                  seekToStep(Math.max(0, genStepIndex - 1));
                }}
                onReset={() => {
                  seekToStep(0);
                  setGenPlaying(true);
                }}
                onSpeedChange={setGenSpeedMultiplier}
                onStepChange={(s) => {
                  setGenPlaying(false);
                  seekToStep(sliderStepToCompleted(s));
                }}
              />
            </div>
          ) : (
            <>
              <div className={styles.modeGroup}>
                {(["solo", "race", "coop"] as GameMode[]).map((m) => (
                  <Button
                    key={m}
                    variant={mode === m ? "primary" : "ghost"}
                    onClick={() => {
                      modeRef.current = m;
                      setMode(m);
                      handleReset();
                    }}
                  >
                    {m === "solo"
                      ? "單人"
                      : m === "race"
                        ? "雙人競速"
                        : "雙人合作"}
                  </Button>
                ))}
              </div>
              <Button
                variant={fogOn ? "primary" : "ghost"}
                onClick={() => setFogOn((f) => !f)}
              >
                {fogOn ? "迷霧 ON" : "迷霧 OFF"}
              </Button>
              <Button variant="ghost" onClick={handleReset} title="重置">
                重置
              </Button>
              <div className={styles.statsBar}>
                <span>
                  P1: <strong>{gameState.steps.p1}</strong> 步
                </span>
                {mode !== "solo" && (
                  <span>
                    P2: <strong>{gameState.steps.p2}</strong> 步
                  </span>
                )}
                <span>{formatTime(elapsedMs)}</span>
              </div>
            </>
          )}
        </div>

        <div className={styles.canvasWrap}>
          <canvas
            ref={canvasRef}
            width={data.width * cell}
            height={data.height * cell}
            className={styles.canvas}
          />
          {viewPhase === "game" && gameState.status === "idle" && (
            <div className={styles.idleOverlay}>
              <span>按方向鍵開始！</span>
            </div>
          )}
        </div>

        {gameState.status === "won" && (
          <div className={styles.winCard}>
            <div className={styles.winTitle}>
              {mode === "solo" ? (
                <>
                  <Icon name="check" /> 抵達終點！
                </>
              ) : mode === "race" ? (
                <>
                  <Icon name="trophy" />{" "}
                  {gameState.winner === "TIE"
                    ? "平手！"
                    : `${gameState.winner} 勝利！`}
                </>
              ) : (
                <>
                  <Icon name="check" /> 合作完成！
                </>
              )}
            </div>
            <div className={styles.winStats}>
              <span>
                P1：<strong>{gameState.steps.p1} 步</strong>
              </span>
              {mode !== "solo" && (
                <span>
                  P2：<strong>{gameState.steps.p2} 步</strong>
                </span>
              )}
              <span>
                耗時：<strong>{formatTime(elapsedMs)}</strong>
              </span>
            </div>
          </div>
        )}

        {leaderboard.length >= 2 && (
          <div className={styles.leaderboard}>
            <div className={styles.leaderboardTitle}>
              <Icon name="chart-line" /> 本局排行榜
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>模式</th>
                  <th>步數</th>
                  <th>耗時</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={i} className={i === 0 ? styles.rowBest : ""}>
                    <td>{entry.rank}</td>
                    <td>{modeLabel(entry.mode)}</td>
                    <td>{entry.steps}</td>
                    <td>{formatTime(entry.elapsed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  },
);

export default MazeOutputRenderer;
