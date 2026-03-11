import React from 'react';
import Icon from '@/shared/components/Icon';
import Tooltip from '@/shared/components/Tooltip';
import styles from './CategoryButton.module.scss';

export interface CategoryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconName?: string;
  title: string;
  subtitle?: string;
  tooltipContent?: string;
  colorTheme?: string;
  isActive?: boolean;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  iconName,
  title,
  subtitle,
  tooltipContent,
  colorTheme = '#635bff',
  isActive = false,
  disabled = false,
  className = '',
  onClick,
  ...restProps
}) => {
  const button = (
    <button
      type="button"
      className={`${styles.categoryButton} ${isActive ? styles.active : ''} ${disabled ? styles.locked : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        '--theme-color': colorTheme,
      } as React.CSSProperties}
      {...restProps}
    >
      <div className={styles.leftContent}>
        {iconName && (
          <div className={styles.iconWrapper}>
            <Icon name={iconName} />
          </div>
        )}
        <div className={styles.textWrapper}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
      </div>
      <div className={styles.arrowIcon}>
        <Icon name="chevron-right" />
      </div>
    </button>
  );

  if (tooltipContent) {
    return (
      <Tooltip content={tooltipContent} placement="right">
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default React.memo(CategoryButton);
