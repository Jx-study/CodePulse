# LevelNode Component

關卡節點組件，用於顯示學習路徑上的各個關卡，支援 Boss Level 特殊樣式。

## 功能

- 多種關卡狀態（locked / unlocked / in-progress / completed）
- Boss Level 特殊樣式（更大、漸層、發光）
- 星級評價顯示
- 懸浮提示標籤
- 響應式設計
- 開發狀態控制

## Props

```typescript
interface LevelNodeProps {
  level: Level;                          // 關卡資料
  status: LevelStatus;                   // 關卡狀態
  stars: number;                         // 星級評價 (0-5)
  isLocked: boolean;                     // 用戶是否解鎖
  isDeveloped: boolean;                  // 功能是否開發
  alignment: 'left' | 'right' | 'center'; // 水平對齊
  style?: React.CSSProperties;           // 自定義樣式
  onClick: () => void;                   // 點擊事件

  // v2.0 新增
  isBossLevel?: boolean;                 // 是否為 Boss Level
  pathMetadata?: PathMetadata;           // 路徑元數據
}
```

## 使用範例

### 一般關卡

```tsx
import LevelNode from '@/pages/LearningDashboard/components/LevelNode';

<LevelNode
  level={arrayLevel}
  status="unlocked"
  stars={0}
  isLocked={false}
  isDeveloped={true}
  alignment="center"
  onClick={() => openLevelDialog(arrayLevel)}
/>
```

### Boss Level

```tsx
<LevelNode
  level={doublyLinkedListLevel}
  status="unlocked"
  stars={0}
  isLocked={false}
  isDeveloped={true}
  alignment="center"
  isBossLevel={true}
  pathMetadata={{
    pathType: 'boss',
    branchLabel: 'Final Boss',
    colorTheme: '#ff6b6b'
  }}
  onClick={() => openLevelDialog(doublyLinkedListLevel)}
/>
```

### 鎖定關卡

```tsx
<LevelNode
  level={stackLevel}
  status="locked"
  stars={0}
  isLocked={true}
  isDeveloped={true}
  alignment="left"
  onClick={() => openLevelDialog(stackLevel)}
/>
```

### 未開發功能

```tsx
<LevelNode
  level={heapLevel}
  status="locked"
  stars={0}
  isLocked={true}
  isDeveloped={false}  // 未開發，無法點擊
  alignment="right"
  onClick={() => {}}
/>
```

## 關卡狀態

### locked（鎖定）
- 灰色背景
- 圓點圖示 (●)
- 無發光效果

### unlocked（已解鎖）
- 藍色漸層背景
- 圓點圖示 (●)
- 藍色發光效果

### in-progress（進行中）
- 粉紅漸層背景
- 播放圖示 (▶)
- 粉紅脈衝發光動畫

### completed（已完成）
- 綠色漸層背景
- 勾選圖示 (✓)
- 綠色發光效果
- 顯示星級評價

## Boss Level 特殊樣式

當 `isBossLevel={true}` 時：

### 視覺效果
- **更大尺寸**: Desktop 120px, Mobile 96px（一般為 80px/64px）
- **漸層背景**: 橙紅黃漸層 (#ff6b6b → #ff8c42 → #ffd93d)
- **皇冠圖示**: 👑（取代狀態圖示）
- **發光動畫**: 2.5秒脈衝循環
- **懸浮效果**: 放大至 1.1 倍（一般為 1.15 倍）

### 尺寸規格
```scss
Desktop: 120px × 120px (7.5rem)
Mobile:  96px × 96px (6rem)
Icon:    Desktop 32px, Mobile 24px
```

## 尺寸常數

組件使用統一的尺寸常數（定義於 [constants.ts](./constants.ts)）：

```typescript
// 一般關卡
LEVEL_NODE_SIZE = 80px (Desktop)
LEVEL_NODE_SIZE_MOBILE = 64px (Mobile)

// Boss Level
BOSS_NODE_SIZE = 120px (Desktop)
BOSS_NODE_SIZE_MOBILE = 96px (Mobile)

// 獲取當前半徑
getCurrentNodeRadius(isBoss?, isPortal?)
```

## 動畫效果

1. **gemPulse**: 寶石脈衝動畫（in-progress 狀態）
2. **bossPulse**: Boss Level 脈衝動畫（2.5秒循環）
3. **hover**: 懸浮放大動畫（0.3秒過渡）

## 相關組件

- [PortalNode](../PortalNode/README.md) - 傳送門節點
- [PathConnection](../PathConnection/README.md) - 路徑連線
- [LevelDialog](../LevelDialog/README.md) - 關卡詳情對話框

## 設計文件

參考 [dashboard-page-design.md](../../../../../../Note/design-docs/dashboard-page-design.md) Phase 5。
