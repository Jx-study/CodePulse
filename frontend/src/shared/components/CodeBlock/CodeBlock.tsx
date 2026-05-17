import type React from 'react';
import styles from './CodeBlock.module.scss';

type FontSize = 'xs' | 'sm' | 'md';

interface CodeBlockProps {
  filename: string;
  lines: string[];
  highlightedLines?: number[];
  fontSize?: FontSize;
  className?: string;
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  xs: '10px',
  sm: '12px',
  md: '14px',
};

function CodeBlock({ filename, lines, highlightedLines = [], fontSize = 'sm', className = '' }: CodeBlockProps) {
  return (
    <div className={`${styles.codeBlock} ${className}`} style={{ '--code-font-size': FONT_SIZE_MAP[fontSize] } as React.CSSProperties}>
      <div className={styles.titlebar}>
        <span className={`${styles.dot} ${styles.dotR}`} />
        <span className={`${styles.dot} ${styles.dotY}`} />
        <span className={`${styles.dot} ${styles.dotG}`} />
        <span className={styles.filename}>{filename}</span>
      </div>
      <div className={styles.body}>
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = highlightedLines.includes(lineNum);
          return (
            <div
              key={idx}
              className={`${styles.line}${isHighlighted ? ` ${styles.lineHighlighted}` : ''}`}
            >
              <span className={styles.lineNumber}>{lineNum}</span>
              <span className={styles.lineText}>{line || ' '}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CodeBlock;
