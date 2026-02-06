import styles from "./ZoomControls.module.scss";

export interface ZoomControlsProps {
  /** 當前縮放等級 (0.5 ~ 2.0) */
  currentZoom: number;
  /** 放大回調 */
  onZoomIn: () => void;
  /** 縮小回調 */
  onZoomOut: () => void;
  /** 重置縮放回調 */
  onResetZoom: () => void;
  /** 最小縮放等級 (預設: 0.5) */
  minZoom?: number;
  /** 最大縮放等級 (預設: 2.0) */
  maxZoom?: number;
  /** 是否顯示在左下角 (預設: false，顯示在右下角) */
  positionLeft?: boolean;
}

/**
 * ZoomControls - 縮放控制組件
 *
 * 浮動的縮放按鈕，支援放大、縮小、重置功能
 * 可配置顯示位置（左下角或右下角）
 *
 * @example
 * <ZoomControls
 *   currentZoom={1.0}
 *   onZoomIn={() => setZoom(prev => Math.min(prev + 0.1, 2.0))}
 *   onZoomOut={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
 *   onResetZoom={() => setZoom(1.0)}
 *   positionLeft={true}
 * />
 */
function ZoomControls({
  currentZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minZoom = 0.5,
  maxZoom = 2.0,
  positionLeft = false,
}: ZoomControlsProps) {
  const isZoomInDisabled = currentZoom >= maxZoom;
  const isZoomOutDisabled = currentZoom <= minZoom;

  return (
    <div className={`${styles.zoomControls} ${positionLeft ? styles.left : ''}`}>
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

      {/* 縮放比例顯示 */}
      <div className={styles.zoomDisplay}>{Math.round(currentZoom * 100)}%</div>
    </div>
  );
}

export default ZoomControls;
