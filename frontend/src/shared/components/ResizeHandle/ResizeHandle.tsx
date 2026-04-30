import { Separator } from 'react-resizable-panels';
import Button from '@/shared/components/Button';
import styles from './ResizeHandle.module.scss';

interface ResizeHandleProps {
  direction?: 'horizontal' | 'vertical';
  className?: string;
  onDoubleClick?: () => void;
  showCollapseButton?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  collapseButtonPosition?: 'start' | 'end';
  collapseDirection?: 'left' | 'right';
  'data-tour'?: string;
}

export function ResizeHandle({
  direction = 'horizontal',
  className = '',
  onDoubleClick,
  showCollapseButton = false,
  isCollapsed = false,
  onToggleCollapse,
  collapseButtonPosition = 'end',
  collapseDirection,
  'data-tour': dataTour,
}: ResizeHandleProps) {

  const getCollapseIcon = () => {
    if (direction === 'horizontal') {
      if (collapseDirection) {
        if (isCollapsed) {
          return collapseDirection === 'left' ? 'chevron-right' : 'chevron-left';
        } else {
          return collapseDirection === 'left' ? 'chevron-left' : 'chevron-right';
        }
      }
      return isCollapsed ? 'chevron-right' : 'chevron-left';
    } else {
      return isCollapsed ? 'chevron-down' : 'chevron-up';
    }
  };

  const getButtonPositionClass = () => {
    if (direction === 'horizontal') {
      return collapseButtonPosition === 'start' ? styles.buttonTop : styles.buttonBottom;
    } else {
      return collapseButtonPosition === 'start' ? styles.buttonLeft : styles.buttonRight;
    }
  };

  return (
    <Separator
      className={`${styles.resizeHandle} ${styles[direction]} ${isCollapsed ? styles.collapsed : ''} ${className}`}
      onDoubleClick={onDoubleClick}
      data-tour={dataTour}
    >
      <div className={styles.handleIndicator} />

      {showCollapseButton && (
        <div className={`${styles.buttonWrapper} ${getButtonPositionClass()}`}>
          <Button
            variant="ghost"
            size="xs"
            icon={getCollapseIcon()}
            iconOnly
            className={styles.resizeButton}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            aria-label={isCollapsed ? "展開面板" : "折疊面板"}
            title={isCollapsed ? "展開面板" : "折疊面板"}
          />
        </div>
      )}
    </Separator>
  );
}

export default ResizeHandle;
