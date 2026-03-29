import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Demo.module.scss';
import { createBubbleSortAnimationSteps } from '@/data/algorithms/sorting/bubbleSort';
import type { AnimationStep } from '@/types';
import { D3Canvas } from '@/modules/core/Render/D3Canvas';
import type { StatusColorMap } from '@/types/statusConfig';

const PYTHON_CODE = `def bubble_sort(collection):
    total_items = len(collection)

    for round in range(total_items - 1):
        has_swapped = False
        unsorted_range = total_items - 1 - round

        for index in range(unsorted_range):
            if collection[index] > collection[index + 1]:
                collection[index], collection[index + 1] = collection[index + 1], collection[index]
                has_swapped = True

        if not has_swapped:
            break

    return collection`;

const CODE_LINES = PYTHON_CODE.split('\n');

// Maps actionTag → highlighted line numbers (1-based, matches PYTHON_CODE)
const TAG_TO_LINES: Record<string, number[]> = {
  INIT:        [2],
  ROUND_START: [4, 5, 6],
  GET_VALUES:  [8, 9],
  COMPARE:     [10],
  SWAP:        [10, 11],
  ROUND_END:   [13, 14],
  DONE:        [16],
};

const INITIAL_ARRAY = [31, 9, 15, 1, 8, 5, 4, 10, 24, 23];

// StatusColorMap = Record<string, string> — 狀態鍵值 → 顏色 hex
// prepare = 比較中（teal），target = 交換中（blue），complete = 已排序（green）
const DEMO_STATUS_COLOR_MAP: StatusColorMap = {
  unfinished: '#3f3f4e',
  prepare:    '#2dd4bf',  // teal — 比較中
  target:     '#3b82f6',  // blue — 交換中
  complete:   '#10b981',  // green — 已排序
  inactive:   '#2a2a35',
};

function Demo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initialData = INITIAL_ARRAY.map((v, i) => ({ id: `box-${i}`, value: v }));
    setSteps(createBubbleSortAnimationSteps(initialData));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsPlaying(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const id = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= steps.length - 1) {
          setTimeout(() => setCurrentIndex(0), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 500);
    return () => clearInterval(id);
  }, [isPlaying, steps.length]);

  const currentStep: AnimationStep | undefined = steps[currentIndex];
  const highlightedLines = currentStep
    ? (TAG_TO_LINES[currentStep.actionTag ?? ''] ?? [])
    : [];
  const description = currentStep?.description ?? '準備開始...';

  // useMemo 防止每次 render 都重建陣列，
  // 避免 D3Canvas 在每次步驟推進時重算 viewBox。
  const allStepsElements = useMemo(() => steps.map(s => s.elements), [steps]);

  return (
    <section className={styles.demo} id="demo" ref={containerRef}>
      <div className='container'>
        <div className={styles.demoPreview}>

          {/* Mac-style code window */}
          <div className={styles.macWindow}>
            <div className={styles.macChrome}>
              <div className={styles.trafficLights}>
                <span className={styles.tlRed} />
                <span className={styles.tlYellow} />
                <span className={styles.tlGreen} />
              </div>
              <span className={styles.windowTitle}>bubble_sort.py</span>
            </div>
            <div className={styles.codeBody}>
              {CODE_LINES.map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = highlightedLines.includes(lineNum);
                return (
                  <div
                    key={idx}
                    className={`${styles.codeLine}${isHighlighted ? ` ${styles.highlighted}` : ''}`}
                  >
                    <span className={styles.lineNumber}>
                      {isHighlighted ? '▶' : lineNum}
                    </span>
                    <span className={styles.lineText}>{line || ' '}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bar chart visualization */}
          {steps.length > 0 && currentStep && (
            <div className={styles.visualizationArea}>
              <D3Canvas
                elements={currentStep.elements}
                links={[]}
                structureType="sorting"
                enableZoom={false}
                enablePan={false}
                statusColorMap={DEMO_STATUS_COLOR_MAP}
                allStepsElements={allStepsElements}
              />
            </div>
          )}

          {/* Analysis box */}
          <div className={styles.analysisBox}>
            <strong>💡 分析：</strong>{description}
          </div>

        </div>
      </div>
    </section>
  );
}

export default Demo;
