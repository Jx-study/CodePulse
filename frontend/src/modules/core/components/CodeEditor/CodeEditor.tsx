import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import styles from './CodeEditor.module.scss';

// ==================== 類型定義 ====================

export interface CodeEditorProps {
  // 基本配置
  mode?: 'single' | 'split';
  language?: string;
  theme?: 'light' | 'dark' | 'auto';

  // 內容
  value?: string;
  topContent?: string;
  bottomContent?: string;

  // 配置選項
  readOnly?: boolean;
  showLineNumbers?: boolean;
  enableAutoComplete?: boolean;
  enableFormatting?: boolean;

  // 分屏配置
  splitRatio?: number;
  highlightedLine?: number | null;

  // 回調函數
  onChange?: (value: string) => void;
  onBottomChange?: (value: string) => void;
  onLanguageChange?: (language: string) => void;
  onFormatComplete?: () => void;

  // 樣式
  className?: string;
}

export interface CodeEditorHandle {
  // 獲取編輯器內容
  getValue: () => string;
  getTopValue: () => string;
  getBottomValue: () => string;

  // 設置編輯器內容
  setValue: (value: string) => void;
  setTopValue: (value: string) => void;
  setBottomValue: (value: string) => void;

  // 語言切換
  setLanguage: (language: string) => void;

  // 主題切換
  setTheme: (theme: 'light' | 'dark') => void;

  // 高亮指定行
  highlightLine: (lineNumber: number, editorType?: 'top' | 'bottom') => void;

  // 格式化程式碼
  formatCode: () => void;

  // 匯出程式碼
  exportCode: (filename?: string) => void;

  // 匯入程式碼
  importCode: (file: File) => Promise<void>;

  // 調整分屏比例
  setSplitRatio: (ratio: number) => void;
}

// ==================== 語言對應表 ====================

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
  cpp: 'cpp',
  java: 'java',
  c: 'c',
  go: 'go',
  rust: 'rs',
  ruby: 'rb',
  php: 'php',
};

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  jsx: 'javascript',
  tsx: 'typescript',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  c: 'c',
  h: 'c',
  java: 'java',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
  php: 'php',
};

// ==================== CodeEditor 組件 ====================

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>((props, ref) => {
  const {
    mode = 'single',
    language = 'python',
    theme = 'auto',
    value = '',
    topContent = '',
    bottomContent = '',
    readOnly = false,
    showLineNumbers = true,
    enableAutoComplete = true,
    enableFormatting = true,
    splitRatio: propSplitRatio = 0.5,
    highlightedLine,
    onChange,
    onBottomChange,
    onLanguageChange,
    onFormatComplete,
    className = '',
  } = props;

  // ========== State ==========
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [splitRatio, setSplitRatio] = useState(propSplitRatio);
  const [isDragging, setIsDragging] = useState(false);

  // ========== Refs ==========
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const topEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const bottomEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentDecorationsRef = useRef<string[]>([]);
  const topDecorationsRef = useRef<string[]>([]);
  const bottomDecorationsRef = useRef<string[]>([]);
  const monacoInstanceRef = useRef<typeof monaco | null>(null);
  // 穩定的 key，用於防止 StrictMode 雙重掛載問題
  const editorKeyRef = useRef<string>(`editor-${Math.random().toString(36).substring(7)}`);

  // ========== 主題檢測 ==========
  useEffect(() => {
    const detectTheme = () => {
      if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setCurrentTheme(isDark ? 'dark' : 'light');
      } else {
        setCurrentTheme(theme);
      }
    };

    detectTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => detectTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // ========== 語言更新 ==========
  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  useEffect(() => {
    // 組件卸載時，立即清理所有編輯器實例和 monaco 實例
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (e) {
          // 忽略已經被 dispose 的錯誤
        }
        editorRef.current = null;
      }

      if (topEditorRef.current) {
        try {
          topEditorRef.current.dispose();
        } catch (e) {
          // 忽略已經被 dispose 的錯誤
        }
        topEditorRef.current = null;
      }

      if (bottomEditorRef.current) {
        try {
          bottomEditorRef.current.dispose();
        } catch (e) {
        }
        bottomEditorRef.current = null;
      }
      monacoInstanceRef.current = null;

      // 清理所有裝飾
      currentDecorationsRef.current = [];
      topDecorationsRef.current = [];
      bottomDecorationsRef.current = [];
    };
  }, []); // 空依賴陣列，只在 mount/unmount 時執行

  // ========== Monaco Editor 配置 ==========
  const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = useMemo(() => ({
    readOnly,
    lineNumbers: showLineNumbers ? 'on' : 'off',
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 4,
    wordWrap: 'on',
    quickSuggestions: enableAutoComplete,
    formatOnPaste: enableFormatting,
    formatOnType: enableFormatting,
    theme: currentTheme === 'dark' ? 'vs-dark' : 'vs',
    padding: { top: 12, bottom: 12 },
    glyphMargin: true, // 启用左侧装饰标记区域
  }), [readOnly, showLineNumbers, enableAutoComplete, enableFormatting, currentTheme]);

  // ========== 單一編輯器 Mount ==========
  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoInstanceRef.current = monacoInstance;

    // 編輯器加載完成後，如果有初始高亮行，立即應用
    if (highlightedLine !== null && highlightedLine !== undefined) {
      highlightLineInternal(highlightedLine);
    }
  };

  // ========== 上方編輯器 Mount (分屏模式) ==========
  const handleTopEditorMount: OnMount = (editor, monacoInstance) => {
    topEditorRef.current = editor;
    monacoInstanceRef.current = monacoInstance;
  };

  // ========== 下方編輯器 Mount (分屏模式) ==========
  const handleBottomEditorMount: OnMount = (editor, monacoInstance) => {
    bottomEditorRef.current = editor;
    monacoInstanceRef.current = monacoInstance;

    // 編輯器加載完成後，如果有初始高亮行，立即應用到底部編輯器
    if (highlightedLine !== null && highlightedLine !== undefined) {
      highlightLineInternal(highlightedLine, 'bottom');
    }
  };

  // ========== 內容變更處理 ==========
  const handleChange: OnChange = (newValue) => {
    onChange?.(newValue || '');
  };

  const handleBottomContentChange: OnChange = (newValue) => {
    onBottomChange?.(newValue || '');
  };

  // ========== 分屏拖曳處理 ==========
  const handleResizerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startY = e.clientY;
    const startRatio = splitRatio;
    const containerHeight = containerRef.current?.offsetHeight || 600;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newRatio = startRatio + deltaY / containerHeight;
      const clampedRatio = Math.max(0.2, Math.min(0.8, newRatio));
      setSplitRatio(clampedRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // ========== 行高亮功能 ==========
  const highlightLineInternal = (lineNumber: number, editorType?: 'top' | 'bottom') => {
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;
    let decorationsRef: React.MutableRefObject<string[]> | null = null;

    if (mode === 'split') {
      if (editorType === 'top') {
        editor = topEditorRef.current;
        decorationsRef = topDecorationsRef;
      } else {
        editor = bottomEditorRef.current;
        decorationsRef = bottomDecorationsRef;
      }
    } else {
      editor = editorRef.current;
      decorationsRef = currentDecorationsRef;
    }

    // 加入 Detailed Guard Clause
    // 1. 檢查 editor 是否存在
    // 2. 檢查 editor 的 Model 是否存在 (如果編輯器正在銷毀中，Model 可能已經是 null)
    // 3. 檢查 Model 是否已經被 disposed
    const model = editor?.getModel();
    if (!editor || !decorationsRef || !model || model.isDisposed()) {
      return; // 編輯器已死，直接退出，不要執行後面的 deltaDecorations
    }

    // 確保 monaco 實例也存在
    if (!monacoInstanceRef.current) return;

    // 清除舊的高亮
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

    // 添加新的高亮
    decorationsRef.current = editor.deltaDecorations(
      [],
      [
        {
          range: new monacoInstanceRef.current.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: 'execution-line-background',
            glyphMarginClassName: 'execution-line-glyph',
          },
        },
      ]
    );

    // 滾動到該行
    editor.revealLineInCenter(lineNumber);
  };

  // ========== 監聽 highlightedLine prop 變化 ==========
  useEffect(() => {
    if (highlightedLine !== null && highlightedLine !== undefined) {
      // 檢查編輯器是否已經準備好
      const targetEditor = mode === 'split' ? bottomEditorRef.current : editorRef.current;

      if (targetEditor) {
        // 編輯器已準備好，立即執行高亮
        highlightLineInternal(highlightedLine, mode === 'split' ? 'bottom' : undefined);
      }
      // 如果編輯器還沒準備好，onMount 回調會處理初始高亮
    }
  }, [highlightedLine, mode]);

  // ========== 匯出程式碼 ==========
  const exportCodeInternal = (filename?: string) => {
    const content = editorRef.current?.getValue() || '';
    const extension = LANGUAGE_EXTENSIONS[currentLanguage] || 'txt';
    const defaultFilename = filename || `code.${extension}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ========== 匯入程式碼 ==========
  const importCodeInternal = async (file: File): Promise<void> => {
    const content = await file.text();
    editorRef.current?.setValue(content);

    // 根據副檔名自動切換語言
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const detectedLanguage = EXTENSION_TO_LANGUAGE[extension];
    if (detectedLanguage) {
      setCurrentLanguage(detectedLanguage);
      onLanguageChange?.(detectedLanguage);
    }
  };

  // ========== 格式化程式碼 ==========
  const formatCodeInternal = () => {
    const editor = mode === 'split' ? bottomEditorRef.current : editorRef.current;
    if (editor) {
      editor.getAction('editor.action.formatDocument')?.run();
      onFormatComplete?.();
    }
  };

  // ========== useImperativeHandle ==========
  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue() || '',
    getTopValue: () => topEditorRef.current?.getValue() || '',
    getBottomValue: () => bottomEditorRef.current?.getValue() || '',

    setValue: (newValue: string) => editorRef.current?.setValue(newValue),
    setTopValue: (newValue: string) => topEditorRef.current?.setValue(newValue),
    setBottomValue: (newValue: string) => bottomEditorRef.current?.setValue(newValue),

    setLanguage: (newLanguage: string) => {
      setCurrentLanguage(newLanguage);
      onLanguageChange?.(newLanguage);
    },

    setTheme: (newTheme: 'light' | 'dark') => {
      setCurrentTheme(newTheme);
    },

    highlightLine: highlightLineInternal,
    formatCode: formatCodeInternal,
    exportCode: exportCodeInternal,
    importCode: importCodeInternal,
    setSplitRatio: (ratio: number) => {
      setSplitRatio(Math.max(0.2, Math.min(0.8, ratio)));
    },
  }));

  // ========== 渲染 ==========
  return (
    <div
      ref={containerRef}
      className={`${styles.codeEditor} ${className} ${isDragging ? styles.dragging : ''}`}
    >
      {mode === 'split' ? (
        <>
          {/* 上方編輯器（Pseudo Code，唯讀） */}
          <div className={styles.topEditor} style={{ height: `${splitRatio * 100}%` }}>
            <Editor
              key={`${editorKeyRef.current}-top`}
              height="100%"
              language="pseudocode"
              value={topContent}
              theme={currentTheme === 'dark' ? 'vs-dark' : 'vs'}
              options={{
                ...editorOptions,
                readOnly: true,
                minimap: { enabled: false },
              }}
              onMount={handleTopEditorMount}
            />
          </div>

          {/* 分隔線（可拖曳） */}
          <div
            className={`${styles.resizer} ${isDragging ? styles.active : ''}`}
            onMouseDown={handleResizerMouseDown}
          >
            <div className={styles.resizerHandle}></div>
          </div>

          {/* 下方編輯器（實作程式碼，可編輯） */}
          <div className={styles.bottomEditor} style={{ height: `${(1 - splitRatio) * 100}%` }}>
            <Editor
              key={`${editorKeyRef.current}-bottom`}
              height="100%"
              language={currentLanguage}
              value={bottomContent}
              theme={currentTheme === 'dark' ? 'vs-dark' : 'vs'}
              options={editorOptions}
              onChange={handleBottomContentChange}
              onMount={handleBottomEditorMount}
            />
          </div>
        </>
      ) : (
        /* 單一編輯器模式 */
        <Editor
          key={`${editorKeyRef.current}-single`}
          height="100%"
          language={currentLanguage}
          value={value}
          theme={currentTheme === 'dark' ? 'vs-dark' : 'vs'}
          options={editorOptions}
          onChange={handleChange}
          onMount={handleEditorMount}
        />
      )}
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;