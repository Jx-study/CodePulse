import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Badge from "@/shared/components/Badge";
import Button from "@/shared/components/Button";
import Card from "@/shared/components/Card";
import Icon from "@/shared/components/Icon";
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
  const cards = t("cards", { returnObjects: true }) as GuideCard[];

  return (
    <div className={styles.guide}>
      <div className={styles.bgGrid} />
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroAccent}>{t("hero.titleAccent")}</span>
            <br />
            {t("hero.titleSuffix")}
          </h1>
          <p className={styles.heroDesc}>{t("hero.desc")}</p>
          <div className={styles.heroActions}>
            <Link to="/dashboard">
              <Button
                variant="primary"
                iconLeft={<Icon name="rocket" decorative />}
                className={styles.heroButton}
              >
                {t("hero.startBtn")}
              </Button>
            </Link>
            <Link to="/faq">
              <Button
                variant="primaryOutline"
                iconLeft={<Icon name="circle-question" decorative />}
                className={styles.heroButton}
              >
                {t("hero.faqBtn")}
              </Button>
            </Link>
          </div>
        </div>

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

        <div className={styles.cta}>
          <h3 className={styles.ctaTitle}>{t("cta.title")}</h3>
          <p className={styles.ctaDesc}>{t("cta.desc")}</p>
          <div className={styles.ctaActions}>
            <Link to="/faq">
              <Button
                variant="primary"
                iconLeft={<Icon name="circle-question" decorative />}
              >
                {t("cta.faqBtn")}
              </Button>
            </Link>
            <Button
              variant="primaryOutline"
              iconLeft={<Icon name="envelope" decorative />}
              onClick={() => {
                window.location.href = "mailto:codepulse112@gmail.com";
              }}
            >
              {t("cta.contactBtn")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Guide;
