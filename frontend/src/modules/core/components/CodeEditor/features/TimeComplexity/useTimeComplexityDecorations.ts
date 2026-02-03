import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { TimeComplexityConfig } from './types';
import { analyzeTimeComplexity } from './timeComplexityAnalyzer';
import { COMPLEXITY_CLASS_NAME, COMPLEXITY_STYLE_ID, COMPLEXITY_COLORS } from './constants';

export function useTimeComplexityDecorations(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  code: string,
  config: TimeComplexityConfig
): void {
  const decorationIdsRef = useRef<string[]>([]);
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!editor || !config.enabled) {
      if (editor) {
        decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
      }
      return;
    }

    if (!styleElementRef.current) {
      let el = document.getElementById(COMPLEXITY_STYLE_ID) as HTMLStyleElement;
      if (!el) {
        el = document.createElement('style');
        el.id = COMPLEXITY_STYLE_ID;
        document.head.appendChild(el);
      }
      styleElementRef.current = el;
    }

    const analysis = analyzeTimeComplexity(code);

    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
    let dynamicCss = '';

    analysis.forEach(({ lineNumber, complexity }) => {
      const className = `${COMPLEXITY_CLASS_NAME}-${lineNumber}`;
      const color = COMPLEXITY_COLORS[complexity as keyof typeof COMPLEXITY_COLORS] || COMPLEXITY_COLORS['O(1)'];

      newDecorations.push({
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: `${COMPLEXITY_CLASS_NAME} ${className}`,
        }
      });

      dynamicCss += `
        .${className}::after {
          content: "${complexity}";
          color: ${color};
        }
      `;
    });

    styleElementRef.current.textContent = dynamicCss;
    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, newDecorations);

    return () => {
      if (editor) {
        decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
      }
    };
  }, [editor, code, config.enabled]);

  useEffect(() => {
    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, []);
}
