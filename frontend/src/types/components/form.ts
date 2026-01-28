/**
 * Form Component Types
 * 表單相關組件的類型定義
 */

// ==================== FormField Component ====================
export interface FormFieldProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'checkbox' | 'select';
  name?: string;
  value?: string | number | boolean;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  rows?: number;
  options?: Array<{ value: string | number; label: string }>;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  [key: string]: any;
}

// ==================== Switch Component ====================
export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  labelPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  name?: string;
  className?: string;
  labelClassName?: string;
  'aria-label'?: string;
  [key: string]: any;
}

// ==================== Slider Component ====================
export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  onChange?: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  className?: string;
  'aria-label'?: string;
  [key: string]: any;
}