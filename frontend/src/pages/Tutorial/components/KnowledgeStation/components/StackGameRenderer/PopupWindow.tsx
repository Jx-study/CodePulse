import React, { useEffect, useRef, useCallback, useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import Icon from "@/shared/components/Icon";
import type { IconName } from "@/shared/lib/iconMap";
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
  ns?: string;
}

const H_BOUNCE_SPEED = 1; // px per 60fps frame
const TV_BOUNCE_SPEED = 1.2; // px per 60fps frame
const REFERENCE_FRAME_MS = 1000 / 60;
const noop = () => {};

function useBounce(
  active: boolean,
  popup: PopupInstance,
  canvasSize: { w: number; h: number },
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void,
  axis: "x" | "xy",
  speed: number,
) {
  const posRef = useRef({
    x: popup.position.x,
    y: popup.position.y,
    vx: speed,
    vy: speed,
  });
  const fixedYRef = useRef(popup.position.y);
  fixedYRef.current = popup.position.y;

  const { w: popupW, h: popupH } = popup.size;
  const { w: canvasW, h: canvasH } = canvasSize;

  useEffect(() => {
    if (!active) return;
    let { x, y, vx, vy } = posRef.current;
    let raf: number;
    let lastTime: number | null = null;

    const animate = (time: number) => {
      const dt = lastTime === null ? 1 : (time - lastTime) / REFERENCE_FRAME_MS;
      lastTime = time;

      x += vx * dt;
      if (x <= 0) {
        x = 0;
        vx = speed;
      } else if (x >= canvasW - popupW) {
        x = canvasW - popupW;
        vx = -speed;
      }

      if (axis === "xy") {
        y += vy * dt;
        if (y <= 0) {
          y = 0;
          vy = speed;
        } else if (y >= canvasH - popupH) {
          y = canvasH - popupH;
          vy = -speed;
        }
      } else {
        y = fixedYRef.current;
      }

      posRef.current = { x, y, vx, vy };
      onUpdatePosition(popup.id, { x, y });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [
    active,
    popup.id,
    popupW,
    popupH,
    canvasW,
    canvasH,
    onUpdatePosition,
    axis,
    speed,
  ]);
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
  tg: (key: string, opts?: Record<string, unknown>) => string,
) {
  const tgRef = useRef(tg);
  tgRef.current = tg;

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
    [1, 2, 3]
      .map((n) => ({
        def: {
          type: "minion" as const,
          title: tgRef.current("titles.minion", { n }),
          iconName: "screwdriver-wrench" as const,
          size: MINION_POPUP_SIZE,
        },
      }))
      .forEach((item, i) => {
        setTimeout(() => onSpawnChild(popup.id, [item]), i * 150);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, popup.id, popup.typeState.kind, onSpawnChild, onUpdateTypeState]);
}

function useSineWaveSpawn(
  active: boolean,
  popup: PopupInstance,
  canvasSize: { w: number; h: number },
  onSpawnChild: (parentId: string, items: SpawnChildItem[]) => void,
  onUpdateTypeState: (id: string, state: PopupTypeState) => void,
  tg: (key: string, opts?: Record<string, unknown>) => string,
) {
  const tgRef = useRef(tg);
  tgRef.current = tg;

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
        title: tgRef.current("titles.sineChild", { n: i + 1 }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  tg: (key: string, opts?: Record<string, unknown>) => string,
) {
  const timerSetRef = useRef(false);
  const onSpawnChildRef = useRef(onSpawnChild);
  onSpawnChildRef.current = onSpawnChild;
  const closeHistoryRef = useRef(closeHistory);
  closeHistoryRef.current = closeHistory;
  const tgRef = useRef(tg);
  tgRef.current = tg;

  useEffect(() => {
    if (!active || isLocked || timerSetRef.current) return;
    timerSetRef.current = true;

    const history = closeHistoryRef.current;
    const avg =
      history.length > 0
        ? history.reduce((a, b) => a + b, 0) / history.length
        : 10;

    const timer = setTimeout(
      () => {
        timerSetRef.current = false;
        Array.from({ length: 5 }, () => ({
          def: {
            type: "speed-test-child" as const,
            title: tgRef.current("titles.extraPopup"),
            iconName: "stopwatch" as const,
            size: NORMAL_POPUP_SIZE,
          },
        })).forEach((item, i) => {
          setTimeout(() => {
            onSpawnChildRef.current(popupId, [item]);
          }, i * 80);
        });
      },
      Math.max(avg, 80),
    );

    return () => clearTimeout(timer);
  }, [active, isLocked, popupId]);
}

function PopupContent({
  popup,
  onClose,
  onUpdateTypeState,
  tg,
}: {
  popup: PopupInstance;
  onClose: (id: string) => void;
  onUpdateTypeState: (id: string, state: PopupTypeState) => void;
  tg: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  switch (popup.type) {
    case "rules":
      return (
        <div className={styles.contentRules}>
          <p>{tg("popup.rules.desc1")}</p>
          <p>{tg("popup.rules.desc2")}</p>
          <Button
            type="button"
            variant="primary"
            className={styles.primaryBtn}
            onClick={() => onClose(popup.id)}
          >
            {tg("popup.rules.button")}
          </Button>
        </div>
      );
    case "hidden-close":
      return (
        <div className={styles.contentHidden}>
          <p>{tg("popup.hiddenClose.desc1")}</p>
          <p>
            {tg("popup.hiddenClose.desc2")}
            <Button
              type="button"
              variant="ghost"
              className={styles.inlineClose}
              onClick={() => onClose(popup.id)}
            >
              {tg("popup.hiddenClose.link")}
            </Button>
          </p>
        </div>
      );
    case "corner-teleport":
      return (
        <div className={styles.contentCorner}>
          <p>
            {tg("popup.cornerTeleport.clicks", {
              n:
                popup.typeState.kind === "corner-teleport"
                  ? popup.typeState.clicksRemaining
                  : 4,
            })}
          </p>
        </div>
      );
    case "boss":
      return (
        <div className={styles.contentBoss}>
          <p>{tg("popup.boss.desc")}</p>
          <p>
            {tg("popup.boss.remaining", {
              n:
                popup.typeState.kind === "boss"
                  ? popup.typeState.minionsRemaining
                  : 3,
            })}
          </p>
        </div>
      );
    case "sine-wave":
      return (
        <div className={styles.contentSine}>
          <p>{tg("popup.sineWave.desc")}</p>
        </div>
      );
    case "quiz": {
      const opts = [
        { key: "A", label: tg("popup.quiz.optA") },
        { key: "B", label: tg("popup.quiz.optB") },
        { key: "C", label: tg("popup.quiz.optC") },
        { key: "D", label: tg("popup.quiz.optD") },
      ];
      const correctKey = "B";
      return (
        <div className={styles.contentQuiz}>
          <p>{tg("popup.quiz.question")}</p>
          <div className={styles.radioGroup}>
            {opts.map(({ key, label }) => (
              <label key={key}>
                <input
                  type="radio"
                  name={`quiz-${popup.id}`}
                  value={key}
                  checked={quizAnswer === key}
                  onChange={() => setQuizAnswer(key)}
                />
                {label}
              </label>
            ))}
          </div>
          <Button
            type="button"
            variant="primary"
            className={styles.primaryBtn}
            onClick={() => {
              if (quizAnswer === correctKey) {
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
            {tg("popup.quiz.submit")}
          </Button>
        </div>
      );
    }
    case "speed-test":
      return (
        <div className={styles.contentSpeed}>
          <Button
            type="button"
            variant="ghost"
            className={styles.speedBtn}
            onClick={() => onClose(popup.id)}
          >
            {tg("popup.speedTest.button")}
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
          <p>{tg("popup.congrats.desc1")}</p>
          <p>{tg("popup.congrats.desc2")}</p>
        </div>
      );
    default:
      return (
        <div className={styles.contentNormal}>
          <p>{tg("popup.default.desc")}</p>
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
  ns,
}) => {
  const { t } = useTranslation(ns || "tutorial");
  const tg = (key: string, opts?: Record<string, unknown>) =>
    t(`game.stack.${key}`, { ns: ns || "tutorial", ...opts });

  const active = isTop && gameStatus === "playing";

  useBounce(
    active && popup.type === "bouncing-h",
    popup,
    canvasSize,
    onUpdatePosition ?? noop,
    "x",
    H_BOUNCE_SPEED,
  );
  useBounce(
    active && popup.type === "tv-bouncing",
    popup,
    canvasSize,
    onUpdatePosition ?? noop,
    "xy",
    TV_BOUNCE_SPEED,
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
    tg,
  );
  useSineWaveSpawn(
    active && popup.type === "sine-wave",
    popup,
    canvasSize,
    onSpawnChild,
    onUpdateTypeState,
    tg,
  );
  useSpeedTestWatch(
    active && popup.type === "speed-test",
    popup.id,
    popup.type === "speed-test" && popup.typeState.kind === "speed-test"
      ? popup.typeState.isLocked
      : false,
    closeHistory,
    onSpawnChild,
    tg,
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
        height: "auto",
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
            aria-label={tg("popup.closeAria")}
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
          tg={tg}
        />
      </div>
    </div>
  );
};

export default PopupWindow;
