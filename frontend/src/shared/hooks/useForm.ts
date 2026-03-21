import { useState, useCallback } from "react";

type ValidationRule<T> = (value: any, values: T) => string | null;
type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>>>;
type Errors<T> = Partial<Record<keyof T, string>>;
type Touched<T> = Partial<Record<keyof T, boolean>>;

export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Errors<T>;
  touched: Touched<T>;
  isSubmitting: boolean;
  /** True when no error is present for every field that has a rule. */
  isValid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  /** Write an API-level error directly to a field (e.g. "username taken"). */
  setFieldError: (field: keyof T, message: string) => void;
  /** Programmatic value update without triggering validation. */
  setValue: (field: keyof T, value: any) => void;
  reset: () => void;
}

function computeIsValid<T extends Record<string, any>>(
  errors: Errors<T>,
  touched: Touched<T>,
  rules: ValidationRules<T>
): boolean {
  const ruleKeys = Object.keys(rules) as (keyof T)[];
  return ruleKeys.every(
    (key) => touched[key] === true && !errors[key]
  );
}

function useForm<T extends Record<string, any>>(config: {
  initialValues: T;
  validationRules: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void> | void;
}): UseFormReturn<T> {
  const { initialValues, validationRules, onSubmit } = config;

  // Pre-touch fields whose initialValues are non-empty, so pre-populated
  // forms (e.g. SettingPanel) don't start with isValid = false.
  const computeInitialTouched = (): Touched<T> => {
    const result: Touched<T> = {};
    (Object.keys(validationRules) as (keyof T)[]).forEach((key) => {
      const v = initialValues[key];
      if (v !== "" && v !== null && v !== undefined) {
        result[key] = true;
      }
    });
    return result;
  };

  const computeInitialErrors = (touched: Touched<T>): Errors<T> => {
    const result: Errors<T> = {};
    (Object.keys(validationRules) as (keyof T)[]).forEach((key) => {
      if (touched[key]) {
        const err = validationRules[key]!(initialValues[key], initialValues);
        if (err) result[key] = err;
      }
    });
    return result;
  };

  const initialTouched = computeInitialTouched();
  const initialErrors = computeInitialErrors(initialTouched);

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors<T>>(initialErrors);
  const [touched, setTouched] = useState<Touched<T>>(initialTouched);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (field: keyof T, value: any, currentValues: T): string => {
      const rule = validationRules[field];
      return rule ? rule(value, currentValues) ?? "" : "";
    },
    [validationRules]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const newValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => {
        const next = { ...prev, [name]: newValue };
        if (touched[name as keyof T]) {
          const err = validateField(name as keyof T, newValue, next);
          setErrors((prevErr) => ({ ...prevErr, [name]: err }));
        }
        return next;
      });
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      setValues((prev) => {
        const err = validateField(name as keyof T, value, prev);
        setErrors((prevErr) => ({ ...prevErr, [name]: err }));
        return prev;
      });
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      // Validate all fields
      const newErrors: Errors<T> = {};
      const newTouched: Touched<T> = {};
      (Object.keys(validationRules) as (keyof T)[]).forEach((key) => {
        newTouched[key] = true;
        const err = validationRules[key]!(values[key], values);
        if (err) newErrors[key] = err;
      });
      setTouched((prev) => ({ ...prev, ...newTouched }));
      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) return;

      setIsSubmitting(true);
      Promise.resolve(onSubmit(values)).finally(() => setIsSubmitting(false));
    },
    [validationRules, values, onSubmit]
  );

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = computeIsValid(errors, touched, validationRules);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    setValue,
    reset,
  };
}

export default useForm;
