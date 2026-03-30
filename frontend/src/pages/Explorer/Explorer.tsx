import { useEffect, useRef } from "react";
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
    let running = true;

    function step() {
      if (!running) return;
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
        running = false;
        setTimeout(() => {
          qPct = 0; bPct = 0; mPct = 0;
          running = true;
        }, 1800);
      }
    }

    const id = setInterval(step, 60);
    return () => clearInterval(id);
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

function StackVisual() {
  const stackRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const stackItems = useRef<HTMLDivElement[]>([]);
  const stepRef = useRef(0);
  const pushingRef = useRef(true);

  useEffect(() => {
    // Pre-fill 2 blocks
    pushBlock(3);
    pushBlock(7);

    const id = setInterval(stackCycle, 1400);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushBlock(val: number) {
    const container = stackRef.current;
    if (!container) return;
    const el = document.createElement("div");
    el.className = styles.pgBlock;
    el.textContent = String(val);
    container.appendChild(el);
    stackItems.current.push(el);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add(styles.pgBlockVisible));
    });
  }

  function popBlock() {
    const el = stackItems.current.pop();
    if (!el) return;
    el.classList.add(styles.pgBlockExit);
    setTimeout(() => el.remove(), 380);
  }

  function highlightLine(lineNum: number) {
    if (!codeRef.current) return;
    const lines = codeRef.current.querySelectorAll<HTMLElement>("[data-line]");
    lines.forEach((l, i) => {
      l.style.background = i === lineNum ? "rgba(99,91,255,.14)" : "";
      l.style.borderRadius = i === lineNum ? "2px" : "";
    });
  }

  function stackCycle() {
    const items = stackItems.current;
    if (pushingRef.current && items.length < 5) {
      const val = STACK_VALUES[stepRef.current % STACK_VALUES.length];
      highlightLine(1);
      setTimeout(() => {
        pushBlock(val);
        stepRef.current++;
      }, 300);
      if (items.length >= 4) pushingRef.current = false;
    } else {
      pushingRef.current = false;
      highlightLine(4);
      setTimeout(() => {
        popBlock();
        if (items.length <= 1) pushingRef.current = true;
      }, 300);
    }
  }

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
        <pre ref={codeRef} className={styles.pgCode}>
          <span data-line="0"><span className={styles.kw}>def</span> <span className={styles.fn}>push</span>(stack, val):</span>{"\n"}
          <span data-line="1">{"  "}stack.<span className={styles.fn}>append</span>(val)</span>{"\n"}
          <span data-line="2">{"\n"}</span>
          <span data-line="3"><span className={styles.kw}>def</span> <span className={styles.fn}>pop</span>(stack):</span>{"\n"}
          <span data-line="4">{"  "}<span className={styles.kw}>return</span> stack.<span className={styles.fn}>pop</span>()</span>{"\n"}
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
        <div ref={stackRef} className={styles.pgStackBlocks} />
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
