# CodeEditor Component 使用指南

## 概述

CodeEditor 是 CodePulse 的核心程式碼編輯器組件，基於 Monaco Editor（VS Code 底層編輯器）構建，提供完整的程式碼編輯功能。

## 功能特性

✅ **Monaco Editor 整合** - VS Code 級別的編輯體驗
✅ **多語言支援** - Python, JavaScript, TypeScript, C++, Java, C, Go, Rust 等
✅ **主題系統** - 自動跟隨系統深淺色模式
✅ **分屏模式** - 上方顯示 Pseudo Code（唯讀），下方編輯實作程式碼
✅ **行高亮功能** - 高亮當前執行行，支援動畫效果
✅ **檔案匯入/匯出** - 支援多種程式語言檔案
✅ **響應式設計** - 桌面/平板/手機全支援
✅ **無障礙設計** - 鍵盤導航、螢幕閱讀器支援

## 基本使用

### 1. 單一編輯器模式

```tsx
import CodeEditor, { CodeEditorHandle } from '@/modules/core/components/CodeEditor/CodeEditor';
import { useRef, useState } from 'react';

function MyComponent() {
  const editorRef = useRef<CodeEditorHandle>(null);
  const [code, setCode] = useState('print("Hello, World!")');

  const handleChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleFormat = () => {
    editorRef.current?.formatCode();
  };

  return (
    <div style={{ height: '600px' }}>
      <CodeEditor
        ref={editorRef}
        mode="single"
        language="python"
        value={code}
        onChange={handleChange}
      />
      <button onClick={handleFormat}>格式化程式碼</button>
    </div>
  );
}
```

### 2. 分屏模式（Tutorial Page 使用）

```tsx
import CodeEditor, { CodeEditorHandle } from '@/modules/core/components/CodeEditor/CodeEditor';
import { useRef, useState } from 'react';

function TutorialPage() {
  const editorRef = useRef<CodeEditorHandle>(null);
  const [userCode, setUserCode] = useState('# 請在此實作演算法\n');
  const [currentLine, setCurrentLine] = useState<number | null>(null);

  const pseudoCode = `
ALGORITHM BubbleSort(arr):
  FOR i = 0 TO length(arr) - 1:
    FOR j = 0 TO length(arr) - i - 2:
      IF arr[j] > arr[j+1]:
        SWAP arr[j] AND arr[j+1]
  RETURN arr
  `.trim();

  const handleBottomChange = (newCode: string) => {
    setUserCode(newCode);
  };

  const handleExecute = () => {
    // 模擬執行，高亮第 3 行
    setCurrentLine(3);
  };

  return (
    <div style={{ height: '700px' }}>
      <CodeEditor
        ref={editorRef}
        mode="split"
        language="python"
        topContent={pseudoCode}
        bottomContent={userCode}
        onBottomChange={handleBottomChange}
        highlightedLine={currentLine}
        splitRatio={0.4} // 上方 40%，下方 60%
      />
      <button onClick={handleExecute}>執行程式碼</button>
    </div>
  );
}
```

### 3. 唯讀模式（Demo 展示用）

```tsx
<CodeEditor
  mode="single"
  language="javascript"
  value={demoCode}
  readOnly={true}
  showLineNumbers={true}
/>
```

## Props 參數說明

### 基本配置

| Prop 名稱 | 類型 | 預設值 | 說明 |
|-----------|------|--------|------|
| `mode` | `'single' \| 'split'` | `'single'` | 編輯器模式 |
| `language` | `string` | `'python'` | 程式語言（python, javascript, typescript, cpp, java, c, go, rust） |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | 編輯器主題（auto 跟隨系統） |

### 內容

| Prop 名稱 | 類型 | 預設值 | 說明 |
|-----------|------|--------|------|
| `value` | `string` | `''` | 編輯器內容（單一模式） |
| `topContent` | `string` | `''` | 分屏模式：上方內容（Pseudo Code） |
| `bottomContent` | `string` | `''` | 分屏模式：下方內容（實作程式碼） |

### 配置選項

| Prop 名稱 | 類型 | 預設值 | 說明 |
|-----------|------|--------|------|
| `readOnly` | `boolean` | `false` | 是否唯讀 |
| `showLineNumbers` | `boolean` | `true` | 是否顯示行號 |
| `enableAutoComplete` | `boolean` | `true` | 是否啟用自動完成 |
| `enableFormatting` | `boolean` | `true` | 是否啟用程式碼格式化 |

### 分屏配置

| Prop 名稱 | 類型 | 預設值 | 說明 |
|-----------|------|--------|------|
| `splitRatio` | `number` | `0.5` | 分屏比例（0.0-1.0，0.5 表示 50/50） |
| `highlightedLine` | `number \| null` | `null` | 高亮顯示的行號 |

### 回調函數

| Prop 名稱 | 類型 | 說明 |
|-----------|------|------|
| `onChange` | `(value: string) => void` | 內容變更回調（單一模式） |
| `onBottomChange` | `(value: string) => void` | 下方編輯器變更回調（分屏模式） |
| `onLanguageChange` | `(language: string) => void` | 語言切換事件 |
| `onFormatComplete` | `() => void` | 程式碼格式化完成事件 |

## Ref Methods

使用 `useRef` 可以呼叫以下方法：

```tsx
const editorRef = useRef<CodeEditorHandle>(null);

// 獲取內容
const code = editorRef.current?.getValue();
const topCode = editorRef.current?.getTopValue();
const bottomCode = editorRef.current?.getBottomValue();

// 設置內容
editorRef.current?.setValue('新的程式碼');
editorRef.current?.setTopValue('新的 Pseudo Code');
editorRef.current?.setBottomValue('新的實作程式碼');

// 語言切換
editorRef.current?.setLanguage('javascript');

// 主題切換
editorRef.current?.setTheme('dark');

// 高亮指定行（第 5 行）
editorRef.current?.highlightLine(5);
editorRef.current?.highlightLine(3, 'top'); // 分屏模式：高亮上方編輯器第 3 行

// 格式化程式碼
editorRef.current?.formatCode();

// 匯出程式碼
editorRef.current?.exportCode('my-code.py');

// 匯入程式碼
const file = event.target.files[0];
await editorRef.current?.importCode(file);

// 調整分屏比例
editorRef.current?.setSplitRatio(0.3); // 上方 30%，下方 70%
```

## 進階用法

### 檔案匯入範例

```tsx
function ImportExample() {
  const editorRef = useRef<CodeEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editorRef.current) {
      await editorRef.current.importCode(file);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".py,.js,.ts,.cpp,.java,.c,.go"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        匯入程式碼
      </button>
      <CodeEditor ref={editorRef} />
    </>
  );
}
```

### 動態行高亮（模擬程式碼執行）

```tsx
function ExecutionDemo() {
  const editorRef = useRef<CodeEditorHandle>(null);
  const [currentLine, setCurrentLine] = useState<number | null>(null);

  const simulateExecution = async () => {
    const lines = [1, 2, 3, 4, 5];
    for (const line of lines) {
      setCurrentLine(line);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 每行執行 1 秒
    }
    setCurrentLine(null);
  };

  return (
    <>
      <CodeEditor
        ref={editorRef}
        highlightedLine={currentLine}
        value={`def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr) - i - 1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`}
      />
      <button onClick={simulateExecution}>模擬執行</button>
    </>
  );
}
```

## 支援的程式語言

| 語言 | Monaco Language ID | 檔案副檔名 |
|------|-------------------|-----------|
| Python | `python` | `.py` |
| JavaScript | `javascript` | `.js` |
| TypeScript | `typescript` | `.ts` |
| C++ | `cpp` | `.cpp` |
| Java | `java` | `.java` |
| C | `c` | `.c` |
| Go | `go` | `.go` |
| Rust | `rust` | `.rs` |
| Ruby | `ruby` | `.rb` |
| PHP | `php` | `.php` |

## 樣式自定義

可以透過 `className` 傳入自定義樣式：

```tsx
<CodeEditor
  className="my-custom-editor"
  mode="single"
/>
```

```scss
.my-custom-editor {
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
```

## 注意事項

### 性能優化

1. **延遲載入** - 建議使用 dynamic import：
   ```tsx
   import dynamic from 'next/dynamic';
   const CodeEditor = dynamic(() => import('./CodeEditor'), { ssr: false });
   ```

2. **節流與防抖** - `onChange` 已內建防抖處理

3. **記憶體管理** - 組件會自動清理 Monaco Editor 實例

### 響應式設計

- **桌面端**（≥1024px）：完整功能，顯示 Minimap
- **平板端**（768px-1023px）：基礎功能
- **手機端**（<768px）：簡化界面

### 無障礙設計

- ✅ 支援鍵盤導航（Tab、方向鍵、Ctrl+快捷鍵）
- ✅ 螢幕閱讀器支援（ARIA 屬性）
- ✅ 高對比度主題支援

## 故障排除

### Q: Monaco Editor 未顯示？
A: 確保容器有明確的高度：
```tsx
<div style={{ height: '600px' }}>
  <CodeEditor />
</div>
```

### Q: 主題切換不生效？
A: 檢查是否正確使用 `theme` prop，或使用 `ref.current?.setTheme()`

### Q: 分屏模式無法拖曳？
A: 確保組件容器有足夠的高度（建議 ≥500px）

## 相關資源

- [Monaco Editor 官方文件](https://microsoft.github.io/monaco-editor/)
- [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
