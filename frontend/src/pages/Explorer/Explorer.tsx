import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Explorer.module.scss";
import { D3Canvas } from "@/modules/core/Render/D3Canvas";
import { Node } from "@/modules/core/DataLogic/Node";
import { Box } from "@/modules/core/DataLogic/Box";
import CodeEditor from "@/modules/core/components/CodeEditor/CodeEditor";

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

function Explorer() {
  const { t } = useTranslation();
  const [code, setCode] = useState(DEFAULT_CODE.python);

  // Test data for D3Canvas
  const n = new Node();
  n.id = "n1";
  n.moveTo(150, 120);
  n.radius = 32;
  n.setStatus("target");
  n.description = "我是圓形";

  const n2 = new Node();
  n2.id = "n2";
  n2.moveTo(300, 140);
  n2.radius = 32;
  n2.setStatus("target");
  n2.description = "我是圓形2";

  const b = new Box();
  b.id = "b1";
  b.moveTo(360, 220);
  b.width = 50;
  b.height = 50;
  b.setStatus("prepare");
  b.description = "我是矩形";

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
              highlightedLine={4}
            />
          </div>

          {/* 右側：視覺化畫布 */}
          <div className={styles.canvasPanel}>
            <h3 className={styles.panelTitle}>視覺化區域</h3>
            <div className={styles.canvasContainer}>
              <D3Canvas elements={[n, n2, b]} width={600} height={600} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explorer;
