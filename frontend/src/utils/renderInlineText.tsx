import React from "react";
import styles from "./renderInlineText.module.scss";

export const INLINE_TEXT_TONES = [
  "primary",
  "success",
  "warning",
  "danger",
  "info",
  "muted",
] as const;

export type InlineTextTone = (typeof INLINE_TEXT_TONES)[number];

interface RenderInlineTextOptions {
  tones?: Partial<Record<InlineTextTone, string>>;
  code?: string;
}

export const defaultInlineTextOptions: RenderInlineTextOptions = {
  tones: {
    primary: styles.tonePrimary,
    success: styles.toneSuccess,
    warning: styles.toneWarning,
    danger: styles.toneDanger,
    info: styles.toneInfo,
    muted: styles.toneMuted,
  },
  code: styles.inlineCode,
};

const TONE_SET = new Set<string>(INLINE_TEXT_TONES);
const INLINE_TOKEN_PATTERN =
  /(\*\*[^*]+\*\*|`[^`]+`|\[\[(?:primary|success|warning|danger|info|muted)\|[^\]]+\]\])/g;
const TONE_TOKEN_PATTERN =
  /^\[\[(primary|success|warning|danger|info|muted)\|(.+)\]\]$/;

export function renderInlineText(
  text: string,
  options: RenderInlineTextOptions = defaultInlineTextOptions,
): React.ReactNode {
  return text.split(INLINE_TOKEN_PATTERN).map((part, index) => {
    if (!part || TONE_SET.has(part)) {
      return null;
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code className={options.code} key={index}>
          {part.slice(1, -1)}
        </code>
      );
    }

    const colorMatch = part.match(TONE_TOKEN_PATTERN);
    if (colorMatch) {
      const [, tone, value] = colorMatch;
      return (
        <span
          className={options.tones?.[tone as InlineTextTone]}
          key={index}
        >
          {value}
        </span>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
