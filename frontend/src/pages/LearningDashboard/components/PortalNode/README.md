# PortalNode Component

傳送門節點組件，用於 Multi-Graph 架構中的 Category 切換。

## 功能

- 傳送門圖示（🚪）與發光動畫
- 色相旋轉效果（彩虹漸變）
- 解鎖/鎖定狀態視覺區分
- 懸浮提示標籤
- 響應式設計

## Props

```typescript
interface PortalNodeProps {
  targetCategory: AlgorithmCategory;    // 目標 Category ID
  targetCategoryName: string;           // 目標 Category 名稱（顯示用）
  isUnlocked: boolean;                  // 是否解鎖（完成 Boss Level）
  position: NodePosition;               // 節點位置
  onClick: () => void;                  // 點擊事件
}
```

## 使用範例

### 基本用法

```tsx
import PortalNode from '@/pages/LearningDashboard/components/PortalNode';

<PortalNode
  targetCategory="sorting"
  targetCategoryName="排序演算法"
  isUnlocked={true}
  position={{
    x: 'calc(50% - 100px)',
    y: 200,
    alignment: 'center'
  }}
  onClick={() => {
    // 跳轉到下一個 Graph
    navigate('/dashboard?category=sorting');
  }}
/>
```

### 與 LevelNode 一起使用（完整 Graph）

```tsx
import LevelNode from '@/pages/LearningDashboard/components/LevelNode';
import PortalNode from '@/pages/LearningDashboard/components/PortalNode';

function GraphContainer({ levels, userProgress }) {
  return (
    <div className={styles.graphContainer}>
      {/* 渲染一般關卡 */}
      {levels
        .filter(level => !level.pathMetadata?.isPortalNode)
        .map(level => (
          <LevelNode
            key={level.id}
            level={level}
            status={getLevelStatus(level, userProgress)}
            stars={userProgress.levels[level.id]?.stars || 0}
            isLocked={!isLevelUnlocked(level, userProgress)}
            isDeveloped={level.isDeveloped}
            isBossLevel={level.pathMetadata?.pathType === 'boss'}
            pathMetadata={level.pathMetadata}
            // ... 其他 props
          />
        ))}

      {/* 渲染 Portal Node */}
      {levels
        .filter(level => level.pathMetadata?.isPortalNode)
        .map(level => {
          const isBossCompleted = checkBossCompleted(userProgress);
          return (
            <PortalNode
              key={level.id}
              targetCategory={level.pathMetadata.targetCategory}
              targetCategoryName={getCategoryName(level.pathMetadata.targetCategory)}
              isUnlocked={isBossCompleted}
              // ... 其他 props
            />
          );
        })}
    </div>
  );
}
```

## 視覺效果

### 已解鎖狀態
- 紫色漸層背景 (紫藍 → 紫紅)
- 發光動畫（脈衝效果）
- 色相旋轉動畫（8秒循環）
- 懸浮時放大 1.15 倍
- 提示：「前往 {目標名稱}」

### 鎖定狀態
- 灰色背景
- 無動畫效果
- 鎖定圖示覆蓋
- 提示：「🔒 完成 Boss Level 以解鎖」

## 尺寸規格

- Desktop: 100px × 100px (6.25rem)
- Mobile: 80px × 80px (5rem)
- 圖示: Desktop 40px, Mobile 32px

## 動畫效果

1. **portalGlow**: 發光脈衝動畫（3秒循環）
2. **portalHue**: 色相旋轉動畫（8秒循環）
3. **portalFloat**: 圖示浮動動畫（3秒循環，上下 4px）

## 相關組件

- [LevelNode](../LevelNode/README.md) - 一般關卡節點
- [PathConnection](../PathConnection/README.md) - 路徑連線
- [BranchLabel](../BranchLabel/README.md) - 分支標籤

## 設計文件

參考 [dashboard-page-design.md](../../../../../../Note/design-docs/dashboard-page-design.md) Phase 5。
