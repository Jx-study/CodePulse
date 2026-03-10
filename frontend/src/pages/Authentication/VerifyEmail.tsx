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
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/auth?tab=signup", { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer
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

  // Resend is not yet supported by the backend — navigate back to signup form
  const handleResend = useCallback(() => {
    navigate("/auth?tab=signup");
  }, [navigate]);

  if (!email) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t("verifyEmail.title")}</h2>
        <p className={styles.subtitle}>
          {t("verifyEmail.subtitle")}{" "}
          <span className={styles.email}>{email}</span>
        </p>

        {/* Countdown */}
        <div className={`${styles.countdown} ${isExpired ? styles.expired : ""}`}>
          {isExpired
            ? t("verifyEmail.expired")
            : t("verifyEmail.timeLeft", { minutes, seconds })}
        </div>

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
          {isExpired && (
            <Button
              variant="secondary"
              fullWidth
              disabled={resending}
              onClick={handleResend}
            >
              {resending ? t("verifyEmail.resending") : t("verifyEmail.resend")}
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
