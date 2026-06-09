import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PanelHeader.module.scss';
import Button from '@/shared/components/Button';
import { TabList, type TabConfig } from '@/shared/components/Tabs';

interface PanelHeaderProps {
  title: string;
  icon?: ReactNode;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  draggable?: boolean;
  dragHandleProps?: any;
  rightContent?: ReactNode;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export function PanelHeader({
  title,
  icon,
  collapsible = false,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
  draggable = false,
  dragHandleProps,
  rightContent,
  tabs,
  activeTab,
  onTabChange,
}: PanelHeaderProps) {
  const { t } = useTranslation('tutorial');

  // 如果提供了 tabs，自動構建 rightContent
  const finalRightContent = useMemo(() => {
    if (tabs && tabs.length > 0) {
      return (
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onChange={onTabChange}
          variant="minimal"
          size="sm"
        />
      );
    }
    return rightContent;
  }, [tabs, activeTab, onTabChange, rightContent]);

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

      {finalRightContent ? (
        <div className={styles.rightContent}>{finalRightContent}</div>
      ) : (
        <div className={styles.actions}>
          {collapsible && (
            <Button
              variant="ghost"
              size="xs"
              icon={isCollapsed ? "chevron-up" : "chevron-down"}
              iconOnly
              className={styles.iconButton}
              onClick={onToggleCollapse}
              aria-label={
                isCollapsed ? t('panelHeader.expandPanel') : t('panelHeader.collapsePanel')
              }
              title={isCollapsed ? t('panelHeader.expand') : t('panelHeader.collapse')}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default PanelHeader;