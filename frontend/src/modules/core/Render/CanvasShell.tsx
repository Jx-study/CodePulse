import type { HTMLAttributes, ReactNode, Ref } from 'react';
import Button from '@/shared/components/Button';
import StatusLegend from '../components/StatusLegend';
import type { StatusConfig } from '@/types/statusConfig';
import styles from './CanvasShell.module.scss';

export interface CanvasShellProps {
  children: ReactNode;
  statusConfig?: StatusConfig;
  enableZoom?: boolean;
  enablePan?: boolean;
  showStatusLegend?: boolean;
  onReset: () => void;
  containerRef?: Ref<HTMLDivElement>;
  panEnabled?: boolean;
  isDragging?: boolean;
  containerEventHandlers?: Pick<
    HTMLAttributes<HTMLDivElement>,
    | 'onMouseDown'
    | 'onMouseMove'
    | 'onMouseUp'
    | 'onMouseLeave'
    | 'onTouchStart'
    | 'onTouchMove'
    | 'onTouchEnd'
  >;
}

export default function CanvasShell({
  children,
  statusConfig,
  enableZoom,
  enablePan,
  showStatusLegend = true,
  onReset,
  containerRef,
  panEnabled,
  isDragging,
  containerEventHandlers,
}: CanvasShellProps) {
  return (
    <div
      ref={containerRef}
      className={`${styles.canvasContainer} ${isDragging ? styles.dragging : ''} ${panEnabled ? styles['pan-enabled'] : ''}`}
      {...containerEventHandlers}
    >
      {children}
      {showStatusLegend && (
        <div className={styles.statusLegendContainer}>
          <StatusLegend statusConfig={statusConfig} />
        </div>
      )}
      {(enableZoom || enablePan) && (
        <div className={styles.resetButtonContainer}>
          <Button
            variant="icon"
            size="sm"
            onClick={onReset}
            aria-label="重置視圖"
            icon="rotate-right"
            iconOnly
            className={styles.resetButton}
          />
        </div>
      )}
    </div>
  );
}
