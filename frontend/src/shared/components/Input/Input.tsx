import React, { forwardRef } from 'react';
import type { InputProps } from '@/types';
import styles from './Input.module.scss';

/**
 * Input - 純粹的輸入框組件
 *
 * 特點：
 * - 只負責渲染 <input> 元素
 * - 不包含 label、error message 等外殼
 * - 支援所有標準 HTML input 屬性
 * - 使用 forwardRef 支援 ref 轉發
 *
 * 使用範例：
 * ```tsx
 * // 單獨使用
 * <Input type="email" placeholder="Enter email" />
 *
 * // 搭配 FormItem 使用
 * <FormItem label="Email" error={errors.email}>
 *   <Input name="email" hasError={!!errors.email} />
 * </FormItem>
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      name,
      value,
      placeholder,
      hasError = false,
      disabled = false,
      readOnly = false,
      required = false,
      autoComplete,
      fullWidth = true,
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
    const inputClasses = [
      styles.input,
      !fullWidth && styles.inputAuto,
      hasError && styles.inputError,
      disabled && styles.inputDisabled,
      readOnly && styles.inputReadOnly,
      className
    ].filter(Boolean).join(' ');

    return (
      <input
        ref={ref}
        type={type}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        className={inputClasses}
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

Input.displayName = 'Input';

export default React.memo(Input);
