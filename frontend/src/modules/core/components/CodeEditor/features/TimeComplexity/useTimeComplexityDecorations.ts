import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { TimeComplexityConfig } from './types';
import { analyzeTimeComplexity } from './timeComplexityAnalyzer';
import { COMPLEXITY_CLASS_NAME, COMPLEXITY_STYLE_ID, COMPLEXITY_COLORS, combineComplexity } from './constants';

export function useTimeComplexityDecorations(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  code: string,
  config: TimeComplexityConfig
): void {
  const decorationIdsRef = useRef<string[]>([]);
  const styleElementRef = useRef<HTMLStyleElement | null>(null);
  const layoutDisposableRef = useRef<monaco.IDisposable | null>(null);

  useEffect(() => {
    layoutDisposableRef.current?.dispose();
    layoutDisposableRef.current = null;

    if (!editor || !config.enabled) {
      if (editor) {
        decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
        editor.updateOptions({ wordWrap: 'off' });
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

    const analysis = config.externalData ?? analyzeTimeComplexity(code);

    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
    let dynamicCss = '';
    let longestLabelLength = 0;

    const formatExponent = (s: string) => s.replace('^2', '²').replace('^3', '³');

    analysis.forEach(({ lineNumber, complexity, context }) => {
      const className = `${COMPLEXITY_CLASS_NAME}-${lineNumber}`;
      const colorKey = context ? combineComplexity(complexity, context) : complexity;
      const color = COMPLEXITY_COLORS[colorKey as keyof typeof COMPLEXITY_COLORS] || COMPLEXITY_COLORS['O(1)'];
      const label = context
        ? `${formatExponent(complexity)} × ${formatExponent(context.replace(/^O\(/, '').replace(/\)$/, ''))}`
        : formatExponent(complexity);

      longestLabelLength = Math.max(longestLabelLength, label.length);

      newDecorations.push({
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: `${COMPLEXITY_CLASS_NAME} ${className}`,
        }
      });

      dynamicCss += `
        .${className}::after {
          content: "${label}";
          color: ${color};
        }
      `;
    });

    styleElementRef.current.textContent = dynamicCss;
    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, newDecorations);

    const updateWordWrap = () => {
      const layout = editor.getLayoutInfo();
      const charWidth = editor.getOption(monaco.editor.EditorOption.fontInfo).typicalHalfwidthCharacterWidth;
      const annotationWidth = longestLabelLength * charWidth;
      const availableWidth = layout.contentWidth - annotationWidth;
      const maxColumns = Math.max(Math.floor(availableWidth / charWidth), 20);
      editor.updateOptions({ wordWrap: 'wordWrapColumn', wordWrapColumn: maxColumns });
    };

    updateWordWrap();
    layoutDisposableRef.current = editor.onDidLayoutChange(updateWordWrap);

    return () => {
      layoutDisposableRef.current?.dispose();
      layoutDisposableRef.current = null;
      if (editor) {
        decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
        editor.updateOptions({ wordWrap: 'off' });
      }
    };
  }, [editor, code, config.enabled, config.externalData]);

  useEffect(() => {
    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, []);
}
