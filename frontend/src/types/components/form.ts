/**
 * Form Component Types
 * 表單相關組件的類型定義
 */

// ==================== FormItem Component ====================
export interface FormItemProps {
  label?: string;
  error?: string;
  success?: boolean;
  successMessage?: string;
  helperText?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  successClassName?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  maxLength?: number;
  currentLength?: number;
  showCharCount?: boolean;
}

// ==================== Input Component ====================
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';
  name?: string;
  value?: string | number;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoComplete?: string;
  fullWidth?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

// ==================== Select Component ====================
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  name?: string;
  value?: string | number;
  placeholder?: string;
  options?: SelectOption[];
  hasError?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

// ==================== Textarea Component ====================
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  name?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  hasError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

// ==================== Checkbox Component ====================
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  name?: string;
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  labelPosition?: 'left' | 'right';
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// ==================== FormField Component (DEPRECATED) ====================
/**
 * @deprecated 請使用 FormItem + Input/Select/Textarea/Checkbox 的組合
 *
 * 舊寫法：
 * <FormField type="text" label="Email" error={errors.email} />
 *
 * 新寫法：
 * <FormItem label="Email" error={errors.email}>
 *   <Input name="email" hasError={!!errors.email} />
 * </FormItem>
 */
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