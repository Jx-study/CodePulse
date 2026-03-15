/**
 * 基础表單驗證函數
 * 每個函數只驗證單一欄位，返回錯誤訊息或 null
 */

export const validateUsername = (value: string): string | null => {
  if (!value.trim()) return "請輸入用戶名";
  if (value.length < 3) return "用戶名至少需要3個字符";
  if (value.length > 20) return "用戶名最多20個字符";
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return "用戶名只能包含字母、數字和下劃線";
  return null;
};

export const validateEmail = (value: string): string | null => {
  if (!value.trim()) return "請輸入信箱";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "請輸入有效的信箱格式";
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) return "請輸入密碼";
  if (value.length < 6) return "密碼至少需要6個字符";
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return "密碼必須包含大小寫字母和數字";
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return "請確認密碼";
  if (password !== confirmPassword) return "密碼不一致";
  return null;
};
