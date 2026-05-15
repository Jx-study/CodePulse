import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Badge from "@/shared/components/Badge";
import Button from "@/shared/components/Button";
import Card from "@/shared/components/Card";
import Icon from "@/shared/components/Icon";
import PageGridBackground from "@/shared/components/PageGridBackground";
import PageHero from "@/shared/components/PageHero";
import CTASection from "@/shared/components/CTASection";
import styles from "./Guide.module.scss";

interface GuideCard {
  id: string;
  badge: string;
  title: string;
  desc: string;
  steps: string[];
  linkLabel: string;
  linkTo: string;
}

function Guide() {
  const { t } = useTranslation("guide");
  const navigate = useNavigate();
  const raw = t("cards", { returnObjects: true });
  // TODO: sentry — log when i18n fails to return array (locale load failure)
  const cards = Array.isArray(raw) ? (raw as GuideCard[]) : [];

  return (
    <div className={styles.guide}>
      <PageGridBackground />
      <div className={styles.container}>
        <PageHero
          variant="content"
          maxWidth="72rem"
          title={
            <>
              <span className={styles.titleAccent}>{t("hero.titleAccent")}</span>
              <br />
              {t("hero.titleSuffix")}
            </>
          }
          description={t("hero.desc")}
          actions={
            <>
              <Button
                variant="primary"
                iconLeft={<Icon name="rocket" decorative />}
                className={styles.heroButton}
                onClick={() => navigate("/dashboard")}
              >
                {t("hero.startBtn")}
              </Button>
              <Button
                variant="primaryOutline"
                iconLeft={<Icon name="circle-question" decorative />}
                className={styles.heroButton}
                onClick={() => navigate("/faq")}
              >
                {t("hero.faqBtn")}
              </Button>
            </>
          }
        />

        <p className={styles.sectionLabel}>{t("section")}</p>

        <div className={styles.grid}>
          {cards.map((card) => (
            <Card key={card.id} className={styles.card}>
              <div className={styles.cardTop}>
                <Badge variant="secondary" size="xs" shape="square">
                  {card.badge}
                </Badge>
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>
              <ol className={styles.steps}>
                {card.steps.map((step, index) => (
                  <li key={step} className={styles.step}>
                    <span className={styles.stepNum}>{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <Link to={card.linkTo} className={styles.cardLink}>
                {card.linkLabel}
                <Icon name="arrow-right" decorative />
              </Link>
            </Card>
          ))}
        </div>

        <CTASection
          title={t("cta.title")}
          description={t("cta.desc")}
          actions={
            <>
              <Button
                variant="primary"
                iconLeft={<Icon name="circle-question" decorative />}
                onClick={() => navigate("/faq")}
              >
                {t("cta.faqBtn")}
              </Button>
              <Button
                variant="primaryOutline"
                iconLeft={<Icon name="envelope" decorative />}
                onClick={() => {
                  window.location.href = "mailto:codepulse112@gmail.com";
                }}
              >
                {t("cta.contactBtn")}
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}

export default Guide;
