import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import type { IconProps, IconSize, IconColor, IconAnimation } from '@/types';
import styles from './Icon.module.scss';

// Re-export types for backward compatibility
export type { IconSize, IconColor, IconAnimation };

/**
 * Icon Component
 *
 * 統一的圖標組件，基於 FontAwesome
 *
 * @example
 * ```tsx
 * // 基本使用
 * <Icon name="user" />
 *
 * // 自定義尺寸和顏色
 * <Icon name="cog" size="lg" color="primary" />
 *
 * // 載入動畫
 * <Icon name="spinner" animation="spin" />
 *
 * // 帶無障礙標籤
 * <Icon name="times" ariaLabel="關閉" onClick={handleClose} />
 * ```
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'inherit',
  animation,
  className,
  ariaLabel,
  title,
  onClick,
  decorative = false,
}) => {
  // 處理 Regular 圖標的前綴
  const iconPrefix = name === 'circle' || name === 'check-circle' ? 'far' : 'fas';

  // 組合 className
  const iconClassName = classNames(
    styles.icon,
    styles[`icon--${size}`],
    styles[`icon--${color}`],
    {
      [styles['icon--clickable']]: !!onClick,
    },
    className
  );

  return (
    <span
      className={iconClassName}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-hidden={decorative || !ariaLabel}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <FontAwesomeIcon
        icon={[iconPrefix, name] as any}
        spin={animation === 'spin'}
        pulse={animation === 'pulse'}
      />
    </span>
  );
};

export default Icon;
