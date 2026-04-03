import { useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { D3Canvas, D3CanvasRef } from "@/modules/core/Render/D3Canvas";
import { Node } from "@/modules/core/DataLogic/Node";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { LinkManager } from "@/modules/core/DataLogic/LinkManager";
import type { Link as GraphLink } from "@/modules/core/Render/D3Renderer";
import CodeEditor from "@/modules/core/components/CodeEditor/CodeEditor";
import styles from "./Playground.module.scss";

const DEFAULT_CODE: Record<string, string> = {
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
print("Sorted array is:", bubble_sort(arr))`,
  javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

const data = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted:", bubbleSort([...data]));`,
  typescript: `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

const data: number[] = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted:", bubbleSort([...data]));`,
};

type Language = "python" | "javascript" | "typescript";
const LANGUAGES: Language[] = ["python", "javascript", "typescript"];

function Playground() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [langOpen, setLangOpen] = useState(false);
  const [links] = useState<GraphLink[]>([]);
  const [isDirected] = useState(true);
  const canvasRef = useRef<D3CanvasRef>(null);

  const { elements } = useMemo(() => {
    const n = new Node();
    n.id = "n1";
    n.moveTo(150, 120);
    n.radius = 32;
    n.setStatus(Status.Target);

    const n2 = new Node();
    n2.id = "n2";
    n2.moveTo(350, 120);
    n2.radius = 32;
    n2.setStatus(Status.Target);

    const b = new Box();
    b.id = "b1";
    b.moveTo(250, 250);
    b.width = 60;
    b.height = 60;
    b.setStatus(Status.Prepare);

    const els = [n, n2, b];
    new LinkManager(els);
    return { elements: els };
  }, []);

  function handleLangSelect(lang: Language) {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
    setLangOpen(false);
  }

  const ext = language === "python" ? "py" : language === "javascript" ? "js" : "ts";

  return (
    <div className={styles.playground}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Link to="/explorer" className={styles.backBtn} aria-label="Back to Explorer">
            ←
          </Link>
          <div className={styles.divider} />
          <h1 className={styles.toolbarTitle}>Visual Playground</h1>
        </div>

        <div className={styles.toolbarRight}>
          {/* Language selector */}
          <div className={styles.langSelector}>
            <button
              className={styles.langBtn}
              onClick={() => setLangOpen((o) => !o)}
              aria-label="Select language"
            >
              {language.charAt(0).toUpperCase() + language.slice(1)}
              <span className={styles.chevron}>▾</span>
            </button>
            {langOpen && (
              <div className={styles.langDropdown}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    className={`${styles.langOption} ${lang === language ? styles.langOptionActive : ""}`}
                    onClick={() => handleLangSelect(lang)}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.divider} />

          <button className={styles.runBtn}>
            ▶ Run
          </button>
        </div>
      </div>

      {/* Main split */}
      <div className={styles.mainContent}>
        {/* Left: code editor */}
        <div className={styles.editorPanel}>
          <div className={styles.editorHeader}>
            <span className={styles.filename}>main.{ext}</span>
          </div>
          <div className={styles.editorBody}>
            <CodeEditor
              mode="single"
              language={language}
              value={code}
              onChange={setCode}
              theme="auto"
            />
          </div>
        </div>

        {/* Right: visualization */}
        <div className={styles.vizPanel}>
          <div className={styles.vizHeader}>
            <span className={styles.vizLabel}>Execution State</span>
          </div>
          <div className={styles.vizBody}>
            {/* Grid pattern */}
            <div className={styles.gridPattern} />
            <D3Canvas
              ref={canvasRef}
              elements={elements}
              links={links}
              width={600}
              height={600}
              isDirected={isDirected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playground;
