import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './LearningDashboard.module.scss';

// 組件導入
import ProgressStatsModal from './components/ProgressStatsModal/ProgressStatsModal';
import CategoryFilter from './components/CategoryFilter/CategoryFilter';
import VerticalLevelMap from './components/VerticalLevelMap/VerticalLevelMap';
import LevelNode from './components/LevelNode/LevelNode';
import PathConnection from './components/PathConnection/PathConnection';
import LevelDialog from './components/LevelDialog/LevelDialog';

// 資料導入
import { MOCK_LEVELS, loadUserProgress, saveUserProgress } from './mockData';
import { calculateNodePosition } from './components/VerticalLevelMap/utils/positionCalculator';
import type { Level, UserProgress } from '@/types';

function LearningDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [userProgress, setUserProgress] = useState<UserProgress>(loadUserProgress());
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // 計算解鎖狀態（線性邏輯）
  const levelsWithUnlockStatus = MOCK_LEVELS.map((level, index) => {
    if (index === 0) {
      return { ...level, isUnlocked: true }; // 第一關預設解鎖
    }
    const previousLevel = MOCK_LEVELS[index - 1];
    const previousLevelProgress = userProgress.levels[previousLevel.id];
    const isPreviousCompleted = previousLevelProgress?.status === 'completed';
    return { ...level, isUnlocked: isPreviousCompleted };
  });

  // 過濾關卡（按分類）
  const filteredLevels = activeCategory === 'all'
    ? levelsWithUnlockStatus
    : levelsWithUnlockStatus.filter(level => level.category === activeCategory);

  // 計算進度統計
  const totalLevels = MOCK_LEVELS.length;
  const completedLevels = Object.values(userProgress.levels).filter(
    (progress) => progress.status === 'completed'
  ).length;
  const totalStars = totalLevels * 3;
  const earnedStars = Object.values(userProgress.levels).reduce(
    (sum, progress) => sum + progress.stars,
    0
  );
  const completionRate = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

  // 更新 URL 參數
  useEffect(() => {
    if (activeCategory !== 'all') {
      setSearchParams({ category: activeCategory });
    } else {
      setSearchParams({});
    }
  }, [activeCategory, setSearchParams]);

  // 自動打開指定的 Level Dialog（從 URL 參數讀取 levelId）
  useEffect(() => {
    const levelId = searchParams.get('levelId');

    // 只在第一次載入時自動打開，避免重複觸發
    if (levelId && !hasAutoOpened) {
      const targetLevel = levelsWithUnlockStatus.find(level => level.id === levelId);

      if (targetLevel) {
        // 只有已開發的關卡才能打開
        if (targetLevel.isDeveloped) {
          setSelectedLevel(targetLevel);
          setHasAutoOpened(true);

          // 滾動到對應的關卡節點（延遲執行以確保 DOM 已渲染）
          setTimeout(() => {
            const levelElement = document.querySelector(`[data-level-id="${levelId}"]`);
            if (levelElement) {
              levelElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          }, 300);

          // 清除 URL 參數，避免刷新頁面時重複打開
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('levelId');
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
      const updatedProgress = {
        ...userProgress,
        levels: {
          ...userProgress.levels,
          [selectedLevel.id]: {
            ...userProgress.levels[selectedLevel.id],
            status: 'in-progress' as const
          }
        }
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
      <VerticalLevelMap
        levels={filteredLevels}
        userProgress={userProgress}
      >
          {(level, index, position) => (
            <>
              {/* 路徑連接線 */}
              {index > 0 && (
                <PathConnection
                  fromNode={calculateNodePosition(index - 1, filteredLevels.length)}
                  toNode={position}
                  isCompleted={userProgress.levels[level.id]?.status === 'completed'}
                />
              )}

              {/* 關卡節點 */}
              <LevelNode
                level={level}
                status={
                  level.isUnlocked
                    ? userProgress.levels[level.id]?.status || 'unlocked'
                    : 'locked'
                }
                stars={userProgress.levels[level.id]?.stars || 0}
                isLocked={!level.isUnlocked}      // 用戶解鎖狀態（控制 Practice 按鈕）
                isDeveloped={level.isDeveloped}   // 功能開發狀態（控制節點能否點擊）
                position={position.position}
                style={{
                  position: 'absolute',
                  left: position.x,
                  top: `${position.y}px`
                }}
                onClick={() => handleLevelClick(level)}
              />
            </>
          )}
        </VerticalLevelMap>

      {/* 浮動控制面板（右上角） */}
      <div className={styles.floatingControls}>
        <button
          className={`${styles.controlButton} ${styles.categoryButton}`}
          onClick={() => setIsSidebarOpen(true)}
        >
          分類篩選
        </button>
        <button
          className={styles.controlButton}
          onClick={() => setIsProgressModalOpen(true)}
        >
          學習進度
        </button>
      </div>

      {/* 分類側邊欄 */}
      <div className={`${styles.categorySidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>演算法分類</h2>
          <button
            className={styles.closeButton}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="關閉側邊欄"
          >
            ✕
          </button>
        </div>
        <div className={styles.sidebarContent}>
          <CategoryFilter
            categories={['all', 'sorting', 'searching', 'graph', 'dynamic-programming', 'data-structures']}
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
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.visible : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* 進度統計彈窗 */}
      <ProgressStatsModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        totalLevels={totalLevels}
        completedLevels={completedLevels}
        totalStars={totalStars}
        earnedStars={earnedStars}
        completionRate={completionRate}
      />

      {/* 關卡詳細資訊彈窗 */}
      {selectedLevel && (
        <LevelDialog
          level={selectedLevel}
          isOpen={!!selectedLevel}
          onClose={() => setSelectedLevel(null)}
          onStartTutorial={handleStartTutorial}
          onStartPractice={handleStartPractice}
          userProgress={userProgress.levels[selectedLevel.id]}
          isLocked={!selectedLevel.isUnlocked}
        />
      )}
    </div>
  );
}

export default LearningDashboard;
