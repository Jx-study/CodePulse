import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import Button from "@/shared/components/Button";
import FormItem from "@/shared/components/FormItem";
import Input from "@/shared/components/Input";
import styles from "./VerifyEmail.module.scss";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setEmailError("請輸入有效的信箱");
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setEmailError("");

    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch {
      setMessage({ type: "error", text: "發送失敗，請稍後再試" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>請查收信件</h2>
          <p className={styles.subtitle}>
            若 <span className={styles.email}>{email}</span> 已在我們的系統中，您將收到一封包含驗證碼的信件。
          </p>
          <div className={styles.actions}>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/auth/reset-password", { state: { email } })}
            >
              輸入驗證碼
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate("/auth?tab=login")}
            >
              返回登入
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>忘記密碼</h2>
        <p className={styles.subtitle}>
          輸入您的註冊信箱，我們將寄送驗證碼供您重設密碼。
        </p>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormItem label="信箱" error={emailError} htmlFor="email" required>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="請輸入註冊信箱"
              hasError={!!emailError}
              disabled={loading}
              autoComplete="email"
              required
            />
          </FormItem>

          <Button type="submit" variant="primary" fullWidth disabled={loading || !email.trim()}>
            {loading ? "發送中..." : "發送驗證碼"}
          </Button>
        </form>

        <div className={styles.actions}>
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

export default ForgotPasswordPage;
