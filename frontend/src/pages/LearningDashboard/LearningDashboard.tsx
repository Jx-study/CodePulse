import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./LearningDashboard.module.scss";

import ProgressStatsDialog from "./components/ProgressStatsDialog/ProgressStatsDialog";
import CategoryFilter from "./components/CategoryFilter/CategoryFilter";
import GraphContainer from "./components/GraphContainer/GraphContainer";
import LevelNode from "./components/LevelNode/LevelNode";
import PortalNode from "./components/PortalNode/PortalNode";
import GhostNode from "./components/GhostNode/GhostNode";
import PathConnection from "./components/PathConnection/PathConnection";
import LevelDialog from "./components/LevelDialog/LevelDialog";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";

// 資料導入
import {
  getAllLevels,
  getPortalTargetCategory,
  isPortalUnlocked,
} from "@/services/LevelService";
import {
  getCategories,
  getCategoryName,
  updateCategoryUnlocks,
} from "@/services/CategoryService";
import {
  loadUserProgress,
  saveUserProgress,
} from "@/services/UserProgressService";
import {
  getLevelProgress,
  calculateDisplayStatus,
  calculateOverallProgress,
  calculateCategoryProgress,
  completeLevel,
  startLevel,
} from "@/services/ProgressService";
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
import { t } from "i18next";

function LearningDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [userProgress, setUserProgress] = useState<UserProgress>(
    loadUserProgress()
  );
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
    userProgress
  );

  // 過濾關卡（按分類）
  const filteredLevels = filterLevelsByCategory(
    levelsWithUnlockStatus,
    activeCategory
  );

  // 使用 ProgressService 計算顯示狀態
  const getDisplayStatus = (level: Level & { isUnlocked: boolean }) => {
    return calculateDisplayStatus(level, filteredLevels, userProgress);
  };

  // 使用 ProgressService 計算進度統計
  const { totalLevels, completedLevels, totalStars, earnedStars, completionRate } =
    calculateOverallProgress(allLevels, userProgress);

  const categoryProgress = calculateCategoryProgress(allLevels, userProgress);

  // 更新 URL 參數
  useEffect(() => {
    setSearchParams({ category: activeCategory });
  }, [activeCategory, setSearchParams]);

  // Boss Level 自動解鎖邏輯
  useEffect(() => {
    const updatedProgress = updateCategoryUnlocks(userProgress);

    // 比較 categoryUnlocks 是否有變化
    const hasChanges = JSON.stringify(updatedProgress.categoryUnlocks) !==
      JSON.stringify(userProgress.categoryUnlocks);

    if (hasChanges) {
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
  }, [userProgress]); // 監聽整個 userProgress

  // 統一的關卡導航函數
  const navigateToLevel = (
    levelId: string,
    targetCategory?: CategoryType,
    shouldOpenDialog: boolean = true
  ) => {
    const targetLevel = levelsWithUnlockStatus.find(
      (level) => level.id === levelId
    );

    if (!targetLevel) {
      console.warn(`Level "${levelId}" not found.`);
      return;
    }

    if (!targetLevel.isDeveloped) {
      console.warn(`Level "${levelId}" is not developed yet.`);
      return;
    }

    // 1. 切換到目標分類（如果提供）
    if (targetCategory) {
      setActiveCategory(targetCategory);
    }

    // 2. 延遲滾動並打開 dialog
    setTimeout(() => {
      const levelElement = document.querySelector(
        `[data-level-id="${levelId}"]`
      );
      if (levelElement) {
        levelElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      if (shouldOpenDialog) {
        setSelectedLevel(targetLevel);
      }
    }, 300);
  };

  // 自動打開指定的 Level Dialog（從 URL 參數讀取 levelId）
  useEffect(() => {
    const levelId = searchParams.get("levelId");

    // 只在第一次載入時自動打開，避免重複觸發
    if (levelId && !hasAutoOpened) {
      navigateToLevel(levelId);
      setHasAutoOpened(true);

      // 清除 URL 參數，避免刷新頁面時重複打開
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("levelId");
      setSearchParams(newParams);
    }
  }, [searchParams, levelsWithUnlockStatus, hasAutoOpened, setSearchParams]);

  // 處理關卡點擊（只有已開發的功能才能點擊）
  const handleLevelClick = (level: Level) => {
    if (!level.isDeveloped) {
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
      // 使用 ProgressService 更新關卡狀態為「進行中」
      const updatedProgress = startLevel(selectedLevel.id, userProgress);
      setUserProgress(updatedProgress);
      saveUserProgress(updatedProgress);

      navigate(`/practice/${selectedLevel.category}/${selectedLevel.id}`);
    }
  };

  // TODO:測試用->完成關卡（練習頁面完成後可移除）
  const handleCompleteLevel = () => {
    if (selectedLevel) {
      const currentProgress = getLevelProgress(selectedLevel.id, userProgress);
      const newStars = Math.max(currentProgress.stars, 3) as 0 | 1 | 2 | 3;

      // 使用 ProgressService 更新進度
      const updatedProgress = completeLevel(selectedLevel.id, userProgress, newStars);
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

          // 使用 LevelService 檢查 Portal 解鎖狀態
          const portalUnlocked = isPortal && isPortalUnlocked(level.id, userProgress);

          // Portal Node 點擊處理：直接跳轉到目標分類
          const handlePortalClick = () => {
            if (portalUnlocked) {
              const targetCategory = getPortalTargetCategory(level.id);
              if (targetCategory) {
                setActiveCategory(targetCategory);
              }
            }
          };

          // Ghost Node 點擊處理：跳轉到目標分類並滾動到目標關卡
          const handleGhostClick = (targetLevelId: string, targetCategory: CategoryType) => {
            navigateToLevel(targetLevelId, targetCategory);
          };

          return (
            <>
              {/* 路徑連接線 - 從每個前置關卡到當前關卡 */}
              {prereqIds.map((prereqId) => {
                const prereqLevel = filteredLevels.find(
                  (l) => l.id === prereqId
                );
                if (!prereqLevel) return null;

                const fromPosition = prereqLevel.graphPosition
                  ? calculateGraphNodePosition(prereqLevel, filteredLevels)
                  : calculateNodePosition(
                      filteredLevels.indexOf(prereqLevel),
                      filteredLevels.length
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

              {/* 幽靈參考節點 */}
              {level.ghostReferences?.map((ghostRef, ghostIndex) => {
                // 計算幽靈節點位置
                const ghostPosition = calculateGraphNodePosition(
                  { ...level, graphPosition: ghostRef.position },
                  filteredLevels
                );

                // 繪製虛線連接（從當前 level 到 ghost node）
                const ghostConnection = (
                  <PathConnection
                    key={`ghost-${level.id}-${ghostIndex}`}
                    fromNode={position}
                    toNode={ghostPosition}
                    status="unlocked"
                    connectionType="GHOST"
                  />
                );

                // 渲染幽靈節點（點擊時動態查詢 targetLevel）
                const ghostNode = (
                  <GhostNode
                    key={`ghost-node-${ghostRef.targetLevelId}-${ghostIndex}`}
                    targetLevelId={ghostRef.targetLevelId}
                    label={ghostRef.label || ghostRef.targetLevelId}
                    position={ghostPosition}
                    onClick={() => {
                      // 在點擊時才查詢目標 Level
                      const targetLevel = allLevels.find((l: Level) => l.id === ghostRef.targetLevelId);
                      if (targetLevel) {
                        handleGhostClick(targetLevel.id, targetLevel.category);
                      }
                    }}
                  />
                );

                return (
                  <React.Fragment key={`ghost-fragment-${ghostIndex}`}>
                    {ghostConnection}
                    {ghostNode}
                  </React.Fragment>
                );
              })}
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
        className={`${styles.categorySidebar} ${
          isSidebarOpen ? styles.open : ""
        }`}
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
        className={`${styles.sidebarOverlay} ${
          isSidebarOpen ? styles.visible : ""
        }`}
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
          userProgress={getLevelProgress(selectedLevel.id, userProgress)}
          tutorialLocked={false}
          practiceLocked={!selectedLevel.isUnlocked}
          prerequisiteInfo={selectedLevel.prerequisites}
        />
      )}

      {/* Toast 提示 */}
      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
}

export default LearningDashboard;
