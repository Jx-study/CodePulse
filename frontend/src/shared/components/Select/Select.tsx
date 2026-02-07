import React, { forwardRef } from 'react';
import type { SelectProps } from '@/types';
import styles from './Select.module.scss';

/**
 * Select - 純粹的下拉選擇組件
 *
 * 特點：
 * - 只負責渲染 <select> 元素
 * - 不包含 label、error message 等外殼
 * - 支援 options 陣列自動渲染選項
 * - 使用 forwardRef 支援 ref 轉發
 * - 使用原生瀏覽器下拉箭頭
 * - 支援 fullWidth 控制寬度
 *
 * 使用範例：
 * ```tsx
 * // 單獨使用（全寬）
 * <Select
 *   options={[
 *     { value: 'en', label: 'English' },
 *     { value: 'zh', label: '中文' }
 *   ]}
 *   placeholder="Select language"
 *   fullWidth
 * />
 *
 * // 在 ActionBar 中使用（自動寬度）
 * <Select
 *   options={modeOptions}
 *   fullWidth={false}
 * />
 *
 * // 搭配 FormItem 使用
 * <FormItem label="Language" error={errors.language}>
 *   <Select name="language" options={languageOptions} hasError={!!errors.language} />
 * </FormItem>
 * ```
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      name,
      value,
      placeholder,
      options = [],
      hasError = false,
      disabled = false,
      required = false,
      fullWidth = false,
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
    const selectClasses = [
      styles.select,
      !fullWidth && styles.selectAuto,
      hasError && styles.selectError,
      disabled && styles.selectDisabled,
      className
    ].filter(Boolean).join(' ');

    return (
      <select
        ref={ref}
        id={name}
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        className={selectClasses}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid ?? (hasError ? true : undefined)}
        {...restProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default React.memo(Select);
