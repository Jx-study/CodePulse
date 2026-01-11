import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumb, Button } from "../../shared/components";
import CodeEditor from "../../modules/core/components/CodeEditor/CodeEditor";
import { D3Canvas } from "../../modules/core/Render/D3Canvas";
import ControlBar from "../../modules/core/components/ControlBar/ControlBar";
import { BreadcrumbItem } from "../../types";
import { getAlgorithmConfig } from "../../data/algorithms";
import { getDataStructureConfig } from "../../data/DataStructure";
import styles from "./Tutorial.module.scss";
import { Link } from "../../modules/core/Render/D3Renderer";
import { Node as DataNode } from "../../modules/core/DataLogic/Node";
import { DataActionBar } from "../../modules/core/components/DataActionBar/DataActionBar";

function Tutorial() {
  const { t } = useTranslation();
  const { category, subcategory, topicType } = useParams<{
    category: string;
    subcategory?: string;
    topicType: string;
  }>();
  const navigate = useNavigate();

  // 根據路由參數載入配置
  let topicTypeConfig = null;

  if (category === "datastructure" && subcategory && topicType) {
    topicTypeConfig = getDataStructureConfig(subcategory, topicType);
  } else if (category && topicType) {
    topicTypeConfig = getAlgorithmConfig(category, topicType);
  }

  if (!topicTypeConfig) {
    return (
      <div className={styles.tutorialPage}>
        <div className={styles.errorContainer}>
          <h2>不存在</h2>
          <p>
            找不到：{category}/{topicType}
          </p>
          <Button onClick={() => navigate("/dashboard")}>返回首頁</Button>
        </div>
      </div>
    );
  }

  // 載入動畫步驟資料
  const animationSteps = topicTypeConfig.createAnimationSteps();

  // State 管理
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // 生成面包屑數據
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: topicTypeConfig.categoryName,
      path: `/dashboard?category=${category}`,
    },
    {
      label: topicTypeConfig.name,
      path: null, // 當前頁面，不可點擊
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

  const [listData, setListData] = useState<number[]>([1, 2, 3]);

  // 2. 定義處理新增節點的函式
  const handleAddNode = (value: number) => {
    console.log("Adding node with value:", value);
    // 更新資料狀態
    setListData((prev) => [...prev, value]);

    // 注意：這裡後續需要呼叫 generateStepsFromData(newListData)
    // 來重新生成動畫步驟，目前先確保函式存在以消除報錯
  };

  // 3. 定義處理刪除節點的函式
  const handleDeleteNode = (value: number) => {
    console.log("Deleting node with value:", value);
    // 更新資料狀態
    setListData((prev) => prev.filter((v) => v !== value));
  };
  // 獲取當前步驟資料
  const currentStepData = animationSteps[currentStep];

  const currentLinks: Link[] = [];
  if (currentStepData?.elements) {
    const nodes = currentStepData.elements.filter(
      (e) => e instanceof DataNode
    ) as DataNode[];
    nodes.forEach((node, index) => {
      // 這裡根據你的邏輯：如果 i 指向 i+1
      if (index < nodes.length - 1) {
        currentLinks.push({
          key: `${node.id}->${nodes[index + 1].id}`,
          sourceId: node.id,
          targetId: nodes[index + 1].id,
        });
      }
    });
  }

  // Debug logging
  useEffect(() => {
    console.log("Tutorial Debug:", {
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
  }, [
    currentStep,
    currentStepData,
    isPlaying,
    playbackSpeed,
    animationSteps.length,
  ]);

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
              value={topicTypeConfig.pseudoCode}
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
                links={currentLinks}
                width={600}
                height={400}
              />
            </div>
            <div className={styles.stepDescription}>
              {currentStepData?.description}
            </div>
          </div>
          <DataActionBar
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
          />
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
            <p>{topicTypeConfig.introduction}</p>
          </div>

          <div className={styles.infoBlock}>
            <h4>複雜度分析</h4>
            <div className={styles.complexityTable}>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>
                  時間複雜度（最佳）：
                </span>
                <span className={styles.complexityValue}>
                  {topicTypeConfig.complexity.timeBest}
                </span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>
                  時間複雜度（平均）：
                </span>
                <span className={styles.complexityValue}>
                  {topicTypeConfig.complexity.timeAverage}
                </span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>
                  時間複雜度（最差）：
                </span>
                <span className={styles.complexityValue}>
                  {topicTypeConfig.complexity.timeWorst}
                </span>
              </div>
              <div className={styles.complexityRow}>
                <span className={styles.complexityLabel}>空間複雜度：</span>
                <span className={styles.complexityValue}>
                  {topicTypeConfig.complexity.space}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
