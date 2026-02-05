import { ReactNode } from 'react';
import styles from './PanelHeader.module.scss';
import Button from '@/shared/components/Button';

interface PanelHeaderProps {
  title: string;
  icon?: ReactNode;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  closeable?: boolean;
  onClose?: () => void;
  className?: string;
  draggable?: boolean;
  dragHandleProps?: any;
}

export function PanelHeader({
  title,
  icon,
  collapsible = false,
  isCollapsed = false,
  onToggleCollapse,
  closeable = false,
  onClose,
  className = '',
  draggable = false,
  dragHandleProps,
}: PanelHeaderProps) {
  return (
    <div className={`${styles.panelHeader} ${className} ${draggable ? styles.draggable : ''}`}>
      <div className={styles.leftSection}>
        {draggable && dragHandleProps && (
          <div
            ref={dragHandleProps.ref}
            {...(({ ref, ...rest }) => rest)(dragHandleProps)}
            className={styles.dragHandle}
          >
            <span className={styles.dragIcon}>⋮⋮</span>
          </div>
        )}
        {icon && <span className={styles.icon}>{icon}</span>}
        <h3 className={styles.title}>{title}</h3>
      </div>

      <div className={styles.actions}>
        {collapsible && (
          <Button
            variant="ghost"
            size="xs"
            icon={isCollapsed ? "chevron-up" : "chevron-down"}
            iconOnly
            className={styles.iconButton}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
            title={isCollapsed ? "展開" : "折疊"}
          />
        )}
        {closeable && (
          <Button
            variant="ghost"
            size="xs"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close panel"
            title="關閉"
            icon="times"
            iconOnly
          />
        )}
      </div>
    </div>
  );
}
