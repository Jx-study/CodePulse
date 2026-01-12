import { useState, useEffect, useMemo } from "react";
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
import { generateStepsFromData } from "../../data/DataStructure/linear/LinkedList"; // 確保導入此函數
import { AnimationStep } from "../../types/dataStructure";
import { BaseElement } from "@/modules/core/DataLogic/BaseElement";

function Tutorial() {
  const { t } = useTranslation();
  const { category, subcategory, topicType } = useParams<{
    category: string;
    subcategory?: string;
    topicType: string;
  }>();
  const navigate = useNavigate();

  // 1. 根據路由參數載入配置
  const topicTypeConfig = useMemo(() => {
    if (category === "datastructure" && subcategory && topicType) {
      return getDataStructureConfig(subcategory, topicType);
    } else if (category && topicType) {
      return getAlgorithmConfig(category, topicType);
    }
    return null;
  }, [category, subcategory, topicType]);

  // 2. 狀態管理
  const [listData, setListData] = useState<number[]>([1, 2, 3]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeSteps, setActiveSteps] = useState<AnimationStep[]>([]);

  // 3. 計算目前的動畫步驟 (當 listData 改變時重新計算)
  useEffect(() => {
    if (topicTypeConfig) {
      setActiveSteps(
        topicTypeConfig.id === "linkedlist"
          ? generateStepsFromData(listData)
          : topicTypeConfig.createAnimationSteps()
      );
    }
  }, [topicTypeConfig]);

  const currentStepData = activeSteps[currentStep];

  // 4. 動畫播放邏輯
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep >= activeSteps.length - 1) {
          setIsPlaying(false);
          return prevStep;
        }
        return prevStep + 1;
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activeSteps.length]);

  // 5. 處理連線 (從 Node 的 pointers 提取，支援伸縮動畫)
  const currentLinks = useMemo(() => {
    const links: Link[] = [];
    if (currentStepData?.elements) {
      const nodes = currentStepData.elements.filter(
        (e: BaseElement) => e instanceof DataNode
      ) as DataNode[];

      nodes.forEach((sourceNode) => {
        // 遍歷每個節點的 pointers 陣列
        sourceNode.pointers.forEach((targetNode) => {
          links.push({
            key: `${sourceNode.id}->${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
          });
        });
      });
    }
    return links;
  }, [currentStepData]);

  // 6. 控制行為
  const handleAddNode = (value: number) => {
    const newListData = [...listData, value];
    setListData(newListData);
    const animationProcess = generateStepsFromData(newListData, value);
    setActiveSteps(animationProcess);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleDeleteNode = (value: number) => {
    const newListData = listData.filter((v) => v !== value);
    setListData(newListData);
    // 這裡也要加上對應的刪除動畫生成邏輯，先以重置步驟替代
    if (topicTypeConfig?.id === "linkedlist") {
      setActiveSteps(generateStepsFromData(newListData));
    }
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, activeSteps.length - 1));
  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  if (!topicTypeConfig) {
    return null;
    // return (
    // <div className={styles.tutorialPage}>
    //   <div className={styles.errorContainer}>
    //     <h2>不存在</h2>
    //     <Button onClick={() => navigate("/dashboard")}>返回首頁</Button>
    //   </div>
    // </div>
    // );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: topicTypeConfig.categoryName,
      path: `/dashboard?category=${category}`,
    },
    { label: topicTypeConfig.name, path: null },
  ];

  return (
    <div className={styles.tutorialPage}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} showBackButton={true} />
      </div>

      <div className={styles.topSection}>
        <div className={styles.pseudoCodeSection}>
          <h3 className={styles.sectionTitle}>Pseudo Code</h3>
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

        <div className={styles.rightPanel}>
          <div className={styles.visualizationSection}>
            <h3 className={styles.sectionTitle}>視覺化動畫</h3>
            <div className={styles.visualizationArea}>
              <D3Canvas
                elements={currentStepData?.elements || []}
                links={currentLinks}
                width={1000}
                height={400}
              />
            </div>
            <div className={styles.stepDescription}>
              {currentStepData?.description}
            </div>
          </div>

          {/* 資料操作列 */}
          <DataActionBar
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
          />

          {/* 播放控制列 */}
          <ControlBar
            isPlaying={isPlaying}
            currentStep={currentStep}
            totalSteps={activeSteps.length}
            playbackSpeed={playbackSpeed}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handleNext}
            onPrev={handlePrev}
            onReset={handleReset}
            onSpeedChange={setPlaybackSpeed}
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
