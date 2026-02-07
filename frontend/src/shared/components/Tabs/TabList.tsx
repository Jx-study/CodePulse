import React, { useEffect } from 'react';
import Button from '@/shared/components/Button';
import styles from './Tabs.module.scss';

export interface TabConfig {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabListProps {
  tabs: TabConfig[];
  activeTab?: string;
  onChange?: (key: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  className?: string;
  tabClassName?: string;
  'aria-label'?: string;
  [key: string]: any;
}

/**
 * TabList 組件 - 純導航列表，只渲染 Tab 按鈕，不包含內容區域
 * 適合嵌入到其他組件（如 PanelHeader）中使用
 */
const TabList: React.FC<TabListProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  className = '',
  tabClassName = '',
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    onChange?.(key);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabKeys: string[]) => {
    const currentIndex = activeTab ? tabKeys.indexOf(activeTab) : 0;
    let nextIndex = currentIndex;

    const isHorizontal = orientation === 'horizontal';

    if ((isHorizontal && e.key === 'ArrowRight') || (!isHorizontal && e.key === 'ArrowDown')) {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabKeys.length;
    } else if ((isHorizontal && e.key === 'ArrowLeft') || (!isHorizontal && e.key === 'ArrowUp')) {
      e.preventDefault();
      nextIndex = currentIndex - 1 < 0 ? tabKeys.length - 1 : currentIndex - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabKeys.length - 1;
    } else {
      return;
    }

    const nextTab = tabs[nextIndex];
    if (!nextTab.disabled) {
      handleTabClick(nextTab.key);
    }
  };

  const tabListClasses = [
    styles.tabList,
    styles[variant],
    styles[size],
    styles[orientation],
    fullWidth && styles.fullWidth,
    className
  ].filter(Boolean).join(' ');

  const enabledTabKeys = tabs.filter(tab => !tab.disabled).map(tab => tab.key);

  return (
    <div
      className={tabListClasses}
      role="tablist"
      aria-label={ariaLabel || 'Tabs'}
      aria-orientation={orientation}
      onKeyDown={(e) => handleKeyDown(e, enabledTabKeys)}
      {...restProps}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        const tabClasses = [
          styles.tab,
          isActive && styles.active,
          tab.disabled && styles.disabled,
          tabClassName
        ].filter(Boolean).join(' ');

        return (
          <div
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.key}`}
            aria-disabled={tab.disabled}
            tabIndex={isActive ? 0 : -1}
          >
            <Button
              variant="ghost"
              className={tabClasses}
              onClick={() => handleTabClick(tab.key, tab.disabled)}
              disabled={tab.disabled}
              aria-label={typeof tab.label === 'string' ? tab.label : undefined}
            >
              {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
              <span className={styles.tabLabel}>{tab.label}</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(TabList);
