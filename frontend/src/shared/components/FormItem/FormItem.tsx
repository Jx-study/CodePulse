import React, { useState } from 'react';
import type { FormItemProps } from '@/types';
import styles from './FormItem.module.scss';

/**
 * FormItem - 現代化表單項目容器組件
 *
 * 功能特性：
 * - Label 顯示與 htmlFor 綁定
 * - 錯誤/成功狀態提示
 * - Tooltip 幫助提示
 * - 字數計數器
 * - 圖標支持
 * - Helper text 顯示
 * - 必填標記 (*)
 * - ARIA 無障礙屬性
 *
 * 使用範例：
 * ```tsx
 * <FormItem
 *   label="Email"
 *   error={errors.email}
 *   success={!errors.email && touched.email}
 *   tooltip="請輸入有效的電子郵件地址"
 *   required
 * >
 *   <Input name="email" />
 * </FormItem>
 * ```
 */
const FormItem: React.FC<FormItemProps> = ({
  label,
  error,
  success = false,
  successMessage,
  helperText,
  tooltip,
  required = false,
  disabled = false,
  htmlFor,
  children,
  className = '',
  labelClassName = '',
  errorClassName = '',
  successClassName = '',
  icon,
  iconPosition = 'left',
  maxLength,
  currentLength,
  showCharCount = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const successId = htmlFor ? `${htmlFor}-success` : undefined;
  const helperId = htmlFor ? `${htmlFor}-helper` : undefined;
  const tooltipId = htmlFor ? `${htmlFor}-tooltip` : undefined;

  const containerClasses = [
    styles.formItem,
    error && styles.hasError,
    success && !error && styles.hasSuccess,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    styles.label,
    labelClassName
  ].filter(Boolean).join(' ');

  const showCount = showCharCount && maxLength !== undefined;
  const charCount = currentLength ?? 0;
  const isOverLimit = charCount > maxLength!;

  return (
    <div className={containerClasses}>
      {/* Label with optional icon and tooltip */}
      {label && (
        <div className={styles.labelWrapper}>
          <label htmlFor={htmlFor} className={labelClasses}>
            {icon && iconPosition === 'left' && (
              <span className={styles.labelIcon}>{icon}</span>
            )}
            <span className={styles.labelText}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </span>
            {icon && iconPosition === 'right' && (
              <span className={styles.labelIcon}>{icon}</span>
            )}
          </label>

          {tooltip && (
            <div
              className={styles.tooltipContainer}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              tabIndex={0}
              role="button"
              aria-label="顯示提示信息"
            >
              <svg
                className={styles.tooltipIcon}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {showTooltip && (
                <div
                  id={tooltipId}
                  className={styles.tooltip}
                  role="tooltip"
                >
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input field */}
      <div className={styles.inputWrapper}>
        {children}
      </div>

      {/* Feedback messages and char counter */}
      <div className={styles.feedbackWrapper}>
        <div className={styles.messageContainer}>
          {/* Error message */}
          {error && (
            <span
              id={errorId}
              className={`${styles.errorMessage} ${errorClassName}`}
              role="alert"
            >
              <svg
                className={styles.messageIcon}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </span>
          )}

          {/* Success message */}
          {!error && success && successMessage && (
            <span
              id={successId}
              className={`${styles.successMessage} ${successClassName}`}
              role="status"
            >
              <svg
                className={styles.messageIcon}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {successMessage}
            </span>
          )}

          {/* Helper text */}
          {!error && !successMessage && helperText && (
            <span id={helperId} className={styles.helperText}>
              {helperText}
            </span>
          )}
        </div>

        {/* Character counter */}
        {showCount && (
          <span
            className={`${styles.charCount} ${isOverLimit ? styles.overLimit : ''}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

FormItem.displayName = 'FormItem';

export default React.memo(FormItem);
