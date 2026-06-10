import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/shared/contexts/AuthContext";
import authService from "@/services/authService";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";
import styles from "./VerifyEmail.module.scss";

const RESEND_COOLDOWN = 60; // seconds
const LS_KEY = "verify_email_expires_at";

const VERIFY_EMAIL_ERROR_CODES = new Set([
  "INVALID_EMAIL",
  "INVALID_OR_EXPIRED_CODE",
  "EMAIL_ALREADY_EXISTS",
  "ALREADY_VERIFIED",
  "MISSING_FIELDS",
  "RATE_LIMITED",
  "DAILY_LIMIT_EXCEEDED",
  "NO_PENDING_REGISTRATION",
  "MAIL_ERROR",
  "SERVER_ERROR",
]);

interface LocationState {
  email?: string;
}

interface ApiRequestError {
  message?: string;
  error_code?: string;
  retryAfter?: number;
}

function getApiError(error: unknown): ApiRequestError {
  return typeof error === "object" && error !== null ? error as ApiRequestError : {};
}

function calcSecondsLeft(expiresAt: string | null): number {
  if (!expiresAt) return 5 * 60;
  const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
  return Math.max(0, diff);
}

function startCountdown(
  expiresAt: string | null,
  setter: React.Dispatch<React.SetStateAction<number>>,
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
) {
  if (timerRef.current) clearInterval(timerRef.current);
  setter(calcSecondsLeft(expiresAt));
  timerRef.current = setInterval(() => {
    setter(calcSecondsLeft(expiresAt));
  }, 1000);
}

function VerifyEmailPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();

  const state = location.state as LocationState | null;
  const email = state?.email ?? "";

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    calcSecondsLeft(localStorage.getItem(LS_KEY))
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!email) {
      navigate("/auth?tab=signup", { replace: true });
    }
  }, [email, navigate]);

  // 從 localStorage 的絕對時間戳驅動倒計時，刷新後自動續算
  useEffect(() => {
    if (!email) return;
    const expiresAt = localStorage.getItem(LS_KEY);
    startCountdown(expiresAt, setSecondsLeft, timerRef);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startResendCooldown = (seconds: number) => {
    setResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev: number) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isExpired = secondsLeft === 0;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const getErrorMessage = useCallback((error: unknown) => {
    const err = getApiError(error);
    if (err.error_code && VERIFY_EMAIL_ERROR_CODES.has(err.error_code)) {
      return t(`verifyEmail.errors.${err.error_code}`);
    }
    return t("verifyEmail.errors.DEFAULT");
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setCodeError(t("verifyEmail.errors.MISSING_FIELDS"));
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    setCodeError("");

    try {
      await verifyEmail(email, code.trim().toUpperCase());
      localStorage.removeItem(LS_KEY);
      navigate("/", { replace: true });
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    setResending(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await authService.resendVerification(email);

      if (result.expires_at) {
        localStorage.setItem(LS_KEY, result.expires_at);
      }
      startCountdown(result.expires_at ?? null, setSecondsLeft, timerRef);

      setCode("");
      setCodeError("");
      if (result.remaining_attempts !== undefined) {
        setRemainingAttempts(result.remaining_attempts);
      }
      setMessage({ type: "success", text: t("verifyEmail.resendSuccess") });
      startResendCooldown(RESEND_COOLDOWN);
    } catch (error: unknown) {
      const err = getApiError(error);
      if (err.retryAfter) {
        startResendCooldown(err.retryAfter);
      }
      setMessage({ type: "error", text: getErrorMessage(error) });
    } finally {
      setResending(false);
    }
  }, [email, getErrorMessage, t]);

  if (!email) return null;

  const resendDisabled = resending || resendCooldown > 0 || remainingAttempts === 0;

  const resendLabel = resending
    ? t("verifyEmail.resending")
    : resendCooldown > 0
      ? t("verifyEmail.resendCooldown", { seconds: resendCooldown })
      : remainingAttempts === 0
        ? t("verifyEmail.resendLimitReached")
        : t("verifyEmail.resend");

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t("verifyEmail.title")}</h2>
        <p className={styles.subtitle}>
          {t("verifyEmail.subtitle")}{" "}
          <span className={styles.email}>{email}</span>
        </p>

        {/* Code expiry countdown */}
        <div className={`${styles.countdown} ${isExpired ? styles.expired : ""}`}>
          {isExpired
            ? t("verifyEmail.expired")
            : t("verifyEmail.timeLeft", { minutes, seconds })}
        </div>

        {/* Remaining attempts hint */}
        {remainingAttempts !== null && remainingAttempts > 0 && (
          <p className={styles.attemptsHint}>
            {t("verifyEmail.remainingAttempts", { count: remainingAttempts })}
          </p>
        )}

        {/* Message */}
        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormItem
            label=""
            error={codeError}
            htmlFor="code"
          >
            <Input
              type="text"
              name="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (codeError) setCodeError("");
              }}
              placeholder={t("verifyEmail.codePlaceholder")}
              hasError={!!codeError}
              disabled={loading || isExpired}
              maxLength={6}
              autoComplete="one-time-code"
            />
          </FormItem>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || isExpired || !code.trim()}
          >
            {loading ? t("verifyEmail.submitting") : t("verifyEmail.submit")}
          </Button>
        </form>

        <div className={styles.actions}>
          {(isExpired || resendCooldown > 0 || remainingAttempts !== null) && (
            <Button
              variant="secondary"
              fullWidth
              disabled={resendDisabled}
              onClick={handleResend}
            >
              {resendLabel}
            </Button>
          )}

          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate("/auth?tab=signup")}
            disabled={loading || resending}
          >
            {t("verifyEmail.backToRegister")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
