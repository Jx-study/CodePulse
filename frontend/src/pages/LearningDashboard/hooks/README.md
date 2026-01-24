# Dashboard Hooks

## useZoom Hook

縮放控制邏輯 Hook，支援 Desktop Wheel 縮放和 Mobile 按鈕縮放。

### 功能特性

- Desktop: Ctrl + Mouse Wheel 縮放
- Mobile/Tablet: 按鈕縮放
- 可配置縮放範圍 (預設 50%-200%)
- 可配置縮放步進 (預設 10%)
- 自動限制縮放範圍
- 支援自定義目標元素

### 基本用法

```tsx
import { useZoom } from '@/pages/LearningDashboard/hooks/useZoom';

function GraphContainer() {
  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useZoom({
    minZoom: 0.5,
    maxZoom: 2.0,
    initialZoom: 1.0,
    step: 0.1,
  });

  return (
    <div style={{ transform: `scale(${zoomLevel})` }}>
      {/* 圖狀地圖內容 */}
    </div>
  );
}
```

### 與 ZoomControls 整合

```tsx
import { useZoom } from '@/pages/LearningDashboard/hooks/useZoom';
import ZoomControls from '@/pages/LearningDashboard/components/ZoomControls';

function LearningDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useZoom({
    targetRef: containerRef,
    enableWheelZoom: true,
  });

  return (
    <>
      <div ref={containerRef} className={styles.dashboardContainer}>
        <div
          className={styles.graphContainer}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* 關卡地圖 */}
        </div>
      </div>

      {/* Tablet/Mobile 縮放按鈕 */}
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

### 自定義配置

```tsx
// 更大的縮放範圍
const zoom1 = useZoom({
  minZoom: 0.3,
  maxZoom: 3.0,
  step: 0.2,
});

// 僅使用按鈕縮放（禁用 Wheel）
const zoom2 = useZoom({
  enableWheelZoom: false,
});

// 從 150% 開始
const zoom3 = useZoom({
  initialZoom: 1.5,
});
```

### API 參考

#### Options

```typescript
interface UseZoomOptions {
  minZoom?: number;          // 最小縮放 (預設: 0.5)
  maxZoom?: number;          // 最大縮放 (預設: 2.0)
  initialZoom?: number;      // 初始縮放 (預設: 1.0)
  step?: number;             // 步進 (預設: 0.1)
  enableWheelZoom?: boolean; // 啟用 Wheel (預設: true)
  targetRef?: RefObject;     // 目標元素 (預設: document.body)
}
```

#### Return Value

```typescript
interface UseZoomReturn {
  zoomLevel: number;                              // 當前縮放等級
  zoomIn: () => void;                            // 放大
  zoomOut: () => void;                           // 縮小
  resetZoom: () => void;                         // 重置
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void; // 設定
}
```

### 縮放行為

#### Desktop (Ctrl + Wheel)
- 按住 Ctrl (或 Cmd on Mac) + 滾動滑鼠滾輪
- 向上滾動：放大 (+step)
- 向下滾動：縮小 (-step)
- 阻止預設的瀏覽器縮放行為

#### Mobile/Tablet (按鈕)
- 使用 ZoomControls 組件
- + 按鈕：放大
- - 按鈕：縮小
- ⟲ 按鈕：重置至 100%

### 範圍限制

縮放等級會自動限制在 `[minZoom, maxZoom]` 範圍內：

```typescript
// 縮放等級永遠不會超出範圍
setZoomLevel(10.0);  // → 2.0 (maxZoom)
setZoomLevel(-1.0);  // → 0.5 (minZoom)
zoomIn();            // 達到 maxZoom 時無效果
zoomOut();           // 達到 minZoom 時無效果
```

### 性能優化

```tsx
// 使用 useMemo 避免重複計算變換
const transform = useMemo(
  () => ({ transform: `scale(${zoomLevel})` }),
  [zoomLevel]
);

return <div style={transform}>{/* ... */}</div>;
```

### 與拖動結合

```tsx
import { useZoom } from '@/pages/LearningDashboard/hooks/useZoom';

function GraphContainer() {
  const { zoomLevel, ... } = useZoom();
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const transform = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoomLevel})`,
  };

  return <div style={transform}>{/* ... */}</div>;
}
```

### 儲存縮放狀態

```tsx
// 儲存到 LocalStorage
useEffect(() => {
  localStorage.setItem('dashboard_zoom', zoomLevel.toString());
}, [zoomLevel]);

// 從 LocalStorage 讀取
const savedZoom = parseFloat(localStorage.getItem('dashboard_zoom') || '1.0');
const { zoomLevel } = useZoom({ initialZoom: savedZoom });
```

### 注意事項

1. **Ctrl/Cmd 必須按住** - 只有在按住修飾鍵時才會縮放
2. **passive: false** - Wheel 事件監聽器設為非被動以阻止預設行為
3. **清理事件監聽器** - Hook 卸載時自動移除監聽器
4. **範圍限制** - 所有縮放操作都會自動限制在有效範圍內
5. **步進精度** - 使用小步進值 (如 0.05) 可獲得更平滑的縮放

## 相關組件

- [ZoomControls](../components/ZoomControls/README.md) - 縮放控制按鈕

## 設計文件

參考 [dashboard-page-design.md](../../../../../Note/design-docs/dashboard-page-design.md) Phase 5。
