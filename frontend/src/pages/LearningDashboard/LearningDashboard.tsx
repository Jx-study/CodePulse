import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./LearningDashboard.module.scss";

// 組件導入
import ProgressStatsDialog from "./components/ProgressStatsDialog/ProgressStatsDialog";
import CategoryFilter from "./components/CategoryFilter/CategoryFilter";
import VerticalLevelMap from "./components/VerticalLevelMap/VerticalLevelMap";
import LevelNode from "./components/LevelNode/LevelNode";
import PathConnection from "./components/PathConnection/PathConnection";
import LevelDialog from "./components/LevelDialog/LevelDialog";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";

// 資料導入
import { getAllLevels } from "@/data/levels/levelDefinitions";
import { loadUserProgress, saveUserProgress } from "@/data/userProgress";
import {
  calculateNodePosition,
  calculateGraphNodePosition,
} from "./components/VerticalLevelMap/utils/positionCalculator";
import {
  computeAllUnlockStatus,
  filterLevelsByCategory,
} from "./utils/graphUtils";
import type { Level, UserProgress } from "@/types";

function LearningDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [userProgress, setUserProgress] =
    useState<UserProgress>(loadUserProgress());
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // 從統一配置獲取所有關卡
  const allLevels = getAllLevels();

  // 計算解鎖狀態
  const levelsWithUnlockStatus = computeAllUnlockStatus(
    allLevels,
    userProgress,
  );

  // 過濾關卡（按分類）
  const filteredLevels = filterLevelsByCategory(
    levelsWithUnlockStatus,
    activeCategory,
  );

  // Helper function: 獲取關卡進度（若不存在則返回預設值）
  const getLevelProgress = (levelId: string) => {
    return userProgress.levels[levelId] || {
      levelId,
      status: 'locked' as const,
      stars: 0,
      attempts: 0,
      bestTime: 0
    };
  };

  // 計算進度統計
  const totalLevels = allLevels.length;
  const completedLevels = Object.values(userProgress.levels).filter(
    (progress) => progress.status === "completed",
  ).length;
  const totalStars = totalLevels * 3;
  const earnedStars = Object.values(userProgress.levels).reduce(
    (sum, progress) => sum + progress.stars,
    0,
  );
  const completionRate =
    totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

  // 計算按分類的進度統計
  const categoryProgress = allLevels.reduce((acc, level) => {
    const category = level.category;

    if (!acc[category]) {
      acc[category] = {
        name: level.category,
        completedLevels: 0,
        totalLevels: 0,
        completionRate: 0,
        isBossCompleted: false,
      };
    }

    acc[category].totalLevels += 1;

    const levelProgress = userProgress.levels[level.id];
    if (levelProgress?.status === "completed") {
      acc[category].completedLevels += 1;
    }

    // 檢查是否為 Boss Level
    if (level.pathMetadata?.pathType === "boss" && levelProgress?.status === "completed") {
      acc[category].isBossCompleted = true;
    }

    // 計算完成率
    acc[category].completionRate =
      acc[category].totalLevels > 0
        ? (acc[category].completedLevels / acc[category].totalLevels) * 100
        : 0;

    return acc;
  }, {} as Record<string, { name: string; completedLevels: number; totalLevels: number; completionRate: number; isBossCompleted: boolean; }>);

  // 更新 URL 參數
  useEffect(() => {
    if (activeCategory !== "all") {
      setSearchParams({ category: activeCategory });
    } else {
      setSearchParams({});
    }
  }, [activeCategory, setSearchParams]);

  // 自動打開指定的 Level Dialog（從 URL 參數讀取 levelId）
  useEffect(() => {
    const levelId = searchParams.get("levelId");

    // 只在第一次載入時自動打開，避免重複觸發
    if (levelId && !hasAutoOpened) {
      const targetLevel = levelsWithUnlockStatus.find(
        (level) => level.id === levelId,
      );

      if (targetLevel) {
        // 只有已開發的關卡才能打開
        if (targetLevel.isDeveloped) {
          setSelectedLevel(targetLevel);
          setHasAutoOpened(true);

          // 滾動到對應的關卡節點（延遲執行以確保 DOM 已渲染）
          setTimeout(() => {
            const levelElement = document.querySelector(
              `[data-level-id="${levelId}"]`,
            );
            if (levelElement) {
              levelElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 300);

          // 清除 URL 參數，避免刷新頁面時重複打開
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("levelId");
          setSearchParams(newParams);
        } else {
          console.warn(`Level "${levelId}" is not developed yet.`);
        }
      } else {
        console.warn(`Level "${levelId}" not found in MOCK_LEVELS.`);
      }
    }
  }, [searchParams, levelsWithUnlockStatus, hasAutoOpened, setSearchParams]);

  // 處理關卡點擊（只有已開發的功能才能點擊）
  const handleLevelClick = (level: Level) => {
    if (!level.isDeveloped) {
      // 可選：顯示「功能開發中」提示
      return;
    }
    setSelectedLevel(level);
  };

  // 跳轉到 Tutorial Page
  const handleStartTutorial = () => {
    if (selectedLevel) {
      navigate(`/tutorial/${selectedLevel.category}/${selectedLevel.id}`);
    }
  };

  // 跳轉到 Practice Page
  const handleStartPractice = () => {
    if (selectedLevel) {
      // 更新關卡狀態為「進行中」
      const currentProgress = getLevelProgress(selectedLevel.id);
      const updatedProgress = {
        ...userProgress,
        levels: {
          ...userProgress.levels,
          [selectedLevel.id]: {
            ...currentProgress,
            status: "in-progress" as const,
          },
        },
      };
      setUserProgress(updatedProgress);
      saveUserProgress(updatedProgress);

      navigate(`/practice/${selectedLevel.category}/${selectedLevel.id}`);
    }
  };

  // 側邊栏狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.dashboard}>
      {/* 全屏垂直關卡地圖 */}
      <VerticalLevelMap levels={filteredLevels} userProgress={userProgress}>
        {(level, index, position) => {
          // v2.0: 根據 prerequisites 繪製連線
          const prereqIds = level.prerequisites?.levelIds || [];
          const prereqType = level.prerequisites?.type || "AND";

          return (
            <>
              {/* 路徑連接線 - 從每個前置關卡到當前關卡 */}
              {prereqIds.map((prereqId) => {
                const prereqLevel = filteredLevels.find(
                  (l) => l.id === prereqId,
                );
                if (!prereqLevel) return null;

                const fromPosition = prereqLevel.graphPosition
                  ? calculateGraphNodePosition(prereqLevel, filteredLevels)
                  : calculateNodePosition(
                      filteredLevels.indexOf(prereqLevel),
                      filteredLevels.length,
                    );

                return (
                  <PathConnection
                    key={`${prereqId}-${level.id}`}
                    fromNode={fromPosition}
                    toNode={position}
                    isCompleted={
                      userProgress.levels[prereqId]?.status === "completed"
                    }
                    connectionType={prereqType}
                  />
                );
              })}

              {/* 關卡節點 */}
              <LevelNode
                level={level}
                status={
                  level.isUnlocked
                    ? userProgress.levels[level.id]?.status || "unlocked"
                    : "locked"
                }
                stars={userProgress.levels[level.id]?.stars || 0}
                isLocked={!level.isUnlocked}
                isDeveloped={level.isDeveloped}
                alignment={position.alignment}
                style={{
                  position: "absolute",
                  left: position.x,
                  top: `${position.y}px`,
                }}
                onClick={() => handleLevelClick(level)}
              />
            </>
          );
        }}
      </VerticalLevelMap>

      {/* 浮動控制面板（右上角） */}
      <div className={styles.floatingControls}>
        <Button
          variant="primary"
          size="sm"
          className={`${styles.controlButton} ${styles.categoryButton}`}
          onClick={() => setIsSidebarOpen(true)}
        >
          分類篩選
        </Button>
        <Button
          variant="primary"
          size="sm"
          className={styles.controlButton}
          onClick={() => setIsProgressDialogOpen(true)}
        >
          學習進度
        </Button>
      </div>

      {/* 分類側邊欄 */}
      <div
        className={`${styles.categorySidebar} ${isSidebarOpen ? styles.open : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <h2>演算法分類</h2>
          <Button
            variant="icon"
            className={styles.closeButton}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="關閉側邊欄"
          >
            <Icon name="times" size="lg" />
          </Button>
        </div>
        <div className={styles.sidebarContent}>
          <CategoryFilter
            categories={[
              "all",
              "sorting",
              "searching",
              "graph",
              "dynamic-programming",
              "data-structures",
            ]}
            activeCategory={activeCategory}
            onCategoryChange={(category) => {
              setActiveCategory(category);
              setIsSidebarOpen(false); // 選擇後關閉側邊欄
            }}
          />
        </div>
      </div>

      {/* 側邊欄遮罩層 */}
      <div
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.visible : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* 進度統計彈窗 */}
      <ProgressStatsDialog
        isOpen={isProgressDialogOpen}
        onClose={() => setIsProgressDialogOpen(false)}
        totalLevels={totalLevels}
        completedLevels={completedLevels}
        totalStars={totalStars}
        earnedStars={earnedStars}
        completionRate={completionRate}
        categoryProgress={categoryProgress}
      />

      {/* 關卡詳細資訊彈窗 */}
      {selectedLevel && (
        <LevelDialog
          level={selectedLevel}
          isOpen={!!selectedLevel}
          onClose={() => setSelectedLevel(null)}
          onStartTutorial={handleStartTutorial}
          onStartPractice={handleStartPractice}
          userProgress={getLevelProgress(selectedLevel.id)}
          isLocked={!selectedLevel.isUnlocked}
        />
      )}
    </div>
  );
}

export default LearningDashboard;
