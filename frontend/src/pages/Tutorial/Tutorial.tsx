import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "../../shared/components";
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
import { BaseElement } from "@/modules/core/DataLogic/BaseElement";
import { useDataStructureLogic } from "@/modules/core/hooks/useDataStructureLogic";

function Tutorial() {
  const { t } = useTranslation();
  const { category, subcategory, topicType } = useParams<{
    category: string;
    subcategory?: string;
    topicType: string;
  }>();

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
  const { data, activeSteps, executeAction } =
    useDataStructureLogic(topicTypeConfig);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const isProcessing =
    isPlaying ||
    (activeSteps.length > 1 && currentStep < activeSteps.length - 1);

  const [maxNodes, setMaxNodes] = useState(15);
  const [hasTailMode, setHasTailMode] = useState(false);

  // 3. 計算目前的動畫步驟
  useEffect(() => {
    if (topicTypeConfig) {
      setCurrentStep(0);
      setIsPlaying(false);
    }
    // 注意：這裡刻意不加 listData，避免與 handleAddNode 的動畫衝突
  }, [topicTypeConfig]);

  useEffect(() => {
    if (topicTypeConfig && !isProcessing) {
      executeAction("refresh", { hasTailMode });
      setCurrentStep(0);
    }
  }, [hasTailMode]);

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
  const handleAddNode = (value: number, mode: string, index?: number) => {
    const steps = executeAction("add", {
      value,
      mode,
      index,
      maxNodes,
      hasTailMode,
    });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleDeleteNode = (mode: string, index?: number) => {
    const steps = executeAction("delete", { mode, index, hasTailMode });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSearchNode = (value: number) => {
    const steps = executeAction("search", { value, hasTailMode });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  // 隨機資料：數字在 -99~99，筆數不超過 maxNodes
  const handleRandomData = () => {
    executeAction("random", { maxNodes, hasTailMode });
    setCurrentStep(0);
    setIsPlaying(false); // 不需要自動播放
  };

  // 重設：回到預設 10, 40, 30, 20
  const handleResetData = () => {
    executeAction("reset", { hasTailMode });
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // 載入輸入資料：解析字串並更新
  const handleLoadData = (raw: string) => {
    const parsed = raw
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));

    if (parsed.length === 0) return alert("請輸入有效的數字格式 (例如: 1,2,3)");
    const steps = executeAction("load", {
      data: parsed,
      maxNodes,
      hasTailMode,
    });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  const handlePeek = () => {
    const steps = executeAction("peek", { hasTailMode });
    if (steps && steps.length > 0) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
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
  }

  const renderActionBar = () => {
    if (
      ["linkedlist", "stack", "queue", "array"].includes(topicTypeConfig.id)
    ) {
      return (
        <DataActionBar
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onSearchNode={handleSearchNode}
          onPeek={handlePeek}
          onLoadData={handleLoadData}
          onResetData={handleResetData}
          onRandomData={handleRandomData}
          onMaxNodesChange={setMaxNodes}
          onTailModeChange={setHasTailMode}
          structureType={topicTypeConfig.id as any}
          disabled={isProcessing}
        />
      );
    }
    // else if (topicTypeConfig.id === "bst") { return <TreeActionBar ... />; }

    return <div>此資料結構暫無操作介面</div>;
  };

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
                structureType={topicTypeConfig?.id}
              />
            </div>
            <div className={styles.stepDescription}>
              {currentStepData?.description}
            </div>
          </div>

          {/* 資料操作列 */}
          {renderActionBar()}

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
