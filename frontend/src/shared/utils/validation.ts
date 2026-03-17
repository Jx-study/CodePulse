import type { TFunction } from "i18next";

/**
 * 基础表單驗證函數
 * 每個函數只驗證單一欄位，返回錯誤訊息或 null
 */

export const validateLoginIdentifier = (value: string, t: TFunction): string | null => {
  if (!value.trim()) return t("validation.loginIdentifier.required");
  return null;
};

export const validateUsername = (value: string, t: TFunction): string | null => {
  if (!value.trim()) return t("validation.username.required");
  if (value.length < 3) return t("validation.username.min");
  if (value.length > 15) return t("validation.username.max");
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return t("validation.username.invalid");
  return null;
};

export const validateEmail = (value: string, t: TFunction): string | null => {
  if (!value.trim()) return t("validation.email.required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t("validation.email.invalid");
  return null;
};

/**
 * Strong password rule used for signup and password change.
 * Requirements: 8–20 chars, uppercase, lowercase, digit, allowed symbol.
 * Allowed symbols: !@#$%^&*_-+=.,?
 * Disallowed: <>"'\`;
 */
export const validatePassword = (value: string, t: TFunction): string | null => {
  if (!value) return t("validation.password.required");
  if (value.length < 8) return t("validation.password.min");
  if (value.length > 20) return t("validation.password.max");
  if (!/[A-Z]/.test(value)) return t("validation.password.uppercase");
  if (!/[a-z]/.test(value)) return t("validation.password.lowercase");
  if (!/[0-9]/.test(value)) return t("validation.password.digit");
  if (!/[!@#$%^&*_\-+=.,?]/.test(value)) return t("validation.password.symbol");
  if (!/^[a-zA-Z0-9!@#$%^&*_\-+=.,?]+$/.test(value)) return t("validation.password.invalid_chars");
  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
  t: TFunction
): string | null => {
  if (!confirmPassword) return t("validation.confirmPassword.required");
  if (password !== confirmPassword) return t("validation.confirmPassword.mismatch");
  return null;
};

export const validateDisplayName = (value: string, t: TFunction): string | null => {
  if (!value.trim()) return t("validation.displayName.required");
  if (value.length > 30) return t("validation.displayName.max");
  return null;
};

export const validateOldPassword = (value: string, t: TFunction): string | null => {
  if (!value) return t("validation.oldPassword.required");
  return null;
};
