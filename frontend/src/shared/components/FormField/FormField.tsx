import React, { forwardRef } from 'react';
import type { FormFieldProps } from '@/types';
import styles from './FormField.module.scss';

const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormFieldProps>(
  (
    {
      label,
      type = 'text',
      name,
      value,
      placeholder,
      error,
      helperText,
      required = false,
      disabled = false,
      readOnly = false,
      autoComplete,
      rows = 4,
      options = [],
      className = '',
      labelClassName = '',
      inputClassName = '',
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
    const fieldId = name || `field-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    const containerClasses = [
      styles.formField,
      type === 'checkbox' && styles.checkboxField,
      error && styles.hasError,
      disabled && styles.disabled,
      className
    ].filter(Boolean).join(' ');

    const inputClasses = [
      styles.input,
      error && styles.inputError,
      inputClassName
    ].filter(Boolean).join(' ');

    const renderInput = () => {
      const commonProps = {
        id: fieldId,
        name,
        value: type === 'checkbox' ? undefined : (value as string | number),
        checked: type === 'checkbox' ? (value as boolean) : undefined,
        placeholder,
        required,
        disabled,
        readOnly,
        autoComplete,
        onChange,
        onBlur,
        onFocus,
        'aria-label': ariaLabel || label,
        'aria-describedby': [
          error && errorId,
          helperText && helperId,
          ariaDescribedBy
        ].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
        ...restProps
      };

      if (type === 'textarea') {
        return (
          <textarea
            {...commonProps}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={inputClasses}
            rows={rows}
          />
        );
      }

      if (type === 'select' && options.length > 0) {
        return (
          <select
            {...commonProps}
            ref={ref as React.Ref<HTMLSelectElement>}
            className={inputClasses}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(
              (option: NonNullable<FormFieldProps["options"]>[number]) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )
            )}
          </select>
        );
      }

      if (type === 'checkbox') {
        return (
          <input
            {...commonProps}
            ref={ref as React.Ref<HTMLInputElement>}
            type="checkbox"
            className={styles.checkbox}
          />
        );
      }

      return (
        <input
          {...commonProps}
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          className={inputClasses}
        />
      );
    };

    if (type === 'checkbox') {
      return (
        <div className={containerClasses}>
          <label htmlFor={fieldId} className={styles.checkboxLabel}>
            {renderInput()}
            <span className={styles.checkboxText}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </span>
          </label>
          {error && (
            <span id={errorId} className={`${styles.errorMessage} ${errorClassName}`}>
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

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={fieldId} className={`${styles.label} ${labelClassName}`}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        {renderInput()}
        {error && (
          <span id={errorId} className={`${styles.errorMessage} ${errorClassName}`}>
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

FormField.displayName = 'FormField';

export default React.memo(FormField);
