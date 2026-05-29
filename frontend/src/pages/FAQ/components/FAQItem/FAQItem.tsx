import { AnimatePresence, motion } from "motion/react";
import Badge from "@/shared/components/Badge";
import Icon from "@/shared/components/Icon";
import styles from "./FAQItem.module.scss";

interface FAQItemProps {
  id: string;
  index: number;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ id, index, question, answer, isOpen, onToggle }: FAQItemProps) {
  const bodyId = `faq-body-${id}`;
  const triggerId = `faq-trigger-${id}`;

  return (
    <div className={`${styles.item} ${isOpen ? styles.open : ""}`}>
      <button
        type="button"
        className={styles.trigger}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        id={triggerId}
      >
        <span className={styles.questionGroup}>
          <Badge
            variant={isOpen ? "primary" : "secondary"}
            size="xs"
            shape="square"
            className={styles.index}
          >
            Q{String(index + 1).padStart(2, "0")}
          </Badge>
          <span className={styles.question}>{question}</span>
        </span>
        <motion.span
          className={styles.chevron}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon name="chevron-right" decorative />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={bodyId}
            role="region"
            aria-labelledby={triggerId}
            className={styles.body}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className={styles.answer}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FAQItem;
