import { useCallback, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Explorer.module.scss";
import { D3Canvas, D3CanvasRef } from "@/modules/core/Render/D3Canvas";
import { Node } from "@/modules/core/DataLogic/Node";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { LinkManager } from "@/modules/core/DataLogic/LinkManager";
import type { Link } from "@/modules/core/Render/D3Renderer";
import { animateConnect } from "@/modules/core/Render/D3Renderer";
import CodeEditor from "@/modules/core/components/CodeEditor/CodeEditor";
import Button from "@/shared/components/Button";

// 預設程式碼範例
const DEFAULT_CODE: Record<string, string> = {
  python: `# CodePulse - 資料結構與演算法視覺化
# 在此撰寫您的程式碼

def bubble_sort(arr):
    """氣泡排序演算法"""
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# 測試範例
data = [64, 34, 25, 12, 22, 11, 90]
print("排序前:", data)
result = bubble_sort(data.copy())
print("排序後:", result)
`,
  javascript: `// CodePulse - 資料結構與演算法視覺化
// 在此撰寫您的程式碼

function bubbleSort(arr) {
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

// 測試範例
const data = [64, 34, 25, 12, 22, 11, 90];
console.log("排序前:", data);
const result = bubbleSort([...data]);
console.log("排序後:", result);
`,
  typescript: `// CodePulse - 資料結構與演算法視覺化
// 在此撰寫您的程式碼

function bubbleSort(arr: number[]): number[] {
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

// 測試範例
const data: number[] = [64, 34, 25, 12, 22, 11, 90];
console.log("排序前:", data);
const result = bubbleSort([...data]);
console.log("排序後:", result);
`,
};

function parseOptionalWeight(raw: string): number | string | undefined {
  const t = raw.trim();
  if (t === "") return undefined;
  const n = Number(t);
  if (!Number.isNaN(n)) return n;
  return t;
}

function Explorer() {
  const { t } = useTranslation();
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [links, setLinks] = useState<Link[]>([]);
  const [linkSourceId, setLinkSourceId] = useState("n1");
  const [linkTargetId, setLinkTargetId] = useState("n2");
  const [linkWeightInput, setLinkWeightInput] = useState("");
  const [isDirected, setIsDirected] = useState(true);
  const canvasRef = useRef<D3CanvasRef>(null);

  // 建立測試資料
  const { elements, manager } = useMemo(() => {
    const n = new Node();
    n.id = "n1";
    n.moveTo(150, 120);
    n.radius = 32;
    n.setStatus(Status.Target);
    n.description = "我是圓形1";

    const n2 = new Node();
    n2.id = "n2";
    n2.moveTo(350, 120);
    n2.radius = 32;
    n2.setStatus(Status.Target);
    n2.description = "我是圓形2";

    const b = new Box();
    b.id = "b1";
    b.moveTo(250, 250);
    b.width = 60;
    b.height = 60;
    b.setStatus(Status.Prepare);
    b.description = "我是矩形";

    const els = [n, n2, b];
    const mgr = new LinkManager(els);
    return { elements: els, manager: mgr };
  }, []);

  const applyWeightToLinks = useCallback(
    (key: string, weight: number | string) => {
      const next = [...manager.links];
      const idx = next.findIndex((l) => l.key === key);
      if (idx < 0) return;
      next[idx] = { ...next[idx], weight };
      setLinks(next);
    },
    [manager],
  );

  const triggerLink = useCallback(async () => {
    const svgEl = canvasRef.current?.getSVGElement();
    if (!svgEl) return;

    const src = linkSourceId.trim();
    const tgt = linkTargetId.trim();
    await animateConnect(svgEl, elements, manager, src, tgt, 800);
    const w = parseOptionalWeight(linkWeightInput);
    const key = `${src}->${tgt}`;
    if (w !== undefined) {
      applyWeightToLinks(key, w);
    } else {
      setLinks([...manager.links]);
    }
  }, [elements, manager, linkSourceId, linkTargetId, linkWeightInput, applyWeightToLinks]);

  /** 不經動畫，直接加入連線（可附權重，供 D3Renderer 路徑／標籤測試） */
  const addLinkInstant = useCallback(() => {
    const src = linkSourceId.trim();
    const tgt = linkTargetId.trim();
    const w = parseOptionalWeight(linkWeightInput);
    const key = `${src}->${tgt}`;
    manager.connect(src, tgt);
    if (w !== undefined) {
      applyWeightToLinks(key, w);
    } else {
      setLinks([...manager.links]);
    }
  }, [manager, linkSourceId, linkTargetId, linkWeightInput, applyWeightToLinks]);

  /** 有向雙向、無權重：模擬 DLL 的 prev／next，驗證雙箭頭分離 */
  const addBidirectionalNoWeight = useCallback(() => {
    manager.clear();
    manager.connect("n1", "n2");
    manager.connect("n2", "n1");
    setLinks([...manager.links]);
  }, [manager]);

  /** 有向雙向、有權重：驗證分離 + 權重標籤各在兩側 */
  const addBidirectionalWithWeight = useCallback(() => {
    manager.clear();
    manager.connect("n1", "n2");
    manager.connect("n2", "n1");
    let next = [...manager.links];
    const k1 = "n1->n2";
    const k2 = "n2->n1";
    next = next.map((l) => {
      if (l.key === k1) return { ...l, weight: 1 };
      if (l.key === k2) return { ...l, weight: 2 };
      return l;
    });
    setLinks(next);
  }, [manager]);

  const clearLink = useCallback(() => {
    manager.clear();
    setLinks([]);
  }, [manager]);

  return (
    <div className={styles.explorer}>
      <div className="container">
        <h1 className="section-title">{t("explorer")}</h1>

        {/* 主要內容區域：左右分屏 */}
        <div className={styles.mainContent}>
          {/* 左側：程式碼編輯器 */}
          <div className={styles.editorPanel}>
            <h3 className={styles.panelTitle}>程式碼編輯器</h3>
            <CodeEditor
              mode="single"
              language="python"
              value={code}
              onChange={setCode}
              theme="auto"
            />
          </div>

          {/* 右側：視覺化畫布 */}
          <div className={styles.canvasPanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>視覺化區域</h3>
              <div className={styles.controls}>
                <Button size="sm" onClick={triggerLink}>
                  連線動畫
                </Button>
                <Button size="sm" onClick={addLinkInstant}>
                  立即連線
                </Button>
                <Button size="sm" variant="secondary" onClick={clearLink}>
                  清除連線
                </Button>
              </div>
            </div>
            <div className={styles.linkTestBar}>
              <span>節點 ID：n1、n2、b1</span>
              <label>
                起點
                <input
                  type="text"
                  value={linkSourceId}
                  onChange={(e) => setLinkSourceId(e.target.value)}
                  placeholder="n1"
                  aria-label="連線起點節點 ID"
                />
              </label>
              <label>
                終點
                <input
                  type="text"
                  value={linkTargetId}
                  onChange={(e) => setLinkTargetId(e.target.value)}
                  placeholder="n2"
                  aria-label="連線終點節點 ID"
                />
              </label>
              <label>
                權重（選填）
                <input
                  type="text"
                  value={linkWeightInput}
                  onChange={(e) => setLinkWeightInput(e.target.value)}
                  placeholder="例：3"
                  aria-label="連線權重（選填）"
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={isDirected}
                  onChange={(e) => setIsDirected(e.target.checked)}
                />
                有向圖
              </label>
              <Button size="sm" variant="secondary" onClick={addBidirectionalNoWeight}>
                雙向無權重（DLL）
              </Button>
              <Button size="sm" variant="secondary" onClick={addBidirectionalWithWeight}>
                雙向有權重
              </Button>
            </div>
            <div className={styles.canvasContainer}>
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
    </div>
  );
}

export default Explorer;
