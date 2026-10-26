import type { ReactNode } from 'react';
import Card from '@/shared/components/Card';
import styles from './Interactive.module.scss';

interface Props {
  label: string;
  value: ReactNode;
  /** label and value on one row, for slides that are short on height */
  inline?: boolean;
  className?: string;
}

export default function StatCard({ label, value, inline = false, className = '' }: Props) {
  return (
    <Card size="sm" hoverable={false} className={`${styles.stat} ${inline ? styles.statInline : ''} ${className}`}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
    </Card>
  );
}
