import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { iconMap } from "@/shared/lib/iconMap";
import type { PopupInstance } from "@/types/games/stackGameTypes";
import styles from "./StackVisualizer.module.scss";

const SLIDE_OUT_MS = 150;

interface Props {
  stack: string[];
  popups: Map<string, PopupInstance>;
}

const StackVisualizer: React.FC<Props> = ({ stack, popups }) => {
  const [visibleIds, setVisibleIds] = useState<string[]>(() =>
    [...stack].reverse(),
  );
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const prevStackRef = useRef<string[]>(stack);
  const titleCacheRef = useRef<Map<string, string>>(new Map());
  const iconCacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    popups.forEach((popup, id) => {
      titleCacheRef.current.set(id, popup.title);
      iconCacheRef.current.set(id, popup.iconName);
    });
  }, [popups]);

  useEffect(() => {
    const prev = prevStackRef.current;
    prevStackRef.current = stack;

    const popped = prev.filter((id) => !stack.includes(id));
    if (popped.length === 0) {
      setVisibleIds((current) => {
        const stillExiting = current.filter((id) => !stack.includes(id));
        return [...stillExiting, ...[...stack].reverse()];
      });
      return;
    }

    setExitingIds((s) => new Set([...s, ...popped]));

    const timer = setTimeout(() => {
      setExitingIds((s) => {
        const next = new Set(s);
        popped.forEach((id) => next.delete(id));
        return next;
      });
      setVisibleIds([...stack].reverse());
    }, SLIDE_OUT_MS);

    return () => clearTimeout(timer);
  }, [stack]);

  const totalCount = visibleIds.length;

  return (
    <div className={styles.visualizer}>
      <div className={styles.header}><FontAwesomeIcon icon={iconMap["layer-group"]} /> Stack 堆疊</div>
      <div className={styles.uContainer}>
        <div className={styles.topLabel}><FontAwesomeIcon icon={iconMap["arrow-left"]} /> TOP</div>
        <div className={styles.stackScrollArea}>
          {visibleIds.map((id, idx) => (
            <div
              key={id}
              className={classNames(styles.stackItem, {
                [styles.topItem]: idx === 0 && !exitingIds.has(id),
                [styles.exiting]: exitingIds.has(id),
              })}
            >
              <span className={styles.stackIndex}>{totalCount - idx}</span>
              <span className={styles.stackTitle}>
                {(() => {
                  const iconName = iconCacheRef.current.get(id);
                  return iconName && iconName in iconMap ? (
                    <FontAwesomeIcon icon={iconMap[iconName as keyof typeof iconMap]} />
                  ) : null;
                })()}
                {titleCacheRef.current.get(id) ?? id}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.bottomBar}>BOTTOM</div>
      </div>
    </div>
  );
};

export default StackVisualizer;
