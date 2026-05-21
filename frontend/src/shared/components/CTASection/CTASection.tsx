import React from "react";
import styles from "./CTASection.module.scss";

export interface CTASectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions: React.ReactNode;
  icon?: React.ReactNode;
}

function CTASection({ title, description, actions, icon }: CTASectionProps) {
  return (
    <section className={styles.cta}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h2 className={styles.title}>{title}</h2>
      {description && (
        <p className={styles.description} data-testid="desc">
          {description}
        </p>
      )}
      <div className={styles.actions}>{actions}</div>
    </section>
  );
}

export default CTASection;
