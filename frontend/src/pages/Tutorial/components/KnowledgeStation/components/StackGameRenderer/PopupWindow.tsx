import React, { useEffect, useRef, useCallback, useState } from "react";
import classNames from "classnames";
import Icon from '@/shared/components/Icon';
import type { IconName } from '@/shared/lib/iconMap';
import type {
  PopupInstance,
  PopupTypeState,
} from "@/types/games/stackGameTypes";
import type { SpawnChildItem } from "./gameConfig";
import {
  MINION_POPUP_SIZE,
  NORMAL_POPUP_SIZE,
  SINE_CHILD_POPUP_SIZE,
} from "./gameConfig";
import styles from "./PopupWindow.module.scss";
import Button from "@/shared/components/Button";

interface PopupWindowProps {
  popup: PopupInstance;
  isTop: boolean;
  zIndex: number;
  onClose: (id: string) => void;
  onRegisterRef: (el: HTMLDivElement | null) => void;
  onUpdateTypeState: (id: string, state: PopupTypeState) => void;
  onUpdatePosition?: (id: string, position: { x: number; y: number }) => void;
  onSpawnChild: (parentId: string, items: SpawnChildItem[]) => void;
  gameStatus: string;
  canvasSize: { w: number; h: number };
  closeHistory: number[];
  isShaking: boolean;
}

function useBouncingH(
  active: boolean,
  popup: PopupInstance,
  canvasSize: { w: number; h: number },
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void,
) {
  const posRef = useRef({ x: popup.position.x, vx: 1 });

  useEffect(() => {
    if (!active) return;
    let { x, vx } = posRef.current;
    let raf: number;

    const animate = () => {
      const w = popup.size.w;
      const cw = canvasSize.w;
      x += vx;
      if (x <= 0) {
        x = 0;
        vx = 1;
      } else if (x >= cw - w) {
        x = cw - w;
        vx = -1;
      }
      posRef.current = { x, vx };
      onUpdatePosition(popup.id, { x, y: popup.position.y });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [
    active,
    popup.id,
    popup.position.y,
    popup.size.w,
    canvasSize.w,
    onUpdatePosition,
  ]);
}

function useTVBouncing(
  active: boolean,
  popup: PopupInstance,
  canvasSize: { w: number; h: number },
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void,
) {
  const posRef = useRef({
    x: popup.position.x,
    y: popup.position.y,
    vx: 1.2,
    vy: 1.2,
  });

  useEffect(() => {
    if (!active) return;
    let { x, y, vx, vy } = posRef.current;
    let raf: number;

    const animate = () => {
      const w = popup.size.w;
      const h = popup.size.h;
      const cw = canvasSize.w;
      const ch = canvasSize.h;
      x += vx;
      y += vy;
      if (x <= 0) {
        x = 0;
        vx = 1.2;
      } else if (x >= cw - w) {
        x = cw - w;
        vx = -1.2;
      }
      if (y <= 0) {
        y = 0;
        vy = 1.2;
      } else if (y >= ch - h) {
        y = ch - h;
        vy = -1.2;
      }
      posRef.current = { x, y, vx, vy };
      onUpdatePosition(popup.id, { x, y });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [active, popup.id, popup.size, canvasSize, onUpdatePosition]);
}

function useRandomWalk(
  active: boolean,
  popup: PopupInstance,
  canvasSize: { w: number; h: number },
  onUpdateTypeState: (id: string, state: PopupTypeState) => void,
) {
  useEffect(() => {
    if (!active || popup.typeState.kind !== "random-walk") return;
    const w = popup.size.w;
    const h = popup.size.h;
    const maxX = Math.max(0, canvasSize.w - w - 16);
    const maxY = Math.max(0, canvasSize.h - h - 16);
    const targetX = 8 + Math.random() * maxX;
    const targetY = 8 + Math.random() * maxY;
    onUpdateTypeState(popup.id, {
      kind: "random-walk",
      targetX,
      targetY,
    });

    const id = setInterval(() => {
      const maxX = Math.max(0, canvasSize.w - w - 16);
      const maxY = Math.max(0, canvasSize.h - h - 16);
      const tx = 8 + Math.random() * maxX;
      const ty = 8 + Math.random() * maxY;
      onUpdateTypeState(popup.id, {
        kind: "random-walk",
        targetX: tx,
        targetY: ty,
      });
    }, 400);
    return () => clearInterval(id);
  }, [active, popup.id, popup.size, canvasSize, onUpdateTypeState]);
}

function useBossSpawn(
  active: boolean,
  popup: PopupInstance,
  onSpawnChild: (parentId: string, items: SpawnChildItem[]) => void,
  onUpdateTypeState: (id: string, state: PopupTypeState) => void,
) {
  useEffect(() => {
    if (
      !active ||
      popup.typeState.kind !== "boss" ||
      popup.typeState.minionsSpawned
    )
      return;
    onUpdateTypeState(popup.id, {
      kind: "boss",
      minionsSpawned: true,
      minionsRemaining: 3,
    });
    [
      { def: { type: "minion" as const, title: "小弟 #1", iconName: "screwdriver-wrench" as const, size: MINION_POPUP_SIZE } },
      { def: { type: "minion" as const, title: "小弟 #2", iconName: "screwdriver-wrench" as const, size: MINION_POPUP_SIZE } },
      { def: { type: "minion" as const, title: "小弟 #3", iconName: "screwdriver-wrench" as const, size: MINION_POPUP_SIZE } },
    ].forEach((item, i) => {
      setTimeout(() => onSpawnChild(popup.id, [item]), i * 150);
    });
  }, [active, popup.id, popup.typeState.kind, onSpawnChild, onUpdateTypeState]);
}

function useSineWaveSpawn(
  active: boolean,
  popup: PopupInstance,
  canvasSize: { w: number; h: number },
  onSpawnChild: (parentId: string, items: SpawnChildItem[]) => void,
  onUpdateTypeState: (id: string, state: PopupTypeState) => void,
) {
  useEffect(() => {
    if (
      !active ||
      popup.typeState.kind !== "sine-wave" ||
      popup.typeState.childrenSpawned
    )
      return;
    onUpdateTypeState(popup.id, {
      kind: "sine-wave",
      childrenSpawned: true,
      childrenRemaining: 6,
    });
    const cw = canvasSize.w;
    const ch = canvasSize.h;
    Array.from({ length: 6 }, (_, i) => ({
      def: {
        type: "sine-child" as const,
        title: `子彈窗 ${i + 1}`,
        iconName: "wave-square" as const,
        size: SINE_CHILD_POPUP_SIZE,
      },
      position: {
        x: cw * 0.1 + i * (cw * 0.13),
        y: ch * 0.3 + Math.sin((i * Math.PI) / 3) * 80,
      },
    })).forEach((item, i) => {
      setTimeout(() => onSpawnChild(popup.id, [item]), i * 50);
    });
  }, [
    active,
    popup.id,
    popup.typeState.kind,
    canvasSize,
    onSpawnChild,
    onUpdateTypeState,
  ]);
}

function useSpeedTestWatch(
  active: boolean,
  popupId: string,
  isLocked: boolean,
  closeHistory: number[],
  onSpawnChild: (parentId: string, items: SpawnChildItem[]) => void,
) {
  const timerSetRef = useRef(false);
  const onSpawnChildRef = useRef(onSpawnChild);
  onSpawnChildRef.current = onSpawnChild;
  const closeHistoryRef = useRef(closeHistory);
  closeHistoryRef.current = closeHistory;

  useEffect(() => {
    if (!active || isLocked || timerSetRef.current) return;
    timerSetRef.current = true;

    const history = closeHistoryRef.current;
    const avg =
      history.length > 0
        ? history.reduce((a, b) => a + b, 0) / history.length
        : 10;

    const timer = setTimeout(() => {
      timerSetRef.current = false;
      Array.from({ length: 5 }, () => ({
        def: {
          type: "speed-test-child" as const,
          title: "額外彈窗",
          iconName: "stopwatch" as const,
          size: NORMAL_POPUP_SIZE,
        },
      })).forEach((item, i) => {
        setTimeout(() => {
          onSpawnChildRef.current(popupId, [item]);
        }, i * 80);
      });
    }, Math.max(avg, 80));

    return () => clearTimeout(timer);
  }, [active, isLocked, popupId]);
}

function PopupContent({
  popup,
  onClose,
  onUpdateTypeState,
}: {
  popup: PopupInstance;
  onClose: (id: string) => void;
  onUpdateTypeState: (id: string, state: PopupTypeState) => void;
}) {
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  switch (popup.type) {
    case "rules":
      return (
        <div className={styles.contentRules}>
          <p>
            彈窗遵循 <strong>LIFO（後進先出）</strong>
            ：最後出現的彈窗必須最先關閉！
          </p>
          <p>關閉此視窗即可開始倒計時。</p>
          <Button
            type="button"
            variant="primary"
            className={styles.primaryBtn}
            onClick={() => onClose(popup.id)}
          >
            我知道了，開始遊戲！
          </Button>
        </div>
      );
    case "hidden-close":
      return (
        <div className={styles.contentHidden}>
          <p>這段文字裡藏著關閉按鈕……</p>
          <p>
            找到了嗎？點擊
            <Button
              type="button"
              variant="ghost"
              className={styles.inlineClose}
              onClick={() => onClose(popup.id)}
            >
              [關閉此視窗]
            </Button>
          </p>
        </div>
      );
    case "corner-teleport":
      return (
        <div className={styles.contentCorner}>
          <p>
            還需點擊{" "}
            {popup.typeState.kind === "corner-teleport"
              ? popup.typeState.clicksRemaining
              : 4}{" "}
            次
          </p>
        </div>
      );
    case "boss":
      return (
        <div className={styles.contentBoss}>
          <p>等我的小弟們都走了再說…</p>
          <p>
            剩餘：
            {popup.typeState.kind === "boss"
              ? popup.typeState.minionsRemaining
              : 3}{" "}
            個
          </p>
        </div>
      );
    case "sine-wave":
      return (
        <div className={styles.contentSine}>
          <p>你以為關掉我就結束了？</p>
        </div>
      );
    case "quiz":
      return (
        <div className={styles.contentQuiz}>
          <p>關於 Stack，以下哪個描述正確？</p>
          <div className={styles.radioGroup}>
            {[
              "A. 先進先出（FIFO）",
              "B. 先進後出（LIFO）",
              "C. 隨機存取",
              "D. 雙向存取",
            ].map((opt) => (
              <label key={opt}>
                <input
                  type="radio"
                  name={`quiz-${popup.id}`}
                  value={opt}
                  checked={quizAnswer === opt}
                  onChange={() => setQuizAnswer(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
          <Button
            type="button"
            variant="primary"
            className={styles.primaryBtn}
            onClick={() => {
              if (quizAnswer === "B. 先進後出（LIFO）") {
                onClose(popup.id);
              } else if (quizAnswer) {
                onUpdateTypeState(popup.id, {
                  kind: "quiz",
                  selectedAnswer: quizAnswer,
                  isCorrect: false,
                });
              }
            }}
          >
            提交
          </Button>
        </div>
      );
    case "speed-test":
      return (
        <div className={styles.contentSpeed}>
          <Button
            type="button"
            variant="ghost"
            className={styles.speedBtn}
            onClick={() => onClose(popup.id)}
          >
            快點擊我！
          </Button>
        </div>
      );
    case "warning":
      return (
        <div className={styles.contentWarning}>
          <p>{popup.title}</p>
        </div>
      );
    case "congrats":
      return (
        <div className={styles.contentCongrats}>
          <p>恭喜！所有彈窗已關閉！</p>
          <p>請點擊 X 完成挑戰</p>
        </div>
      );
    default:
      return (
        <div className={styles.contentNormal}>
          <p>點擊右上角 X 關閉</p>
        </div>
      );
  }
}

const PopupWindow: React.FC<PopupWindowProps> = ({
  popup,
  isTop,
  zIndex,
  onClose,
  onRegisterRef,
  onUpdateTypeState,
  onUpdatePosition,
  onSpawnChild,
  gameStatus,
  canvasSize,
  closeHistory,
  isShaking,
}) => {
  const active = isTop && gameStatus === "playing";

  useBouncingH(
    active && popup.type === "bouncing-h",
    popup,
    canvasSize,
    onUpdatePosition ?? (() => {}),
  );
  useTVBouncing(
    active && popup.type === "tv-bouncing",
    popup,
    canvasSize,
    onUpdatePosition ?? (() => {}),
  );
  useRandomWalk(
    active && popup.type === "random-walk",
    popup,
    canvasSize,
    onUpdateTypeState,
  );
  useBossSpawn(
    active && popup.type === "boss",
    popup,
    onSpawnChild,
    onUpdateTypeState,
  );
  useSineWaveSpawn(
    active && popup.type === "sine-wave",
    popup,
    canvasSize,
    onSpawnChild,
    onUpdateTypeState,
  );
  useSpeedTestWatch(
    active && popup.type === "speed-test",
    popup.id,
    popup.type === "speed-test" && popup.typeState.kind === "speed-test"
      ? popup.typeState.isLocked
      : false,
    closeHistory,
    onSpawnChild,
  );

  const handleCloseClick = useCallback(() => {
    if (
      popup.type === "corner-teleport" &&
      popup.typeState.kind === "corner-teleport"
    ) {
      const { clicksRemaining, cornerIndex } = popup.typeState;
      if (clicksRemaining > 1) {
        const nextIndex = ((cornerIndex + 1) % 4) as 0 | 1 | 2 | 3;
        onUpdateTypeState(popup.id, {
          kind: "corner-teleport",
          clicksRemaining: clicksRemaining - 1,
          cornerIndex: nextIndex,
        });
      } else {
        onClose(popup.id);
      }
    } else {
      onClose(popup.id);
    }
  }, [popup, onClose, onUpdateTypeState]);

  const position =
    popup.type === "corner-teleport" &&
    popup.typeState.kind === "corner-teleport"
      ? (() => {
          const cw = canvasSize.w;
          const ch = canvasSize.h;
          const w = popup.size.w;
          const h = popup.size.h;
          const corners = [
            { x: 8, y: 8 },
            { x: cw - w - 8, y: 8 },
            { x: cw - w - 8, y: ch - h - 8 },
            { x: 8, y: ch - h - 8 },
          ];
          return corners[popup.typeState.cornerIndex];
        })()
      : popup.typeState.kind === "random-walk"
        ? { x: popup.typeState.targetX, y: popup.typeState.targetY }
        : popup.position;

  const showCloseBtn =
    popup.type !== "hidden-close" &&
    popup.type !== "rules" &&
    popup.type !== "quiz";
  const canClose = popup.isCloseable;

  return (
    <div
      ref={onRegisterRef}
      className={classNames(styles.popup, styles[popup.type], {
        [styles.active]: isTop,
        [styles.shaking]: isShaking,
        [styles.warning]: popup.type === "warning",
      })}
      style={{
        left: position.x,
        top: position.y,
        width: popup.size.w,
        height:  "auto",
        zIndex,
        transition:
          popup.type === "random-walk"
            ? "left 0.35s ease, top 0.35s ease"
            : undefined,
      }}
    >
      <div className={styles.titleBar}>
        <span className={styles.windowTitle}>
          {popup.iconName && (
            <span className={styles.rainbowIcon}>
              <Icon name={popup.iconName as IconName} />
            </span>
          )}{" "}
          {popup.title}
        </span>
        {showCloseBtn && (
          <Button
            type="button"
            variant="icon"
            className={styles.closeBtn}
            onClick={handleCloseClick}
            disabled={!canClose}
            aria-label="關閉"
          >
            <Icon name="times" />
          </Button>
        )}
      </div>
      <div className={styles.content}>
        <PopupContent
          popup={popup}
          onClose={onClose}
          onUpdateTypeState={onUpdateTypeState}
        />
      </div>
    </div>
  );
};

export default PopupWindow;
