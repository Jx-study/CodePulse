import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import type { IconName } from '../../utils/icons';
import '../../utils/icons'; // 確保圖標庫已註冊
import styles from './Icon.module.scss';

//Icon 尺寸類型
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Icon 顏色類型
export type IconColor = 'primary' | 'secondary' | 'danger' | 'muted' | 'inherit';

// Icon 動畫類型
export type IconAnimation = 'spin' | 'pulse';

// Icon Component Props
export interface IconProps {
  /** 圖標名稱 (必填) */
  name: IconName;

  /** 圖標尺寸 (預設: md) */
  size?: IconSize;

  /** 圖標顏色 (預設: inherit) */
  color?: IconColor;

  /** 圖標動畫效果 */
  animation?: IconAnimation;

  /** 自定義 className */
  className?: string;

  /** 無障礙標籤 */
  ariaLabel?: string;

  /** Hover 提示文字 */
  title?: string;

  /** 點擊事件處理 */
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;

  /** 是否裝飾性圖標 (無語義，對螢幕閱讀器隱藏) */
  decorative?: boolean;
}

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
