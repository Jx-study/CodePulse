import { useState, useEffect, useMemo, useRef } from "react";
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
import { generateStepsFromData } from "../../data/DataStructure/linear/LinkedList"; // 確保導入此函數
import { AnimationStep } from "../../types/dataStructure";
import { BaseElement } from "@/modules/core/DataLogic/BaseElement";

interface ListNodeData {
  id: string;
  value: number;
}

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
  const [listData, setListData] = useState<ListNodeData[]>([
    { id: "node-1", value: 10 },
    { id: "node-2", value: 40 },
    { id: "node-3", value: 30 },
    { id: "node-4", value: 20 },
  ]);
  const nextIdRef = useRef(5);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeSteps, setActiveSteps] = useState<AnimationStep[]>([]);

  const [maxNodes, setMaxNodes] = useState(15);
  const [hasTailMode, setHasTailMode] = useState(false);

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
  const handleAddNode = (value: number, mode: string) => {
    if (listData.length >= maxNodes) return alert("已達最大節點數");

    const newId = nextIdRef.current++;
    const newNode = { id: `node-${newId}`, value };
    const newListData =
      mode === "Head" ? [newNode, ...listData] : [...listData, newNode];
    const steps = generateStepsFromData(newListData, {
      type: "add",
      value,
      mode,
      targetId: `node-${newId}`,
    });
    setListData(newListData);
    setActiveSteps(steps);
    setCurrentStep(0);
    setIsPlaying(true);
  };
  // const handleAddNode = (value: number, mode: string, index?: number) => {
  //   if (listData.length >= maxNodes) return alert("已達最大節點數");

  //   let newList = [...listData];
  //   if (mode === "Head") newList = [value, ...listData];
  //   else if (mode === "Tail") newList = [...listData, value];
  //   else if (mode === "Node N" && index !== undefined) {
  //     newList.splice(index + 1, 0, value);
  //   }

  //   setListData(newList);
  //   // 生成該動作專屬的多步驟動畫並播放
  //   const animationProcess = generateStepsFromData(newList, value);
  //   setActiveSteps(animationProcess);
  //   setCurrentStep(0);
  //   setIsPlaying(true);
  // };

  const handleDeleteNode = (mode: string, index?: number) => {
    if (listData.length === 0) return;

    let newList = [...listData];
    if (mode === "Head") newList.shift();
    else if (mode === "Tail") newList.pop();
    else if (mode === "Node N" && index !== undefined) {
      newList.splice(index, 1);
    }

    setListData(newList);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleSearchNode = (value: number) => {
    // 這裡未來可以介接 buildFindAnimation
    console.log("Searching for:", value);
  };

  // 隨機資料：數字在 -99~99，筆數不超過 maxNodes
  const handleRandomData = () => {
    const count = Math.floor(Math.random() * (maxNodes - 2)) + 3; // 至少 3 筆
    const newData: ListNodeData[] = [];

    for (let i = 0; i < count; i++) {
      newData.push({
        id: `node-${nextIdRef.current++}`,
        value: Math.floor(Math.random() * 199) - 99,
      });
    }

    setListData(newData);
    const steps = generateStepsFromData(newData); // 產生初始化步驟
    setActiveSteps(steps);
    setCurrentStep(0);
    setIsPlaying(false); // 這種操作通常不需要自動播放
  };

  // 重設：回到預設 10, 40, 30, 20
  const handleResetData = () => {
    const defaultValues = [10, 40, 30, 20];
    const newData = defaultValues.map((v) => ({
      id: `node-${nextIdRef.current++}`,
      value: v,
    }));
    setListData(newData);
    const steps = generateStepsFromData(newData);
    setActiveSteps(steps);
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
    if (parsed.length > maxNodes) {
      alert(`資料過長，已自動裁剪至前 ${maxNodes} 筆`);
    }

    const finalData = parsed.slice(0, maxNodes).map((v) => ({
      id: `node-${nextIdRef.current++}`,
      value: v,
    }));
    setListData(finalData);
    const steps = generateStepsFromData(finalData);
    setActiveSteps(steps);
    setCurrentStep(0);
    setIsPlaying(false);
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
            onSearchNode={handleSearchNode}
            onLoadData={handleLoadData}
            onResetData={handleResetData}
            onRandomData={handleRandomData}
            onMaxNodesChange={setMaxNodes}
            onTailModeChange={setHasTailMode}
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
