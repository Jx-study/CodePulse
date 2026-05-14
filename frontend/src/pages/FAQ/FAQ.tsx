import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";
import PageGridBackground from "@/shared/components/PageGridBackground";
import FAQItem from "./components/FAQItem";
import styles from "./FAQ.module.scss";

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

function FAQ() {
  const { t } = useTranslation("faq");
  const [openId, setOpenId] = useState<string | null>(null);

  const data = t("items", { returnObjects: true }) as FaqEntry[];

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className={styles.faq}>
      <PageGridBackground />
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            {t("hero.title")}
            <span className={styles.heroAccent}>{t("hero.accent")}</span>
          </h1>
          <p className={styles.heroDesc}>{t("hero.desc")}</p>
          <div className={styles.heroMeta}>
            <Link to="/guide" className={styles.metaLink}>
              <Icon name="book-open" decorative />
              {t("hero.guideLink")}
            </Link>
          </div>
        </div>

        <div className={styles.list}>
          {data.map((item, index) => (
            <FAQItem
              key={item.id}
              id={item.id}
              index={index}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>

        <div className={styles.cta}>
          <Icon name="comments" decorative className={styles.ctaIcon} />
          <h3 className={styles.ctaTitle}>{t("cta.title")}</h3>
          <p className={styles.ctaDesc}>{t("cta.desc")}</p>
          <Button
            variant="primary"
            iconLeft={<Icon name="paper-plane" decorative />}
            onClick={() =>
              window.open(
                "https://forms.gle/i4ycZ9QrXQPVvCSBA",
                "_blank",
                "noopener,noreferrer",
              )
            }
            size="md"
          >
            {t("cta.button")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
