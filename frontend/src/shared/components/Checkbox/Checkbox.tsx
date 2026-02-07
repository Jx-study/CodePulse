import React, { forwardRef } from 'react';
import type { CheckboxProps } from '@/types';
import styles from './Checkbox.module.scss';

/**
 * Checkbox - 核取方塊組件
 *
 * 特點：
 * - 自帶 label（因為 checkbox 的佈局特殊）
 * - 支援錯誤狀態和 helper text
 * - Label 位置可自訂（左/右）
 * - 使用 forwardRef 支援 ref 轉發
 *
 * 使用範例：
 * ```tsx
 * <Checkbox
 *   name="terms"
 *   label="我同意服務條款"
 *   checked={agreed}
 *   onChange={(e) => setAgreed(e.target.checked)}
 *   error={errors.terms}
 * />
 * ```
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      name,
      label,
      checked,
      defaultChecked,
      labelPosition = 'right',
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      labelClassName = '',
      errorClassName = '',
      onChange,
      onBlur,
      onFocus,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...restProps
    },
    ref
  ) => {
    const fieldId = name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    const containerClasses = [
      styles.checkboxContainer,
      error && styles.hasError,
      disabled && styles.disabled,
      className
    ].filter(Boolean).join(' ');

    const labelClasses = [
      styles.checkboxLabel,
      labelPosition === 'left' && styles.labelLeft,
      labelClassName
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses}>
        <label htmlFor={fieldId} className={labelClasses}>
          <input
            ref={ref}
            type="checkbox"
            id={fieldId}
            name={name}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            required={required}
            className={styles.checkbox}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
            aria-describedby={[
              error && errorId,
              helperText && helperId,
              ariaDescribedBy
            ].filter(Boolean).join(' ') || undefined}
            aria-invalid={error ? true : undefined}
            {...restProps}
          />
          {label && (
            <span className={styles.checkboxText}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </span>
          )}
        </label>

        {error && (
          <span id={errorId} className={`${styles.errorMessage} ${errorClassName}`} role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default React.memo(Checkbox);
