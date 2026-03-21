import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "@/services/authService";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";
import styles from "./VerifyEmail.module.scss";

const EXPIRY_SECONDS = 10 * 60;

interface LocationState {
  email?: string;
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState)?.email ?? "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);

  useEffect(() => {
    if (!email) {
      navigate("/auth/forgot-password", { replace: true });
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [email, navigate]);

  if (!email) return null;

  const isExpired = secondsLeft === 0;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!code.trim() || !/^[A-Za-z0-9]{6}$/.test(code.trim())) {
      newErrors.code = "驗證碼為 6 位英數字";
    }
    if (newPassword.length < 6) {
      newErrors.newPassword = "密碼至少需要6個字符";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "兩次輸入的密碼不一致";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setErrors({});

    try {
      await authService.resetPassword(email, code.trim().toUpperCase(), newPassword);
      setMessage({ type: "success", text: "密碼已重設，請重新登入" });
      setTimeout(() => navigate("/auth?tab=login", { replace: true }), 1500);
    } catch (error) {
      const err = error as Error & { errorCode?: string };
      if (err.errorCode === "INVALID_CODE") {
        setErrors({ code: "驗證碼錯誤或已過期" });
      } else if (err.errorCode === "NO_LOCAL_ACCOUNT") {
        setMessage({ type: "error", text: "此帳號未設定密碼，請使用 Google 登入" });
      } else {
        setMessage({ type: "error", text: err.message || "重設失敗，請稍後再試" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>重設密碼</h2>
        <p className={styles.subtitle}>
          驗證碼已寄至 <span className={styles.email}>{email}</span>
        </p>

        <div className={`${styles.countdown} ${isExpired ? styles.expired : ""}`}>
          {isExpired ? "驗證碼已過期" : `剩餘時間：${minutes}:${seconds}`}
        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormItem label="驗證碼" error={errors.code} htmlFor="code" required>
            <Input
              type="text"
              name="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (errors.code) setErrors((p) => ({ ...p, code: "" }));
              }}
              placeholder="請輸入 6 位驗證碼"
              hasError={!!errors.code}
              disabled={loading || isExpired}
              maxLength={6}
              autoComplete="one-time-code"
            />
          </FormItem>

          <FormItem label="新密碼" error={errors.newPassword} htmlFor="newPassword" required>
            <div style={{ position: "relative" }}>
              <Input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: "" }));
                }}
                placeholder="至少 6 個字符"
                hasError={!!errors.newPassword}
                disabled={loading || isExpired}
                autoComplete="new-password"
                style={{ paddingRight: "40px" }}
              />
              <div style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)" }}>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  icon={showPassword ? "eye" : "eye-off"}
                  iconOnly
                  aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                  tabIndex={-1}
                />
              </div>
            </div>
          </FormItem>

          <FormItem label="確認新密碼" error={errors.confirmPassword} htmlFor="confirmPassword" required>
            <Input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              placeholder="再次輸入新密碼"
              hasError={!!errors.confirmPassword}
              disabled={loading || isExpired}
              autoComplete="new-password"
            />
          </FormItem>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || isExpired || !code.trim() || !newPassword || !confirmPassword}
          >
            {loading ? "重設中..." : "確認重設密碼"}
          </Button>
        </form>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate("/auth/forgot-password")}
            disabled={loading}
          >
            重新發送驗證碼
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate("/auth?tab=login")}
            disabled={loading}
          >
            返回登入
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
