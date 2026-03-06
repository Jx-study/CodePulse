import type { ButtonProps } from '@/types';
import Icon from '@/shared/components/Icon';
import styles from './Button.module.scss';

function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  icon,
  iconOnly = false,
  type = 'button',
  onClick,
  className = '',
  children,
  'aria-label': ariaLabel,
  ...restProps
}: ButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'primaryOutline':
        return styles.primaryOutline;
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      case 'icon':
        return styles.icon;
      case 'dot':
        return styles.dot;
      case 'glass':
        return styles.glass;
      default:
        return styles.primary;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'xs':
        return styles.xs;
      case 'sm':
        return styles.sm;
      case 'lg':
        return styles.lg;
      case 'md':
      default:
        return styles.md;
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const buttonClasses = [
    styles.button,
    getVariantClass(),
    getSizeClass(),
    disabled && styles.disabled,
    loading && styles.loading,
    fullWidth && styles.fullWidth,
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSpinner = () => <span className={styles.spinner} />;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled}
      {...restProps}
    >
      {loading && renderSpinner()}
      {!loading && icon && <Icon name={icon} />}
      {!loading && iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {!iconOnly && children && <span className={styles.content}>{children}</span>}
      {!loading && iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
}

export default Button;
