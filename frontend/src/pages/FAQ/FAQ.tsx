import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";
import PageGridBackground from "@/shared/components/PageGridBackground";
import PageHero from "@/shared/components/PageHero";
import CTASection from "@/shared/components/CTASection";
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
        <PageHero
          variant="content"
          title={
            <>
              {t("hero.title")}
              <span style={{ color: "var(--color-primary)" }}>{t("hero.accent")}</span>
            </>
          }
          description={t("hero.desc")}
          actions={
            <Link to="/guide" className={styles.metaLink}>
              <Icon name="book-open" decorative />
              {t("hero.guideLink")}
            </Link>
          }
        />

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

        <CTASection
          title={t("cta.title")}
          description={t("cta.desc")}
          icon={<Icon name="comments" decorative />}
          actions={
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
          }
        />
      </div>
    </div>
  );
}

export default FAQ;
