import React, { useState, useEffect } from 'react';
import type { TabsProps } from '@/types';
import Button from '@/shared/components/Button';
import styles from './Tabs.module.scss';

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
  tabListClassName = '',
  tabClassName = '',
  contentClassName = '',
  onChange,
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs.find(tab => !tab.disabled)?.key || tabs[0]?.key
  );

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setInternalActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;

    if (controlledActiveTab === undefined) {
      setInternalActiveTab(key);
    }

    onChange?.(key);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabKeys: string[]) => {
    const currentIndex = tabKeys.indexOf(activeTab);
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

  const containerClasses = [
    styles.tabs,
    styles[orientation],
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  const tabListClasses = [
    styles.tabList,
    fullWidth && styles.fullWidth,
    tabListClassName
  ].filter(Boolean).join(' ');

  const enabledTabKeys = tabs.filter(tab => !tab.disabled).map(tab => tab.key);
  const activeTabContent = tabs.find(tab => tab.key === activeTab)?.content;

  return (
    <div className={containerClasses} {...restProps}>
      <div
        className={tabListClasses}
        role="tablist"
        aria-label={ariaLabel || 'Tabs'}
        aria-orientation={orientation}
        onKeyDown={(e) => handleKeyDown(e, enabledTabKeys)}
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

      <div
        className={`${styles.tabContent} ${contentClassName}`}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTabContent}
      </div>
    </div>
  );
};

export default React.memo(Tabs);
