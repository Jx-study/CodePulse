import React, { useState, useCallback, useEffect, useRef } from "react";
import classNames from "classnames";
import Icon  from '@/shared/components/Icon';
import type {
  GameState,
  PopupInstance,
  PopupTypeState,
} from "../../../../../../types/games/stackGameTypes";
import type { PopupDefinition, SpawnChildItem } from "./gameConfig";
import {
  POPUP_SEQUENCE,
  RULES_POPUP,
  CONGRATS_POPUP,
  GAME_DURATION_SECONDS,
  POPUP_PUSH_INTERVAL_MS,
  TIMER_BAR_H,
} from "./gameConfig";
import PopupWindow from "./PopupWindow";
import StackVisualizer from "./StackVisualizer";
import Button from "@/shared/components/Button";
import styles from "./StackGameRenderer.module.scss";

function computeSpiralPositions(
  defs: PopupDefinition[],
  canvasW: number,
  canvasH: number,
): Array<{ x: number; y: number }> {
  const MARGIN = 8;
  const GOLDEN_ANGLE = 2.399; // 約 137.5° 的黃金角弧度，自然均勻分布

  return defs.map((def, i) => {
    const radius = i === 0 ? 0 : 40 + i * 28; // i=0 在中心，之後逐步擴張
    const angle = i * GOLDEN_ANGLE;

    // 彈窗左上角座標的「未夾取」中心點
    const cx = canvasW / 2 - def.size.w / 2 + radius * Math.cos(angle);
    const cy = canvasH / 2 - def.size.h / 2 + radius * Math.sin(angle);

    return {
      x: Math.max(MARGIN, Math.min(canvasW - def.size.w - MARGIN, cx)),
      y: Math.max(
        TIMER_BAR_H + MARGIN,
        Math.min(canvasH - def.size.h - MARGIN, cy),
      ),
    };
  });
}

function getInitialTypeState(type: PopupInstance["type"]): PopupTypeState {
  switch (type) {
    case "corner-teleport":
      return { kind: "corner-teleport", clicksRemaining: 4, cornerIndex: 0 };
    case "boss":
      return { kind: "boss", minionsSpawned: false, minionsRemaining: 3 };
    case "sine-wave":
      return {
        kind: "sine-wave",
        childrenSpawned: false,
        childrenRemaining: 6,
      };
    case "quiz":
      return { kind: "quiz", selectedAnswer: null, isCorrect: false };
    case "speed-test":
      return {
        kind: "speed-test",
        activatedAt: null,
        spawnedCount: 0,
        isLocked: false,
      };
    case "bouncing-h":
      return { kind: "bouncing", vx: 2, vy: 0 };
    case "tv-bouncing":
      return { kind: "bouncing", vx: 2, vy: 2 };
    case "random-walk":
      return { kind: "random-walk", targetX: 0, targetY: 0 };
    default:
      return { kind: "default" };
  }
}

function createPopupInstance(
  def: PopupDefinition,
  canvasSize: { w: number; h: number },
  id?: string,
  positionOverride?: { x: number; y: number },
): PopupInstance {
  const popupId =
    id ?? `popup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const canvasW = canvasSize.w;
  const canvasH = canvasSize.h;

  let x: number;
  let y: number;
  if (positionOverride) {
    x = positionOverride.x;
    y = positionOverride.y;
  } else if (def.type === "corner-teleport") {
    x = 8;
    y = 8;
  } else if (def.type === "rules") {
    x = Math.max(8, (canvasW - def.size.w) / 2);
    y = Math.max(8, (canvasH - def.size.h) / 2);
  } else {
    const maxX = Math.max(8, canvasW - def.size.w - 8);
    const maxY = Math.max(8, canvasH - def.size.h - 8);
    x = 8 + Math.random() * (maxX - 8);
    y = 8 + Math.random() * (maxY - 8);
  }

  const isCloseable = !["boss", "sine-wave", "speed-test", "quiz"].includes(
    def.type,
  );

  return {
    id: popupId,
    type: def.type,
    title: def.title,
    iconName: def.iconName,
    position: { x, y },
    size: def.size,
    isCloseable,
    typeState: getInitialTypeState(def.type),
  };
}

function popTopPopup(state: GameState, now: number): GameState {
  const topId =
    state.stack.length > 0 ? state.stack[state.stack.length - 1] : undefined;
  if (!topId) return state;

  const popup = state.popups.get(topId);
  if (!popup) return state;

  const closeDuration = state.lastCloseTime ? now - state.lastCloseTime : 0;
  const newCloseHistory =
    closeDuration > 0
      ? [...state.closeHistory, closeDuration]
      : state.closeHistory;

  const newStack = state.stack.slice(0, -1);
  const newPopups = new Map(state.popups);
  newPopups.delete(topId);

  return {
    ...state,
    stack: newStack,
    popups: newPopups,
    closeHistory: newCloseHistory,
    lastCloseTime: now,
  };
}

function pushPopup(state: GameState, popup: PopupInstance): GameState {
  const newPopups = new Map(state.popups);
  newPopups.set(popup.id, popup);
  return {
    ...state,
    stack: [...state.stack, popup.id],
    popups: newPopups,
  };
}

function buildInitialState(): GameState {
  return {
    status: "idle",
    stack: [],
    popups: new Map(),
    timeLeft: GAME_DURATION_SECONDS,
    closeHistory: [],
    lastCloseTime: null,
    wonAt: null,
    startTime: null,
  };
}

const StackGameRenderer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(buildInitialState);
  const [containerSize, setContainerSize] = useState({ w: 1000, h: 500 });
  const [shakingId, setShakingId] = useState<string | null>(null);
  const popupRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const gameCanvasW = containerSize.w; // 直接用 canvas 真實寬度（ref 掛在 canvas div）
  const gameCanvasH = containerSize.h;

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {};
      if (width != null && height != null) {
        setContainerSize({ w: width, h: height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleStartGame = useCallback(() => {
    const queue = [...POPUP_SEQUENCE, RULES_POPUP];
    const spiralPositions = computeSpiralPositions(
      queue,
      gameCanvasW,
      gameCanvasH,
    );

    setGameState((s) => ({ ...s, status: "intro" }));

    let i = 0;
    const interval = setInterval(() => {
      if (i >= queue.length) {
        clearInterval(interval);
        return;
      }
      const instance = createPopupInstance(
        queue[i],
        { w: gameCanvasW, h: gameCanvasH },
        undefined,
        spiralPositions[i],
      );
      setGameState((s) => pushPopup(s, instance));
      i++;
    }, POPUP_PUSH_INTERVAL_MS);
  }, [gameCanvasW, gameCanvasH]);

  useEffect(() => {
    if (gameState.status === "playing") {
      timerRef.current = setInterval(() => {
        setGameState((s) => {
          const newTime = s.timeLeft - 1;
          if (newTime <= 0 && s.stack.length > 0) {
            return { ...s, timeLeft: 0, status: "failed" };
          }
          return { ...s, timeLeft: newTime };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.status]);

  const pushWarningPopup = useCallback(
    (blockedPopupId: string) => {
      const blocked = gameState.popups.get(blockedPopupId);
      const title = blocked?.title ?? "未知彈窗";
      const def = {
        type: "warning" as const,
        title: `請先關閉「${title}」`,
        iconName: "exclamation-circle" as const,
        size: { w: 320, h: 120 },
      };
      const instance = createPopupInstance(def, {
        w: gameCanvasW,
        h: gameCanvasH,
      });
      (instance as PopupInstance).typeState = {
        kind: "warning",
        blockedPopupTitle: title,
      };
      setGameState((s) => pushPopup(s, instance));
    },
    [gameState.popups, gameCanvasW, gameCanvasH],
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (gameState.status !== "playing") return;
      const topId =
        gameState.stack.length > 0
          ? gameState.stack[gameState.stack.length - 1]
          : undefined;
      if (!topId) return;
      const topRef = popupRefs.current.get(topId);
      if (topRef && !topRef.contains(e.target as Node)) {
        pushWarningPopup(topId);
        setShakingId(topId);
        setTimeout(() => setShakingId(null), 400);
      }
    },
    [gameState.status, gameState.stack, pushWarningPopup],
  );

  const handleClosePopup = useCallback(
    (id: string) => {
      setGameState((s) => {
        if (s.stack.length === 0 || s.stack[s.stack.length - 1] !== id)
          return s;
        const popup = s.popups.get(id);
        const now = Date.now();
        let newState = popTopPopup(s, now);

        if (popup?.type === "rules") {
          newState = { ...newState, status: "playing", startTime: now };
        }

        if (popup?.type === "minion" && popup.typeState.kind === "minion") {
          const parentId = popup.typeState.parentId;
          const parent = newState.popups.get(parentId);
          if (parent?.type === "boss" && parent.typeState.kind === "boss") {
            const rem = parent.typeState.minionsRemaining - 1;
            const newPopups = new Map(newState.popups);
            newPopups.set(parentId, {
              ...parent,
              typeState: { ...parent.typeState, minionsRemaining: rem },
              isCloseable: rem <= 0,
            });
            newState = { ...newState, popups: newPopups };
          }
        }
        if (
          popup?.type === "sine-child" &&
          popup.typeState.kind === "sine-child"
        ) {
          const parentId = popup.typeState.parentId;
          const parent = newState.popups.get(parentId);
          if (
            parent?.type === "sine-wave" &&
            parent.typeState.kind === "sine-wave"
          ) {
            const rem = parent.typeState.childrenRemaining - 1;
            const newPopups = new Map(newState.popups);
            newPopups.set(parentId, {
              ...parent,
              typeState: { ...parent.typeState, childrenRemaining: rem },
              isCloseable: rem <= 0,
            });
            newState = { ...newState, popups: newPopups };
          }
        }
        if (
          popup?.type === "speed-test-child" &&
          popup.typeState.kind === "speed-test-child"
        ) {
          const parentId = popup.typeState.parentId;
          const parent = newState.popups.get(parentId);
          if (
            parent?.type === "speed-test" &&
            parent.typeState.kind === "speed-test"
          ) {
            const remainingKids = [...newState.popups.values()].filter(
              (p) =>
                p.typeState.kind === "speed-test-child" &&
                p.typeState.parentId === parentId,
            ).length;
            if (remainingKids === 0) {
              const newPopups = new Map(newState.popups);
              newPopups.set(parentId, {
                ...parent,
                typeState: { ...parent.typeState, isLocked: false },
                isCloseable: false,
              });
              newState = { ...newState, popups: newPopups };
            }
          }
        }

        if (newState.stack.length === 0 && newState.status === "playing") {
          const congrats = createPopupInstance(CONGRATS_POPUP, {
            w: gameCanvasW,
            h: gameCanvasH,
          });
          newState = pushPopup(newState, congrats);
          newState = { ...newState, status: "congrats" };
        }

        if (popup?.type === "congrats") {
          newState = { ...newState, status: "won", wonAt: now };
        }

        return newState;
      });
    },
    [gameCanvasW, gameCanvasH],
  );

  const handleUpdateTypeState = useCallback(
    (id: string, typeState: PopupTypeState) => {
      setGameState((s) => {
        const popup = s.popups.get(id);
        if (!popup) return s;
        const newPopups = new Map(s.popups);
        newPopups.set(id, { ...popup, typeState });
        return { ...s, popups: newPopups };
      });
    },
    [],
  );

  const handleUpdatePosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setGameState((s) => {
        const popup = s.popups.get(id);
        if (!popup) return s;
        const newPopups = new Map(s.popups);
        newPopups.set(id, { ...popup, position });
        return { ...s, popups: newPopups };
      });
    },
    [],
  );

  const handleSpawnChild = useCallback(
    (parentId: string, items: SpawnChildItem[]) => {
      const parent = gameState.popups.get(parentId);
      if (!parent) return;

      setGameState((s) => {
        let next = s;
        items.forEach((item) => {
          const pos =
            item.position ??
            (() => {
              const w = item.def.size.w;
              const h = item.def.size.h;
              const maxX = Math.max(8, gameCanvasW - w - 8);
              const maxY = Math.max(8, gameCanvasH - h - 8);
              return {
                x: 8 + Math.random() * (maxX - 8),
                y: 8 + Math.random() * (maxY - 8),
              };
            })();
          const instance = createPopupInstance(
            item.def,
            {
              w: gameCanvasW,
              h: gameCanvasH,
            },
            undefined,
            pos,
          );
          if (item.def.type === "minion") {
            (instance as PopupInstance).title = item.def.title;
            (instance as PopupInstance).typeState = {
              kind: "minion",
              parentId,
            };
          }
          if (item.def.type === "sine-child") {
            (instance as PopupInstance).typeState = {
              kind: "sine-child",
              parentId,
            };
          }
          if (item.def.type === "speed-test-child") {
            (instance as PopupInstance).typeState = {
              kind: "speed-test-child",
              parentId,
            };
          }
          next = pushPopup(next, instance);
        });

        const p = next.popups.get(parentId);
        if (!p) return next;

        if (p.type === "boss" && p.typeState.kind === "boss") {
          const newPopups = new Map(next.popups);
          newPopups.set(parentId, {
            ...p,
            typeState: {
              kind: "boss",
              minionsSpawned: true,
              minionsRemaining:
                p.typeState.kind === "boss" && p.typeState.minionsSpawned
                  ? p.typeState.minionsRemaining
                  : 3,
            },
            isCloseable: false,
          });
          next = { ...next, popups: newPopups };
        }
        if (p.type === "sine-wave" && p.typeState.kind === "sine-wave") {
          const newPopups = new Map(next.popups);
          newPopups.set(parentId, {
            ...p,
            typeState: {
              kind: "sine-wave",
              childrenSpawned: true,
              childrenRemaining: items.length,
            },
            isCloseable: false,
          });
          next = { ...next, popups: newPopups };
        }
        if (p.type === "speed-test" && p.typeState.kind === "speed-test") {
          const newPopups = new Map(next.popups);
          const ts = p.typeState;
          newPopups.set(parentId, {
            ...p,
            typeState: {
              ...ts,
              spawnedCount: ts.spawnedCount + items.length,
              isLocked: true,
            },
            isCloseable: false,
          });
          next = { ...next, popups: newPopups };
        }
        return next;
      });
    },
    [gameState.popups, gameCanvasW, gameCanvasH],
  );

  const getZIndex = useCallback((id: string, stack: string[]) => {
    const idx = stack.indexOf(id);
    return idx >= 0 ? 100 + idx : 0;
  }, []);

  const isShaking = useCallback((id: string) => shakingId === id, [shakingId]);

  return (
    <div className={styles.gameContainer}>
      <div
        className={styles.canvas}
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
      >
        <div className={styles.timerBar}>
          <span className={styles.timerLabel}><Icon name="stopwatch" /> {gameState.timeLeft}s</span>
          <div
            className={styles.timerFill}
            style={{
              width: `${(gameState.timeLeft / GAME_DURATION_SECONDS) * 100}%`,
            }}
          />
        </div>

        {gameState.status === "idle" && (
          <div className={styles.startOverlay}>
            <h3 className={styles.startTitle}>PopupStack 彈窗大戰</h3>
            <p className={styles.startDesc}>
              教授發動彈窗攻擊！
              <br />
              記住：<strong>最後出現的彈窗必須最先關閉</strong>（LIFO）
              <br />在 120 秒內關閉所有彈窗！
            </p>
            <Button
              type="button"
              variant="primary"
              className={styles.startBtn}
              onClick={handleStartGame}
            >
              <Icon name="play" /> 開始遊戲
            </Button>
          </div>
        )}

        {Array.from(gameState.popups.values()).map((popup) => (
          <PopupWindow
            key={popup.id}
            popup={popup}
            isTop={
              gameState.stack.length > 0 &&
              gameState.stack[gameState.stack.length - 1] === popup.id
            }
            zIndex={getZIndex(popup.id, gameState.stack)}
            onClose={handleClosePopup}
            onRegisterRef={(el) => {
              if (el) popupRefs.current.set(popup.id, el);
              else popupRefs.current.delete(popup.id);
            }}
            onUpdateTypeState={handleUpdateTypeState}
            onUpdatePosition={handleUpdatePosition}
            onSpawnChild={handleSpawnChild}
            gameStatus={gameState.status}
            canvasSize={{ w: gameCanvasW, h: gameCanvasH }}
            closeHistory={gameState.closeHistory}
            isShaking={isShaking(popup.id)}
          />
        ))}

        {(gameState.status === "failed" || gameState.status === "won") && (
          <div
            className={classNames(styles.resultOverlay, {
              [styles.failed]: gameState.status === "failed",
              [styles.won]: gameState.status === "won",
            })}
          >
            <h3>
              {gameState.status === "won" ? (
                <><Icon name="trophy" /> 恭喜過關！</>
              ) : (
                <><Icon name="stopwatch" /> 時間到！</>
              )}
            </h3>
            <p>
              {gameState.status === "won" &&
              gameState.wonAt &&
              gameState.startTime
                ? `用時：${Math.round((gameState.wonAt - gameState.startTime) / 1000)} 秒`
                : gameState.status === "failed"
                  ? "請再試一次，記得先關閉頂層彈窗！"
                  : ""}
            </p>
          </div>
        )}
      </div>

      <StackVisualizer stack={gameState.stack} popups={gameState.popups} />
    </div>
  );
};

export default StackGameRenderer;
