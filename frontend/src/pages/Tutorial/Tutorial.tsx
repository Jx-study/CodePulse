import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, Button } from '../../shared/components';
import CodeEditor from '../../modules/core/components/CodeEditor/CodeEditor';
import { D3Canvas } from '../../modules/core/Render/D3Canvas';
import { Box } from '../../modules/core/DataLogic/Box';
import { BaseElement } from '../../modules/core/DataLogic/BaseElement';
import ControlBar from '../../modules/core/components/ControlBar/ControlBar';
import { BreadcrumbItem } from '../../types';
import styles from './Tutorial.module.scss';

// 動畫步驟資料結構
interface AnimationStep {
  stepNumber: number;
  description: string;
  elements: BaseElement[];
}

// Mock 動畫步驟資料
function createMockAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const values = [5, 2, 8, 1, 9];

  // Helper: 創建 box 元素
  const createBoxes = (statusMap: { [id: string]: any }) => {
    return values.map((value, i) => {
      const box = new Box();
      box.id = `box-${i}`;
      box.moveTo(150 + i * 80, 200);
      box.width = 60;
      box.height = 60;
      box.value = value;
      box.description = `${value}`;
      box.setStatus(statusMap[box.id] || 'unfinished');
      return box;
    });
  };

  // Step 1: 初始狀態
  steps.push({
    stepNumber: 1,
    description: '初始陣列',
    elements: createBoxes({}),
  });

  // Step 2: 選擇 pivot
  steps.push({
    stepNumber: 2,
    description: '選擇 pivot = 9',
    elements: createBoxes({ 'box-4': 'target' }),
  });

  // Step 3: 開始分割
  steps.push({
    stepNumber: 3,
    description: '比較元素與 pivot',
    elements: createBoxes({ 'box-4': 'target', 'box-0': 'prepare' }),
  });

  // Step 4: 繼續比較
  steps.push({
    stepNumber: 4,
    description: '5 < 9，繼續',
    elements: createBoxes({
      'box-4': 'target',
      'box-0': 'complete',
      'box-1': 'prepare',
    }),
  });

  // Step 5: 完成分割
  steps.push({
    stepNumber: 5,
    description: '分割完成',
    elements: createBoxes({
      'box-0': 'complete',
      'box-1': 'complete',
      'box-2': 'complete',
      'box-3': 'complete',
      'box-4': 'target',
    }),
  });

  return steps;
}

function Tutorial() {
  const { t } = useTranslation();
  const { category, algorithm } = useParams();
  const navigate = useNavigate();

  // 載入 mock 動畫資料
  const animationSteps = createMockAnimationSteps();

  // State 管理
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Mock data
  const algorithmData = {
    name: '快速排序',
    category: '排序演算法',
    pseudoCode: `function quickSort(arr, left, right):
    if left < right:
        pivotIndex = partition(arr, left, right)
        quickSort(arr, left, pivotIndex - 1)
        quickSort(arr, pivotIndex + 1, right)

function partition(arr, left, right):
    pivot = arr[right]
    i = left - 1
    for j = left to right - 1:
        if arr[j] <= pivot:
            i = i + 1
            swap arr[i] and arr[j]
    swap arr[i + 1] and arr[right]
    return i + 1`,
  };

  // 生成面包屑数据
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: algorithmData.category,
      path: `/dashboard?category=${category}`,
    },
    {
      label: algorithmData.name,
      path: null, // 当前页面，不可点击
    },
  ];

  // 動畫播放邏輯
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep >= animationSteps.length - 1) {
          setIsPlaying(false);
          return prevStep;
        }
        return prevStep + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, animationSteps.length]);

  // 控制邏輯
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, animationSteps.length - 1));
  };
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  // 獲取當前步驟資料
  const currentStepData = animationSteps[currentStep];

  // Debug logging
  useEffect(() => {
    console.log('Tutorial Debug:', {
      currentStep,
      totalSteps: animationSteps.length,
      isPlaying,
      playbackSpeed,
      currentStepData: {
        stepNumber: currentStepData?.stepNumber,
        description: currentStepData?.description,
        elementsCount: currentStepData?.elements?.length,
      },
    });
  }, [currentStep, currentStepData, isPlaying, playbackSpeed, animationSteps.length]);

  return (
    <div className={styles.tutorialPage}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} showBackButton={true} />
      </div>

      {/* Main Content - Top Section */}
      <div className={styles.topSection}>
        {/* Pseudo Code Section */}
        <div className={styles.pseudoCodeSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Pseudo Code</h3>
          </div>
          <div className={styles.pseudoCodeEditor}>
            <CodeEditor
              mode="single"
              language="python"
              value={algorithmData.pseudoCode}
              readOnly={true}
              theme="auto"
            />
          </div>
        </div>

        {/* Right Panel - Canvas & Control Bar */}
        <div className={styles.rightPanel}>
          <div className={styles.visualizationSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>視覺化動畫</h3>
            </div>
            <div className={styles.visualizationArea}>
              <D3Canvas
                elements={currentStepData?.elements || []}
                width={600}
                height={400}
              />
            </div>
            <div className={styles.stepDescription}>
              {currentStepData?.description}
            </div>
          </div>

          <ControlBar
            isPlaying={isPlaying}
            currentStep={currentStep}
            totalSteps={animationSteps.length}
            playbackSpeed={playbackSpeed}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handleNext}
            onPrev={handlePrev}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
          />
        </div>
      </div>

      {/* Algorithm Info Section - Bottom */}
      <div className={styles.algorithmInfoSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>演算法說明</h3>
        </div>
        <div className={styles.infoContent}>
          <div className={styles.infoBlock}>
            <h4>演算法簡介</h4>
            <p>
              快速排序是一種高效的排序演算法，採用分治法（Divide and Conquer）策略。
              它的核心思想是選擇一個基準值（pivot），將陣列分為兩部分：小於基準值的元素和大於基準值的元素，
              然後遞迴地對這兩部分進行排序。
            </p>
          </div>

          <div className={styles.infoBlock}>
            <h4>複雜度分析</h4>
            <div className={styles.complexityTable}>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>時間複雜度（最佳）：</span>
                <span className={styles.complexityValue}>O(n log n)</span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>時間複雜度（平均）：</span>
                <span className={styles.complexityValue}>O(n log n)</span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>時間複雜度（最差）：</span>
                <span className={styles.complexityValue}>O(n²)</span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>空間複雜度：</span>
                <span className={styles.complexityValue}>O(log n)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;