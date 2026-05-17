import React from "react";
import styles from "./PageHero.module.scss";

export type PageHeroVariant = "landing" | "content" | "feature";

export interface PageHeroProps {
  variant: PageHeroVariant;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
  bgTexture?: boolean;
  children?: React.ReactNode;
}

function PageHero({
  variant,
  title,
  description,
  actions,
  maxWidth,
  bgTexture = false,
  children,
}: PageHeroProps) {
  const showBgTexture = variant === "feature" && bgTexture;
  const showChildren = variant === "landing" && children;

  return (
    <section
      className={styles.hero}
      data-variant={variant}
      style={maxWidth ? { maxWidth } : undefined}
    >
      {showBgTexture && (
        <div className={styles.bgTexture} data-testid="bg-texture" aria-hidden="true" />
      )}
      <div className={styles.inner}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {showChildren && <div className={styles.extra}>{children}</div>}
    </section>
  );
}

export default PageHero;
