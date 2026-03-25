import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./LearningDashboard.module.scss";

import ProgressStatsDialog from "./components/ProgressStatsDialog/ProgressStatsDialog";
import CategoryFilter from "./components/CategoryFilter/CategoryFilter";
import GraphContainer from "./components/GraphContainer/GraphContainer";
import LevelNode from "./components/LevelNode/LevelNode";
import PortalNode from "./components/PortalNode/PortalNode";
import PathConnection from "./components/PathConnection/PathConnection";
import LevelDialog from "./components/LevelDialog/LevelDialog";
import Button from "@/shared/components/Button";
import Sidebar from "@/shared/components/Sidebar";
import { ZoomDisableProvider, useZoomDisable } from "./context/ZoomDisableContext";


// 資料導入
import {
  getAllLevels,
  getPortalTargetCategory,
  isPortalUnlocked,
} from "@/services/LevelService";
import {
  getCategories,
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
import { useTranslation } from "react-i18next";
import { tutorialService } from '@/services/tutorialService';
import { mergeApiProgress } from '@/services/UserProgressService';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

function LearningDashboardInner() {
  const { t } = useTranslation('dashboard');
  const { disableZoom, enableZoom } = useZoomDisable();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // State
  const [userProgress, setUserProgress] = useState<UserProgress>(
    loadUserProgress()
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    tutorialService.getMyProgress()
      .then((apiProgress) => {
        setUserProgress((prev) => mergeApiProgress(prev, apiProgress));
      })
      .catch(() => {
        // 靜默失敗，維持本地預設值
      });
  }, [isAuthenticated, location.key]);
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
  const categories = getCategories();

  // 計算每個 Category 的 Level 數量
  const levelCounts = Object.fromEntries(
    categories.map((c) => [c.id, allLevels.filter((l) => l.category === c.id).length])
  ) as Partial<Record<CategoryType, number>>;

  // 建立分類顏色對照表
  const categoryColors = Object.fromEntries(
    categories.map((c) => [c.id, c.colorTheme])
  ) as Record<string, string>;

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
        const categoryName = t(`categories.${newlyUnlockedCategories[0].replace(/-/g, '_')}.name`);
        setToastMessage(`恭喜！解鎖新領域：${categoryName}`);

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

  // 側邊栏狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 任何 overlay 開啟時停用 zoom
  useEffect(() => {
    if (isProgressDialogOpen || isSidebarOpen || !!selectedLevel) {
      disableZoom();
    } else {
      enableZoom();
    }
  }, [isProgressDialogOpen, isSidebarOpen, selectedLevel, disableZoom, enableZoom]);

  return (
    <div className={styles.dashboard}>
      {/* 全屏垂直關卡地圖 */}
      <GraphContainer
        levels={filteredLevels}
        userProgress={userProgress}
      >
        {(level, _index, position, containerWidth) => {
          // 根據 prerequisites 繪製連線
          const prereqIds = level.prerequisites?.levelIds || [];
          const prereqType = level.prerequisites?.type || "AND";
          const isPortal = level.pathMetadata?.pathType === "portal";

          // 使用 LevelService 檢查 Portal 解鎖狀態
          const portalUnlocked =
            isPortal && isPortalUnlocked(level.id, userProgress);

          // Portal Node 點擊處理：直接跳轉到目標分類
          const handlePortalClick = () => {
            if (portalUnlocked) {
              const targetCategory = getPortalTargetCategory(level.id);
              if (targetCategory) {
                setActiveCategory(targetCategory);
              }
            }
          };

          return (
            <>
              {/* 路徑連接線 - 從每個前置關卡到當前關卡 */}
              {prereqIds.map((prereqId, prereqIndex) => {
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
                    containerWidth={containerWidth}
                    connectionType={prereqType}
                    branchLabel={prereqIndex === 0 && level.pathMetadata?.branchLabelKey ? t(`branch_labels.${level.pathMetadata.branchLabelKey}`) : undefined}
                    labelColor={prereqIndex === 0 ? categoryColors[level.category] : undefined}
                  />
                );
              })}

              {/* 節點渲染：Portal Node 或 Level Node */}
              {isPortal ? (
                <PortalNode
                  targetCategory={
                    level.pathMetadata?.targetCategory || "data-structures"
                  }
                  targetCategoryName={t(`categories.${(level.pathMetadata?.targetCategory || 'data-structures').replace(/-/g, '_')}.name`)}
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
                  categoryColor={categoryColors[level.category]}
                />
              )}

            </>
          );
        }}
      </GraphContainer>

      {/* 浮動控制面板（右上角） */}
      <div className={styles.floatingControls}>
        <Button
          variant="glass"
          size="md"
          onClick={() => setIsSidebarOpen(true)}
          icon="filter"
        >
          分類篩選
        </Button>
        <Button
          variant="glass"
          size="md"
          onClick={() => setIsProgressDialogOpen(true)}
          icon="chalkboard-user"
        >
          學習進度
        </Button>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="演算法分類"
        aria-label="演算法分類側邊欄"
      >
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          levelCounts={levelCounts}
          onCategoryChange={(category) => {
            setActiveCategory(category);
            setIsSidebarOpen(false);
          }}
        />
      </Sidebar>

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
          userProgress={getLevelProgress(selectedLevel.id, userProgress)}
          tutorialLocked={false}
          practiceLocked={
            selectedLevel.prerequisites?.type === 'AND'
              ? (selectedLevel.prerequisites?.levelIds ?? []).some(
                  (id) => userProgress.levels[id]?.status !== 'completed'
                )
              : selectedLevel.prerequisites?.type === 'OR'
              ? (selectedLevel.prerequisites?.levelIds ?? []).length > 0 &&
                (selectedLevel.prerequisites?.levelIds ?? []).every(
                  (id) => userProgress.levels[id]?.status !== 'completed'
                )
              : false // NONE = 永遠解鎖
          }
          prerequisiteInfo={selectedLevel.prerequisites}
        />
      )}

      {/* Toast 提示 */}
      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
}

function LearningDashboard() {
  return (
    <ZoomDisableProvider>
      <LearningDashboardInner />
    </ZoomDisableProvider>
  );
}

export default LearningDashboard;
