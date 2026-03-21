import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/shared/contexts/AuthContext";
import authService from "@/services/authService";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";
import styles from "./VerifyEmail.module.scss";

const EXPIRY_SECONDS = 5 * 60; // 5 minutes
const RESEND_COOLDOWN = 60; // seconds

interface LocationState {
  email?: string;
}

function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();

  const email = (location.state as LocationState)?.email ?? "";

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/auth?tab=signup", { replace: true });
    }
  }, [email, navigate]);

  // Code expiry countdown
  useEffect(() => {
    if (!email) return;

    setSecondsLeft(EXPIRY_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email]);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = (seconds: number) => {
    setResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
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
      navigate("/", { replace: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("verifyEmail.errors.DEFAULT");
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    setResending(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await authService.resendVerification(email);

      // Reset code expiry countdown
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(EXPIRY_SECONDS);
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setCode("");
      setCodeError("");
      if (result.remaining_attempts !== undefined) {
        setRemainingAttempts(result.remaining_attempts);
      }
      setMessage({ type: "success", text: t("verifyEmail.resendSuccess") });
      startCooldown(RESEND_COOLDOWN);
    } catch (error: unknown) {
      const err = error as Error & { retryAfter?: number };
      if (err.retryAfter) {
        startCooldown(err.retryAfter);
      }
      setMessage({ type: "error", text: err.message || t("verifyEmail.errors.DEFAULT") });
    } finally {
      setResending(false);
    }
  }, [email, t]);

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
