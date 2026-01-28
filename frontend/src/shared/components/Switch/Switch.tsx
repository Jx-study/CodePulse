import React from 'react';
import type { SwitchProps } from '@/types';
import styles from './Switch.module.scss';

const Switch: React.FC<SwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  label,
  labelPosition = 'right',
  size = 'md',
  disabled = false,
  loading = false,
  name,
  className = '',
  labelClassName = '',
  'aria-label': ariaLabel,
  ...restProps
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked, e);
  };

  const containerClasses = [
    styles.switchContainer,
    styles[size],
    labelPosition === 'left' && styles.labelLeft,
    disabled && styles.disabled,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  const switchClasses = [
    styles.switch,
    checked && styles.checked,
    disabled && styles.disabled,
    loading && styles.loading
  ].filter(Boolean).join(' ');

  return (
    <label className={containerClasses}>
      {label && labelPosition === 'left' && (
        <span className={`${styles.label} ${labelClassName}`}>{label}</span>
      )}

      <div className={switchClasses}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled || loading}
          className={styles.input}
          aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
          {...restProps}
        />
        <span className={styles.slider}>
          <span className={styles.thumb} />
        </span>
      </div>

      {label && labelPosition === 'right' && (
        <span className={`${styles.label} ${labelClassName}`}>{label}</span>
      )}
    </label>
  );
};

export default React.memo(Switch);
