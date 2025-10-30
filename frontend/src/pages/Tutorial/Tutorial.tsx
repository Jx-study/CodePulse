import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, Button } from '../../shared/components';
import CodeEditor from '../../modules/core/components/CodeEditor/CodeEditor';
import { D3Canvas } from '../../modules/core/Render/D3Canvas';
import ControlBar from '../../modules/core/components/ControlBar/ControlBar';
import { BreadcrumbItem } from '../../types';
import { getAlgorithmConfig } from '../../data/algorithms';
import styles from './Tutorial.module.scss';

function Tutorial() {
  const { t } = useTranslation();
  const { category, algorithm } = useParams<{ category: string; algorithm: string }>();
  const navigate = useNavigate();

  // 根據路由參數載入演算法配置
  const algorithmConfig = category && algorithm ? getAlgorithmConfig(category, algorithm) : null;

  // 如果找不到演算法配置，顯示錯誤
  if (!algorithmConfig) {
    return (
      <div className={styles.tutorialPage}>
        <div className={styles.errorContainer}>
          <h2>演算法不存在</h2>
          <p>找不到演算法：{category}/{algorithm}</p>
          <Button onClick={() => navigate('/dashboard')}>返回首頁</Button>
        </div>
      </div>
    );
  }

  // 載入動畫步驟資料
  const animationSteps = algorithmConfig.createAnimationSteps();

  // State 管理
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // 生成面包屑數據
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: algorithmConfig.categoryName,
      path: `/dashboard?category=${category}`,
    },
    {
      label: algorithmConfig.name,
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
              value={algorithmConfig.pseudoCode}
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
            <p>{algorithmConfig.introduction}</p>
          </div>

          <div className={styles.infoBlock}>
            <h4>複雜度分析</h4>
            <div className={styles.complexityTable}>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>時間複雜度（最佳）：</span>
                <span className={styles.complexityValue}>{algorithmConfig.complexity.timeBest}</span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>時間複雜度（平均）：</span>
                <span className={styles.complexityValue}>{algorithmConfig.complexity.timeAverage}</span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>時間複雜度（最差）：</span>
                <span className={styles.complexityValue}>{algorithmConfig.complexity.timeWorst}</span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>空間複雜度：</span>
                <span className={styles.complexityValue}>{algorithmConfig.complexity.space}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;