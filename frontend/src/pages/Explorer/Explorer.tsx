import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Badge from "@/shared/components/Badge";
import Button from "@/shared/components/Button";
import styles from "./Explorer.module.scss";

// ── Card 1: Bar Race visual ──────────────────────────────────────────────────
function BarRaceVisual() {
  const quickRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const mergeRef = useRef<HTMLDivElement>(null);
  const qPctRef = useRef<HTMLSpanElement>(null);
  const bPctRef = useRef<HTMLSpanElement>(null);
  const mPctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let qPct = 0, bPct = 0, mPct = 0;
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
          qPct = 0; bPct = 0; mPct = 0;
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
            <span className={styles.raceDot} style={{ background: "#4f8ef7" }} />
            <span>Quick Sort</span>
            <span className={styles.raceComplexity}>O(n log n)</span>
          </div>
          <div className={styles.raceLane}>
            <div ref={quickRef} className={styles.raceBar} style={{ background: "linear-gradient(90deg, #4f8ef7, #7eb3ff)" }} />
            <span ref={qPctRef} className={styles.racePct}>0%</span>
          </div>
        </div>

        <div className={styles.raceTrack}>
          <div className={styles.raceLabel}>
            <span className={styles.raceDot} style={{ background: "#ff6b35" }} />
            <span>Bubble Sort</span>
            <span className={styles.raceComplexity}>O(n²)</span>
          </div>
          <div className={styles.raceLane}>
            <div ref={bubbleRef} className={styles.raceBar} style={{ background: "linear-gradient(90deg, #ff6b35, #ff9d6b)" }} />
            <span ref={bPctRef} className={styles.racePct}>0%</span>
          </div>
        </div>

        <div className={styles.raceTrack}>
          <div className={styles.raceLabel}>
            <span className={styles.raceDot} style={{ background: "#10b981" }} />
            <span>Merge Sort</span>
            <span className={styles.raceComplexity}>O(n log n)</span>
          </div>
          <div className={styles.raceLane}>
            <div ref={mergeRef} className={styles.raceBar} style={{ background: "linear-gradient(90deg, #10b981, #34d399)" }} />
            <span ref={mPctRef} className={styles.racePct}>0%</span>
          </div>
        </div>
      </div>
      <div className={styles.raceFinish} />
    </div>
  );
}

// ── Card 2: Stack push/pop visual ────────────────────────────────────────────
const STACK_VALUES = [3, 7, 1, 9, 4, 6, 2, 8];

type StackItem = { id: number; val: number; exiting: boolean };

function StackVisual() {
  const stackRef = useRef<StackItem[]>([
    { id: 0, val: 3, exiting: false },
    { id: 1, val: 7, exiting: false },
  ]);
  const [stack, setStack] = useState<StackItem[]>(stackRef.current);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const stepRef = useRef(2); // next STACK_VALUES index
  const idCounterRef = useRef(2); // next unique item id
  const pushingRef = useRef(true);
  const pending1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const current = stackRef.current;
      if (pushingRef.current && current.length < 5) {
        const val = STACK_VALUES[stepRef.current % STACK_VALUES.length];
        setHighlightedLine(1);
        if (current.length >= 4) pushingRef.current = false;
        pending1Ref.current = setTimeout(() => {
          const item: StackItem = { id: idCounterRef.current++, val, exiting: false };
          stackRef.current = [...stackRef.current, item];
          setStack(stackRef.current);
          stepRef.current++;
        }, 300);
      } else {
        pushingRef.current = false;
        setHighlightedLine(4);
        pending1Ref.current = setTimeout(() => {
          if (stackRef.current.length === 0) return;
          const topId = stackRef.current[stackRef.current.length - 1].id;
          if (stackRef.current.length <= 2) pushingRef.current = true;
          stackRef.current = stackRef.current.map((item, i) =>
            i === stackRef.current.length - 1 ? { ...item, exiting: true } : item
          );
          setStack(stackRef.current);
          pending2Ref.current = setTimeout(() => {
            stackRef.current = stackRef.current.filter(item => item.id !== topId);
            setStack(stackRef.current);
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

  return (
    <div className={styles.pgMockup}>
      {/* Code pane */}
      <div className={styles.pgInputPane}>
        <div className={styles.ideTitlebar}>
          <span className={`${styles.ideDot} ${styles.ideDotR}`} />
          <span className={`${styles.ideDot} ${styles.ideDotY}`} />
          <span className={`${styles.ideDot} ${styles.ideDotG}`} />
          <span className={styles.pgFilename}>stack.py</span>
        </div>
        <pre className={styles.pgCode}>
          <span data-line="0" style={highlightedLine === 0 ? { background: "rgba(99,91,255,.14)", borderRadius: "2px" } : undefined}><span className={styles.kw}>def</span> <span className={styles.fn}>push</span>(stack, val):</span>{"\n"}
          <span data-line="1" style={highlightedLine === 1 ? { background: "rgba(99,91,255,.14)", borderRadius: "2px" } : undefined}>{"  "}stack.<span className={styles.fn}>append</span>(val)</span>{"\n"}
          <span data-line="2">{"\n"}</span>
          <span data-line="3" style={highlightedLine === 3 ? { background: "rgba(99,91,255,.14)", borderRadius: "2px" } : undefined}><span className={styles.kw}>def</span> <span className={styles.fn}>pop</span>(stack):</span>{"\n"}
          <span data-line="4" style={highlightedLine === 4 ? { background: "rgba(99,91,255,.14)", borderRadius: "2px" } : undefined}>{"  "}<span className={styles.kw}>return</span> stack.<span className={styles.fn}>pop</span>()</span>{"\n"}
          <span data-line="5">{"\n"}</span>
          <span data-line="6">s = []</span>{"\n"}
          <span data-line="7">push(s, <span className={styles.nu}>3</span>)</span>
        </pre>
      </div>

      {/* Flow arrow */}
      <div className={styles.pgFlow}>
        <div className={styles.pgFlowArrow}>
          <div className={styles.pgPulse} />
          <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
            <path d="M0 6 H26 M22 1 L30 6 L22 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Stack pane */}
      <div className={styles.pgStackPane}>
        <span className={styles.pgStackLabel}>Stack</span>
        <div className={styles.pgStackBlocks}>
          {stack.map(item => (
            <div
              key={item.id}
              className={`${styles.pgBlock} ${styles.pgBlockVisible} ${item.exiting ? styles.pgBlockExit : ""}`}
            >
              {item.val}
            </div>
          ))}
        </div>
        <span className={styles.pgStackBase}>▔▔▔▔</span>
      </div>
    </div>
  );
}

// ── Explorer Hub ─────────────────────────────────────────────────────────────
function Explorer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles.explorer}>
      {/* Bg texture */}
      <div className={styles.bgTexture} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLabel}>
          <span className={styles.heroLabelDot} />
          {t("explorer")}
        </div>
        <h1 className={styles.heroTitle}>
          Algorithm<br />
          <span className={styles.heroTitleAccent}>Exploration</span> Hub
        </h1>
        <p className={styles.heroSub}>
          Central access point for algorithm exploration and visualization. Chart your course through the logic landscape.
        </p>
      </section>

      {/* Cards */}
      <div className={styles.cards}>
        {/* Card 1 — Algorithm Lab */}
        <div className={`${styles.card} ${styles.cardIn1}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>Module 01</p>
              <p className={styles.cardTitle}>Algorithm Lab</p>
              <p className={styles.cardDesc}>選擇演算法，直觀觀察執行過程與效率</p>
            </div>
            <Badge variant="success" size="sm" shape="pill">Active</Badge>
          </div>

          <div className={styles.cardVisual}>
            <BarRaceVisual />
          </div>

          <div className={styles.cardFooter}>
            <Button className={styles.btnEnter} onClick={() => navigate("/explorer/lab")}>
              Enter Lab →
            </Button>
            <div className={styles.statPills}>
              <Badge variant="secondary" size="xs" shape="pill">Sort</Badge>
              <Badge variant="secondary" size="xs" shape="pill">Search</Badge>
              <Badge variant="secondary" size="xs" shape="pill">Graph</Badge>
            </div>
          </div>
        </div>

        {/* Card 2 — Visualization Playground */}
        <div className={`${styles.card} ${styles.cardGlass} ${styles.cardIn2}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>Module 02</p>
              <p className={styles.cardTitle}>Visualization Playground</p>
              <p className={styles.cardDesc}>提交 Python 程式碼，自動分析並產生視覺化動畫</p>
            </div>
          </div>

          <div className={styles.cardVisual}>
            <StackVisual />
          </div>

          <div className={styles.cardFooter}>
            <Button className={styles.btnEnter} onClick={() => navigate("/explorer/playground")}>
              Enter Playground →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explorer;
