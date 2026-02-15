import React, { forwardRef } from 'react';
import type { TextareaProps } from '@/types';
import styles from './Textarea.module.scss';

/**
 * Textarea - 純粹的多行文字輸入組件
 *
 * 特點：
 * - 只負責渲染 <textarea> 元素
 * - 不包含 label、error message 等外殼
 * - 支援自動調整高度（透過 rows 控制）
 * - 使用 forwardRef 支援 ref 轉發
 *
 * 使用範例：
 * ```tsx
 * // 單獨使用
 * <Textarea placeholder="Enter description" rows={5} />
 *
 * // 搭配 FormItem 使用
 * <FormItem label="Description" error={errors.description}>
 *   <Textarea name="description" rows={4} hasError={!!errors.description} />
 * </FormItem>
 * ```
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      name,
      value,
      placeholder,
      rows = 4,
      hasError = false,
      disabled = false,
      readOnly = false,
      required = false,
      className = '',
      onChange,
      onBlur,
      onFocus,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...restProps
    },
    ref
  ) => {
    const textareaClasses = [
      styles.textarea,
      hasError && styles.textareaError,
      disabled && styles.textareaDisabled,
      readOnly && styles.textareaReadOnly,
      className
    ].filter(Boolean).join(' ');

    return (
      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        className={textareaClasses}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid ?? (hasError ? true : undefined)}
        {...restProps}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default React.memo(Textarea);
