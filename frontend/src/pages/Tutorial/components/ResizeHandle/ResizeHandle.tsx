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
}

export function ResizeHandle({
  direction = 'horizontal',
  className = '',
  onDoubleClick,
  showCollapseButton = false,
  isCollapsed = false,
  onToggleCollapse,
  collapseButtonPosition = 'end',
  collapseDirection
}: ResizeHandleProps) {

  const getCollapseIcon = () => {
    if (direction === 'horizontal') {
      // 水平排列時，如果明確指定了折疊方向
      if (collapseDirection) {
        if (isCollapsed) {
          // 折疊狀態：顯示展開的箭頭（與折疊方向相反）
          return collapseDirection === 'left' ? 'chevron-right' : 'chevron-left';
        } else {
          // 未折疊狀態：顯示折疊的箭頭（與折疊方向相同）
          return collapseDirection === 'left' ? 'chevron-left' : 'chevron-right';
        }
      }
      // 默認邏輯：向左折疊
      return isCollapsed ? 'chevron-right' : 'chevron-left';
    } else {
      // 垂直排列時，分隔線是水平的，向上折疊
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
