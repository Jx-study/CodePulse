# BranchLabel Component

分支路徑標籤組件，用於標識圖狀關卡地圖中的不同學習路徑。

## 功能

- 浮動在分支路徑上方的標籤
- 毛玻璃效果（Glassmorphism）
- 邊框顏色對應路徑主題色
- 微妙的發光效果
- 響應式設計
- 跟隨縮放（繼承父元素 transform）

## Props

```typescript
interface BranchLabelProps {
  label: string;           // 路徑名稱
  position: Point2D;       // 位置 { x: number, y: number }
  color?: string;          // 標籤顏色（預設: #635bff）
}
```

## 使用範例

### 基本用法

```tsx
import BranchLabel from '@/pages/LearningDashboard/components/BranchLabel';

<BranchLabel
  label="Sorting Path"
  position={{ x: 200, y: 150 }}
  color="#635bff"
/>
```

### 不同主題色

```tsx
// 資料結構路徑 - 藍色
<BranchLabel
  label="Data Structures"
  position={{ x: 150, y: 100 }}
  color="#635bff"
/>

// 排序路徑 - 橙色
<BranchLabel
  label="Sorting Algorithms"
  position={{ x: 350, y: 100 }}
  color="#ff8c42"
/>

// 搜尋路徑 - 綠色
<BranchLabel
  label="Search Algorithms"
  position={{ x: 550, y: 100 }}
  color="#4caf50"
/>

// 圖論路徑 - 紫色
<BranchLabel
  label="Graph Algorithms"
  position={{ x: 750, y: 100 }}
  color="#764ba2"
/>
```

### 與 GraphContainer 整合

```tsx
import BranchLabel from '@/pages/LearningDashboard/components/BranchLabel';

function GraphContainer({ levels, userProgress }) {
  // 計算分支標籤位置
  const branchLabels = useMemo(() => {
    const branches = new Map<string, { x: number, y: number }>();

    levels.forEach(level => {
      if (level.pathMetadata?.branchLabel && level.graphPosition) {
        const branchName = level.graphPosition.branch;
        if (!branches.has(branchName)) {
          // 計算該分支第一個節點上方的位置
          const position = calculateNodePosition(level);
          branches.set(branchName, {
            x: position.x,
            y: position.y - 80, // 在節點上方 80px
          });
        }
      }
    });

    return Array.from(branches.entries()).map(([branch, pos]) => {
      const level = levels.find(l => l.graphPosition?.branch === branch);
      return {
        label: level?.pathMetadata?.branchLabel || branch,
        position: pos,
        color: level?.pathMetadata?.colorTheme || '#635bff',
      };
    });
  }, [levels]);

  return (
    <div className={styles.graphContainer}>
      {/* 渲染分支標籤 */}
      {branchLabels.map((label, index) => (
        <BranchLabel
          key={`branch-${index}`}
          label={label.label}
          position={label.position}
          color={label.color}
        />
      ))}

      {/* 渲染關卡節點 */}
      {levels.map(level => (
        <LevelNode key={level.id} {...levelProps} />
      ))}
    </div>
  );
}
```

### 動態位置計算

```tsx
import { useMemo } from 'react';

function calculateBranchLabelPosition(
  branchLevels: Level[],
  layoutMap: Map<string, NodePosition>
): Point2D {
  if (branchLevels.length === 0) return { x: 0, y: 0 };

  // 找到該分支最底層（layer 最小）的節點
  const firstLevel = branchLevels.reduce((min, level) =>
    (level.graphPosition?.layer ?? 0) < (min.graphPosition?.layer ?? 0) ? level : min
  );

  const position = layoutMap.get(firstLevel.id);
  if (!position) return { x: 0, y: 0 };

  // 轉換 position.x (可能是 'calc(50% - 100px)') 為數值
  const x = resolveXPosition(position.x, containerWidth);

  return {
    x,
    y: position.y - 80, // 在第一個節點上方 80px
  };
}
```

## 視覺效果

### 毛玻璃效果（Glassmorphism）
- 半透明背景: `rgba($dark-bg-secondary, 0.85)`
- 背景模糊: `backdrop-filter: blur(12px)`
- 漸層高光: 頂部 10% 白色漸層
- 微妙發光: 邊框外 8px 模糊陰影

### 邊框與顏色
- 邊框寬度: 2px (Desktop), 1.5px (Mobile)
- 邊框顏色: 對應路徑主題色 (color prop)
- 文字顏色: 對應路徑主題色

### 陰影層次
- 主陰影: `0 4px 12px rgba(black, 0.15)`
- 輔助陰影: `0 2px 6px rgba(black, 0.1)`
- 發光效果: 模糊邊框背景 (opacity: 0.3)

## 響應式設計

### Desktop (≥1024px)
```scss
padding: 6px 12px
font-size: 14px
letter-spacing: 0.5px
border-width: 2px
```

### Tablet (768-1023px)
```scss
padding: 4px 8px
font-size: 11px
letter-spacing: 0.3px
border-width: 2px
```

### Mobile (<768px)
```scss
padding: 3px 6px
font-size: 10px
letter-spacing: 0.2px
border-width: 1.5px
```

## 位置計算建議

### 分支起點上方
```tsx
position={{
  x: branchStartX,
  y: branchStartY - 80  // 節點上方 80px
}}
```

### 分支中點
```tsx
const midY = (branchStartY + branchEndY) / 2;
position={{
  x: branchCenterX,
  y: midY - 40  // 分支中點左側 40px
}}
```

### 水平對齊多個分支
```tsx
const labelY = minLayerY - 100; // 所有分支統一高度

branches.forEach((branch, index) => (
  <BranchLabel
    label={branch.name}
    position={{
      x: startX + index * branchSpacing,
      y: labelY
    }}
    color={branch.color}
  />
));
```

## 常見主題色

```typescript
const BRANCH_COLORS = {
  'data-structures': '#635bff',  // 藍紫色
  'sorting': '#ff8c42',          // 橙色
  'searching': '#4caf50',        // 綠色
  'graph': '#764ba2',            // 深紫色
  'dynamic-programming': '#e91e63', // 粉紅色
  'greedy': '#ffc107',           // 黃色
  'divide-conquer': '#00bcd4',   // 青色
} as const;
```

## 注意事項

1. **pointer-events: none** - 標籤不阻擋滑鼠事件
2. **user-select: none** - 標籤文字不可選取
3. **transform: translate(-50%, -50%)** - 位置基於中心點
4. **z-index: 5** - 在連線 (0) 之上，節點 (10) 之下
5. **繼承縮放** - 跟隨父元素的 `transform: scale()`

## 相關組件

- [LevelNode](../LevelNode/README.md) - 關卡節點
- [PortalNode](../PortalNode/README.md) - 傳送門節點
- [PathConnection](../PathConnection/README.md) - 路徑連線

## 設計文件

參考 [dashboard-page-design.md](../../../../../../Note/design-docs/dashboard-page-design.md) Phase 5。
