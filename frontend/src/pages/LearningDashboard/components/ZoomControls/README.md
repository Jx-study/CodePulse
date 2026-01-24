# ZoomControls Component

浮動縮放控制按鈕，僅在 Tablet/Mobile 顯示。Desktop 使用 Ctrl + Scroll 進行縮放。

## 功能

- 浮動在右下角
- 顯示當前縮放百分比
- 三個控制按鈕（+/-/⟲）
- 毛玻璃效果（Glassmorphism）
- 按鈕禁用狀態
- 僅在 Tablet/Mobile 顯示
- 響應式設計

## Props

```typescript
interface ZoomControlsProps {
  currentZoom: number;       // 當前縮放等級 (0.5 - 2.0)
  onZoomIn: () => void;      // 放大回調
  onZoomOut: () => void;     // 縮小回調
  onResetZoom: () => void;   // 重置回調
}
```

## 使用範例

### 基本用法

```tsx
import ZoomControls from '@/pages/LearningDashboard/components/ZoomControls';
import { useZoom } from '@/pages/LearningDashboard/hooks/useZoom';

function LearningDashboard() {
  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useZoom();

  return (
    <>
      {/* 圖狀地圖 */}
      <div style={{ transform: `scale(${zoomLevel})` }}>
        {/* ... */}
      </div>

      {/* 縮放控制（僅 Tablet/Mobile 顯示） */}
      <ZoomControls
        currentZoom={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />
    </>
  );
}
```

### 完整範例（含 useZoom Hook）

```tsx
import { useRef } from 'react';
import { useZoom } from '@/pages/LearningDashboard/hooks/useZoom';
import ZoomControls from '@/pages/LearningDashboard/components/ZoomControls';

function GraphContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useZoom({
    minZoom: 0.5,
    maxZoom: 2.0,
    initialZoom: 1.0,
    step: 0.1,
    targetRef: containerRef,
  });

  return (
    <div ref={containerRef} className={styles.dashboard}>
      {/* 縮放容器 */}
      <div
        className={styles.zoomableContent}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        {/* 關卡地圖內容 */}
      </div>

      {/* 縮放控制按鈕 */}
      <ZoomControls
        currentZoom={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />
    </div>
  );
}
```

## 按鈕功能

### Zoom In (+)
- 點擊放大 (增加 step 值)
- 達到 `MAX_ZOOM` (200%) 時禁用
- 顯示提示：「放大 (Zoom In)」

### Zoom Out (−)
- 點擊縮小 (減少 step 值)
- 達到 `MIN_ZOOM` (50%) 時禁用
- 顯示提示：「縮小 (Zoom Out)」

### Reset (⟲)
- 重置縮放至 100%
- 永不禁用
- 顯示提示：「重置縮放 (100%)」

## 顯示邏輯

### Desktop (≥1024px)
- **不顯示** ZoomControls
- 使用 Ctrl + Scroll 縮放

### Tablet (768-1023px)
- **顯示** ZoomControls
- 位置：右下角，距離邊緣 16px

### Mobile (<768px)
- **顯示** ZoomControls
- 位置：右下角，距離邊緣 12px
- 按鈕稍微縮小

## 視覺效果

### 縮放顯示區
- 背景：半透明深色 + 背景模糊
- 邊框：白色半透明
- 陰影：大陰影效果
- 字體：14px 粗體 (Mobile: 12px)
- 最小寬度：60px (Mobile: 52px)

### 按鈕樣式
- 尺寸：48px × 48px (Mobile: 44px × 44px)
- 背景：毛玻璃效果
- 邊框：白色半透明
- 圖示：白色，20px (Mobile: 16px)

### 懸浮效果
- 放大至 1.05 倍
- 邊框變為藍色
- 發光效果（藍色陰影）

### 按下效果
- 縮小至 0.95 倍
- 陰影減弱

### 禁用狀態
- 不透明度：40%
- 禁用游標
- 背景變淺
- 無法點擊

## 響應式設計

### Desktop (≥1024px)
```scss
display: none;  // 完全隱藏
```

### Tablet (768-1023px)
```scss
display: flex;
right: 16px;
bottom: 16px;
button: 48px × 48px
```

### Mobile (<768px)
```scss
display: flex;
right: 12px;
bottom: 12px;
button: 44px × 44px
font-size: 12px
```

## 可訪問性

### ARIA 屬性
- `aria-label`: 按鈕功能描述
- `title`: 懸浮提示

### 鍵盤支援
- 可使用 Tab 鍵聚焦
- 可使用 Enter/Space 觸發

### 禁用狀態
- `disabled` 屬性正確設定
- 視覺提示清晰

## 常見問題

### Q: 為什麼 Desktop 不顯示？
Desktop 使用 Ctrl + Scroll 縮放，更符合操作習慣。按鈕僅在觸控裝置顯示。

### Q: 如何自定義位置？
修改 SCSS 中的 `right` 和 `bottom` 值：

```scss
.zoomControls {
  right: $custom-spacing;
  bottom: $custom-spacing;
}
```

### Q: 如何自定義縮放範圍？
在 useZoom Hook 中配置：

```tsx
const { zoomLevel, ... } = useZoom({
  minZoom: 0.3,  // 30%
  maxZoom: 3.0,  // 300%
});
```

### Q: 按鈕會遮擋內容嗎？
按鈕位於 `z-index: 1000`，通常不會遮擋。如有問題，可調整 `right` 或 `bottom` 值。

## 樣式自定義

### 自定義顏色

```scss
// 自定義主題色
.zoomButton {
  &:hover:not(:disabled) {
    border-color: rgba($custom-color, 0.5);
    box-shadow: 0 0 12px rgba($custom-color, 0.3);
  }
}
```

### 自定義尺寸

```scss
.zoomButton {
  width: 56px;
  height: 56px;
  font-size: 24px;
}
```

## 相關組件與 Hook

- [useZoom Hook](../../hooks/README.md) - 縮放邏輯


## 設計文件

參考 [dashboard-page-design.md](../../../../../../Note/design-docs/dashboard-page-design.md) Phase 5。
