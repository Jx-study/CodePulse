import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./LearningDashboard.module.scss";

// 組件導入
import ProgressStatsDialog from "./components/ProgressStatsDialog/ProgressStatsDialog";
import CategoryFilter from "./components/CategoryFilter/CategoryFilter";
import GraphContainer from "./components/GraphContainer/GraphContainer";
import LevelNode from "./components/LevelNode/LevelNode";
import PortalNode from "./components/PortalNode/PortalNode";
import PathConnection from "./components/PathConnection/PathConnection";
import LevelDialog from "./components/LevelDialog/LevelDialog";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";

// 資料導入
import { getAllLevels, getPortalTargetCategory } from "@/services/LevelService";
import { getCategories, getCategoryName } from "@/services/CategoryService";
import {
  loadUserProgress,
  saveUserProgress,
  updateCategoryUnlocks,
} from "@/data/userProgress";
import {
  calculateNodePosition,
  calculateGraphNodePosition,
} from "./components/GraphContainer/utils/positionCalculator";
import {
  computeAllUnlockStatus,
  filterLevelsByCategory,
} from "./utils/graphUtils";
import type { Level, UserProgress } from "@/types";
import type { CategoryType } from "@/types";

function LearningDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [userProgress, setUserProgress] =
    useState<UserProgress>(loadUserProgress());
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>(
    (searchParams.get("category") as CategoryType) || "data-structures",
  );
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 從統一配置獲取所有關卡
  const allLevels = getAllLevels();

  // 取得 Categories（包含解鎖狀態）
  const categories = getCategories(userProgress);

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
    return (
      userProgress.levels[levelId] || {
        levelId,
        status: "locked" as const,
        stars: 0,
        attempts: 0,
        bestTime: 0,
      }
    );
  };

  // Helper function: 判斷關卡應該顯示的狀態
  // 規則：
  // 1. 在同一 category 中，找出所有已解鎖但未完成的關卡
  // 2. 只有 layer 最小的關卡才會顯示為可玩狀態
  // 3. 如果整個 category 只有一個可玩關卡，顯示為 "in-progress"
  // 4. 如果有多個可玩關卡，顯示為 "unlocked"
  const getDisplayStatus = (level: Level & { isUnlocked: boolean }) => {
    // 如果關卡被鎖定，直接返回 "locked"
    if (!level.isUnlocked) {
      return "locked";
    }

    // 獲取用戶進度中的狀態
    const progressStatus = userProgress.levels[level.id]?.status;

    // 如果已經是 "completed" 或 "in-progress"，保持原狀態
    if (progressStatus === "completed" || progressStatus === "in-progress") {
      return progressStatus;
    }

    // 找出所有已解鎖但未完成的關卡
    const unlockedNotCompletedLevels = filteredLevels.filter(
      (l) =>
        l.isUnlocked &&
        userProgress.levels[l.id]?.status !== "completed" &&
        userProgress.levels[l.id]?.status !== "in-progress",
    );

    // 如果沒有未完成的關卡，返回 "locked"
    if (unlockedNotCompletedLevels.length === 0) {
      return "locked";
    }

    // 找到 layer 最小的關卡
    const minLayer = Math.min(
      ...unlockedNotCompletedLevels.map((l) => l.graphPosition?.layer ?? 0),
    );

    // 找出所有 layer 最小的未完成關卡
    const minLayerLevels = unlockedNotCompletedLevels.filter(
      (l) => l.graphPosition?.layer === minLayer,
    );

    // 如果當前關卡不是 layer 最小的，顯示為 "locked"
    const isInMinLayer = minLayerLevels.some((l) => l.id === level.id);
    if (!isInMinLayer) {
      return "locked";
    }

    // 如果只有一個 layer 最小的未完成關卡（就是當前這個），顯示為 "in-progress"
    if (minLayerLevels.length === 1) {
      return "in-progress";
    }

    // 如果有多個 layer 最小的未完成關卡，顯示為 "unlocked"
    return "unlocked";
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
  const categoryProgress = allLevels.reduce(
    (acc, level) => {
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
      if (
        level.pathMetadata?.pathType === "boss" &&
        levelProgress?.status === "completed"
      ) {
        acc[category].isBossCompleted = true;
      }

      // 計算完成率
      acc[category].completionRate =
        acc[category].totalLevels > 0
          ? (acc[category].completedLevels / acc[category].totalLevels) * 100
          : 0;

      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        completedLevels: number;
        totalLevels: number;
        completionRate: number;
        isBossCompleted: boolean;
      }
    >,
  );

  // 更新 URL 參數
  useEffect(() => {
    setSearchParams({ category: activeCategory });
  }, [activeCategory, setSearchParams]);

  // Boss Level 自動解鎖邏輯
  useEffect(() => {
    const updatedProgress = updateCategoryUnlocks(userProgress);

    if (updatedProgress !== userProgress) {
      setUserProgress(updatedProgress);
      saveUserProgress(updatedProgress);

      // 找出新解鎖的 Category
      const newlyUnlockedCategories = Object.entries(
        updatedProgress.categoryUnlocks,
      )
        .filter(
          ([id, unlocked]) =>
            unlocked && !userProgress.categoryUnlocks[id as CategoryType],
        )
        .map(([id]) => id as CategoryType);

      if (newlyUnlockedCategories.length > 0) {
        const categoryName = getCategoryName(newlyUnlockedCategories[0]);
        setToastMessage(`🎉 恭喜！解鎖新領域：${categoryName}`);

        // 3 秒後自動消失
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  }, [userProgress.levels]); // 僅監聽 levels 變化

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

  // TODO:測試用->完成關卡
  const handleCompleteLevel = () => {
    if (selectedLevel) {
      const currentProgress = getLevelProgress(selectedLevel.id);
      const newStars = Math.max(currentProgress.stars, 1) as 1 | 2 | 3 | 4 | 5;
      const updatedProgress: UserProgress = {
        ...userProgress,
        levels: {
          ...userProgress.levels,
          [selectedLevel.id]: {
            ...currentProgress,
            status: "completed" as const,
            stars: newStars,
            attempts: currentProgress.attempts + 1,
          },
        },
        totalLevelsCompleted:
          userProgress.totalLevelsCompleted +
          (currentProgress.status !== "completed" ? 1 : 0),
        totalStarsEarned:
          userProgress.totalStarsEarned +
          (currentProgress.status !== "completed" ? 1 : 0),
      };
      setUserProgress(updatedProgress);
      saveUserProgress(updatedProgress);

      // 顯示完成提示
      setToastMessage(`🎉 完成關卡：${selectedLevel.name}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // 側邊栏狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.dashboard}>
      {/* 全屏垂直關卡地圖 */}
      <GraphContainer levels={filteredLevels} userProgress={userProgress}>
        {(level, index, position) => {
          // 根據 prerequisites 繪製連線
          const prereqIds = level.prerequisites?.levelIds || [];
          const prereqType = level.prerequisites?.type || "AND";
          const isPortal = level.pathMetadata?.pathType === "portal";

          // Portal 的解鎖狀態：檢查目標 category 是否已解鎖
          const getPortalUnlockStatus = () => {
            if (!isPortal) return false;
            const targetCategory = level.pathMetadata?.targetCategory;
            if (!targetCategory) return false;
            return userProgress.categoryUnlocks?.[targetCategory] ?? false;
          };

          const portalIsUnlocked = isPortal ? getPortalUnlockStatus() : false;

          // Portal Node 點擊處理：直接跳轉到目標分類
          const handlePortalClick = () => {
            if (portalIsUnlocked && isPortal) {
              const targetCategory = getPortalTargetCategory(level.id);
              if (targetCategory) {
                setActiveCategory(targetCategory);
              }
            }
          };

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

                // 決定連線狀態：目標關卡（toNode）的狀態決定連線顏色
                const targetStatus = getDisplayStatus(level);
                const pathStatus: "locked" | "unlocked" | "completed" =
                  targetStatus === "completed"
                    ? "completed"
                    : targetStatus === "unlocked" ||
                        targetStatus === "in-progress"
                      ? "unlocked"
                      : "locked";

                return (
                  <PathConnection
                    key={`${prereqId}-${level.id}`}
                    fromNode={fromPosition}
                    toNode={position}
                    status={pathStatus}
                    connectionType={prereqType}
                  />
                );
              })}

              {/* 節點渲染：Portal Node 或 Level Node */}
              {isPortal ? (
                <PortalNode
                  targetCategory={
                    level.pathMetadata?.targetCategory || "data-structures"
                  }
                  targetCategoryName={getCategoryName(
                    level.pathMetadata?.targetCategory || "data-structures",
                  )}
                  isUnlocked={level.isUnlocked}
                  position={position}
                  onClick={handlePortalClick}
                />
              ) : (
                <LevelNode
                  level={level}
                  status={getDisplayStatus(level)}
                  stars={userProgress.levels[level.id]?.stars || 0}
                  isLocked={!level.isUnlocked}
                  position={position}
                  onClick={() => handleLevelClick(level)}
                  isBossLevel={level.pathMetadata?.pathType === "boss"}
                  pathMetadata={level.pathMetadata}
                />
              )}
            </>
          );
        }}
      </GraphContainer>

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
            categories={categories}
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
          onCompleteLevel={handleCompleteLevel}
          userProgress={getLevelProgress(selectedLevel.id)}
          isLocked={!selectedLevel.isUnlocked}
        />
      )}

      {/* Toast 提示 */}
      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
}

export default LearningDashboard;
