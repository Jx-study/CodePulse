import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Badge from "@/shared/components/Badge";
import Button from "@/shared/components/Button";
import CodeBlock from "@/shared/components/CodeBlock";
import Icon from "@/shared/components/Icon";
import styles from "./Explorer.module.scss";

// ── Card 1: Bar Race visual ──────────────────────────────────────────────────
function BarRaceVisual() {
  const { t } = useTranslation("explorer");
  const quickRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mergeRef = useRef<HTMLDivElement>(null);
  const qPctRef = useRef<HTMLSpanElement>(null);
  const bPctRef = useRef<HTMLSpanElement>(null);
  const mPctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let qPct = 0,
      bPct = 0,
      mPct = 0;
    const runningRef = { current: true };
    let resetId: ReturnType<typeof setTimeout> | null = null;

    function step() {
      if (!runningRef.current) return;
      qPct = Math.min(100, qPct + (2.8 + Math.random() * 0.8));
      mPct = Math.min(100, mPct + (2.5 + Math.random() * 0.9));
      bPct = Math.min(100, bPct + (0.7 + Math.random() * 0.4));

      if (quickRef.current) quickRef.current.style.width = qPct + "%";
      if (mergeRef.current) mergeRef.current.style.width = mPct + "%";
      if (bubbleRef.current) bubbleRef.current.style.width = bPct + "%";
      if (qPctRef.current) qPctRef.current.textContent = Math.round(qPct) + "%";
      if (mPctRef.current) mPctRef.current.textContent = Math.round(mPct) + "%";
      if (bPctRef.current) bPctRef.current.textContent = Math.round(bPct) + "%";

      if (qPct >= 100 && mPct >= 100 && bPct >= 100) {
        runningRef.current = false;
        resetId = setTimeout(() => {
          qPct = 0;
          bPct = 0;
          mPct = 0;
          runningRef.current = true;
        }, 1800);
      }
    }

    const id = setInterval(step, 60);
    return () => {
      clearInterval(id);
      if (resetId !== null) clearTimeout(resetId);
    };
  }, []);

  return (
    <div className={styles.raceVisual}>
      <div className={styles.raceTrackWrap}>
        <div className={styles.raceTrack}>
          <div className={styles.raceLabel}>
            <span
              className={styles.raceDot}
              style={{ background: "#4f8ef7" }}
            />
            <span>{t("race.quickSort")}</span>
            <span className={styles.raceComplexity}>O(n log n)</span>
          </div>
          <div className={styles.raceLane}>
            <div
              ref={quickRef}
              className={styles.raceBar}
              style={{ background: "linear-gradient(90deg, #4f8ef7, #7eb3ff)" }}
            />
            <span ref={qPctRef} className={styles.racePct}>
              0%
            </span>
          </div>
        </div>

        <div className={styles.raceTrack}>
          <div className={styles.raceLabel}>
            <span
              className={styles.raceDot}
              style={{ background: "#ff6b35" }}
            />
            <span>{t("race.bubbleSort")}</span>
            <span className={styles.raceComplexity}>O(n²)</span>
          </div>
          <div className={styles.raceLane}>
            <div
              ref={bubbleRef}
              className={styles.raceBar}
              style={{ background: "linear-gradient(90deg, #ff6b35, #ff9d6b)" }}
            />
            <span ref={bPctRef} className={styles.racePct}>
              0%
            </span>
          </div>
        </div>

        <div className={styles.raceTrack}>
          <div className={styles.raceLabel}>
            <span
              className={styles.raceDot}
              style={{ background: "#10b981" }}
            />
            <span>{t("race.mergeSort")}</span>
            <span className={styles.raceComplexity}>O(n log n)</span>
          </div>
          <div className={styles.raceLane}>
            <div
              ref={mergeRef}
              className={styles.raceBar}
              style={{ background: "linear-gradient(90deg, #10b981, #34d399)" }}
            />
            <span ref={mPctRef} className={styles.racePct}>
              0%
            </span>
          </div>
        </div>
      </div>
      <div className={styles.raceFinish} />
    </div>
  );
}

// ── Card 2: Stack push/pop visual ────────────────────────────────────────────
const STACK_CAPACITY = 5;

// one cycle: push 3 times then pop 3 times — highlight loops back each cycle
type CallEntry = { type: "push"; val: number } | { type: "pop" };
const STACK_CALL_SEQUENCE: CallEntry[] = [
  { type: "push", val: 1 },
  { type: "push", val: 9 },
  { type: "push", val: 4 },
  { type: "pop" },
  { type: "pop" },
  { type: "pop" },
];

const STACK_CODE_LINES = [
  "def push(stack, val):",
  "    stack.append(val)",
  "",
  "def pop(stack):",
  "    return stack.pop()",
  "",
  "s = [3, 7]",
  ...STACK_CALL_SEQUENCE.map(c => c.type === "push" ? `push(s, ${c.val})` : "pop(s)"),
];

type StackItem = { id: number; val: number; exiting: boolean };

function StackVisual() {
  const { t } = useTranslation("explorer");
  const stackRef = useRef<StackItem[]>([
    { id: 0, val: 3, exiting: false },
    { id: 1, val: 7, exiting: false },
  ]);
  const [stack, setStack] = useState<StackItem[]>(stackRef.current);
  const [action, setAction] = useState<"push" | "pop" | null>(null);
  const [callLineIndex, setCallLineIndex] = useState(0);
  const callSeqRef = useRef(0);
  const idCounterRef = useRef(2);
  const pushingRef = useRef(true);
  const pending1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const current = stackRef.current;
      if (pushingRef.current && current.length < STACK_CAPACITY) {
        const seqEntry = STACK_CALL_SEQUENCE[callSeqRef.current];
        const val = seqEntry.type === "push" ? seqEntry.val : 0;
        setAction("push");
        setCallLineIndex(callSeqRef.current);
        callSeqRef.current = (callSeqRef.current + 1) % STACK_CALL_SEQUENCE.length;
        if (current.length >= STACK_CAPACITY - 1) pushingRef.current = false;
        pending1Ref.current = setTimeout(() => {
          const item: StackItem = {
            id: idCounterRef.current++,
            val,
            exiting: false,
          };
          stackRef.current = [...stackRef.current, item];
          setStack(stackRef.current);
        }, 300);
      } else {
        pushingRef.current = false;
        setAction("pop");
        setCallLineIndex(callSeqRef.current);
        callSeqRef.current = (callSeqRef.current + 1) % STACK_CALL_SEQUENCE.length;
        pending1Ref.current = setTimeout(() => {
          if (stackRef.current.length === 0) return;
          const topId = stackRef.current[stackRef.current.length - 1].id;
          stackRef.current = stackRef.current.map((item, i) =>
            i === stackRef.current.length - 1
              ? { ...item, exiting: true }
              : item,
          );
          setStack(stackRef.current);
          pending2Ref.current = setTimeout(() => {
            stackRef.current = stackRef.current.filter(
              (item) => item.id !== topId,
            );
            setStack(stackRef.current);
            if (stackRef.current.length <= 2) pushingRef.current = true;
          }, 380);
        }, 300);
      }
    }, 1400);

    return () => {
      clearInterval(intervalId);
      if (pending1Ref.current !== null) clearTimeout(pending1Ref.current);
      if (pending2Ref.current !== null) clearTimeout(pending2Ref.current);
    };
  }, []);

  const topVal = stack.length > 0 ? stack[stack.length - 1].val : "—";
  const emptySlots = STACK_CAPACITY - stack.length;

  return (
    <div className={styles.pgMockup}>
      {/* Code pane */}
      <div className={styles.pgInputPane}>
        <CodeBlock
          filename="stack.py"
          lines={STACK_CODE_LINES}
          highlightedLines={action !== null ? [
            ...(action === "push" ? [1, 2] : [4, 5]),
            8 + callLineIndex,
          ] : []}
          className={styles.pgCodeBlock}
        />
        <div className={styles.pgTracePanel}>
          <span className={styles.pgTraceKeyword}>{t("stack.traceKeyword")}</span>
          <span className={styles.pgTraceText}>
            {t("stack.traceTop")} = {topVal}, {t("stack.traceSize")} = {stack.length}
          </span>
        </div>
      </div>

      {/* Stack pane */}
      <div className={styles.pgStackPane}>
        <span className={styles.pgStackLabel}>STACK ↑</span>
        <div className={styles.pgStackBlocks}>
          {stack.map((item, idx) => {
            const isTop = idx === stack.length - 1;
            return (
              <div
                key={item.id}
                className={`${styles.pgBlock} ${styles.pgBlockVisible} ${item.exiting ? styles.pgBlockExit : ""} ${isTop ? styles.pgBlockTop : ""}`}
              >
                {item.val}
              </div>
            );
          })}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.pgBlockEmpty}>
              —
            </div>
          ))}
        </div>
        <span className={styles.pgStackBase}>BASE</span>
      </div>
    </div>
  );
}

// ── Explorer Hub ─────────────────────────────────────────────────────────────
function Explorer() {
  const { t } = useTranslation("explorer");
  const navigate = useNavigate();

  return (
    <div className={styles.explorer}>
      {/* Bg texture */}
      <div className={styles.bgTexture} />

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {t("hero.title")}
          <br />
          <span className={styles.heroTitleAccent}>
            {t("hero.titleAccent")}
          </span>{" "}
          {t("hero.titleSuffix")}
        </h1>
        <p className={styles.heroSub}>{t("hero.sub")}</p>
      </section>

      {/* Cards */}
      <div className={styles.cards}>
        {/* Card 1 — Algorithm Lab */}
        <div className={`${styles.card} ${styles.cardIn1}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>{t("card1.eyebrow")}</p>
              <p className={styles.cardTitle}>{t("card1.title")}</p>
              <p className={styles.cardDesc}>{t("card1.desc")}</p>
            </div>
            <Badge variant="success" size="sm" shape="pill">
              {t("badge.active")}
            </Badge>
          </div>

          <div className={styles.cardVisual}>
            <BarRaceVisual />
          </div>

          <div className={styles.cardFooter}>
            <Button
              className={styles.btnEnter}
              onClick={() => navigate("/explorer/lab")}
              iconRight={<Icon name="arrow-right" />}
            >
              {t("card1.enter")}
            </Button>
            <div className={styles.statPills}>
              <Badge variant="secondary" size="xs" shape="pill">
                {t("card1.badgeSort")}
              </Badge>
              <Badge variant="secondary" size="xs" shape="pill">
                {t("card1.badgeSearch")}
              </Badge>
              <Badge variant="secondary" size="xs" shape="pill">
                {t("card1.badgeGraph")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Card 2 — Visualization Playground */}
        <div className={`${styles.card} ${styles.cardIn2}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>{t("card2.eyebrow")}</p>
              <p className={styles.cardTitle}>{t("card2.title")}</p>
              <p className={styles.cardDesc}>{t("card2.desc")}</p>
            </div>
            <Badge variant="success" size="sm" shape="pill">
              {t("badge.active")}
            </Badge>
          </div>

          <div className={styles.cardVisual}>
            <div className={styles.bpDiagramPanel}>
              <span className={styles.bpDiagramLabel}>
                {t("card2.schematic")}
              </span>
              <StackVisual />
            </div>
          </div>

          <div className={styles.cardFooter}>
            <Button
              className={styles.btnEnter}
              onClick={() => navigate("/explorer/playground")}
              iconRight={<Icon name="arrow-right" />}
            >
              {t("card2.enter")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explorer;
