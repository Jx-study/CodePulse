import styles from './ZoomControls.module.scss';
import type { ZoomControlsProps } from '@/types/pages/dashboard';

/**
 * ZoomControls - 縮放控制組件
 *
 * 浮動在右下角的縮放按鈕，僅在 Tablet/Mobile 顯示
 * Desktop 使用 Ctrl + Scroll 進行縮放
 *
 * @example
 * <ZoomControls
 *   currentZoom={1.0}
 *   onZoomIn={() => setZoom(prev => Math.min(prev + 0.1, 2.0))}
 *   onZoomOut={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
 *   onResetZoom={() => setZoom(1.0)}
 * />
 */
function ZoomControls({
  currentZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ZoomControlsProps) {
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.0;

  const isZoomInDisabled = currentZoom >= MAX_ZOOM;
  const isZoomOutDisabled = currentZoom <= MIN_ZOOM;
  const zoomPercentage = Math.round(currentZoom * 100);

  return (
    <div className={styles.zoomControls}>
      {/* 顯示當前縮放百分比 */}
      <div className={styles.zoomDisplay}>
        {zoomPercentage}%
      </div>

      {/* 縮放按鈕組 */}
      <div className={styles.buttonGroup}>
        {/* Zoom In 按鈕 */}
        <button
          className={styles.zoomButton}
          onClick={onZoomIn}
          disabled={isZoomInDisabled}
          aria-label="放大"
          title="放大 (Zoom In)"
        >
          <span className={styles.icon}>+</span>
        </button>

        {/* Zoom Out 按鈕 */}
        <button
          className={styles.zoomButton}
          onClick={onZoomOut}
          disabled={isZoomOutDisabled}
          aria-label="縮小"
          title="縮小 (Zoom Out)"
        >
          <span className={styles.icon}>−</span>
        </button>

        {/* Reset 按鈕 */}
        <button
          className={styles.zoomButton}
          onClick={onResetZoom}
          aria-label="重置縮放"
          title="重置縮放 (100%)"
        >
          <span className={styles.icon}>⟲</span>
        </button>
      </div>
    </div>
  );
}

export default ZoomControls;
