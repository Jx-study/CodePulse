import { useState, useEffect, useRef } from "react";
import Dialog from "@/shared/components/Dialog";
import Button from "@/shared/components/Button";
import styles from "./InputPromptDialog.module.scss";

interface InputPromptDialogProps {
  isOpen: boolean;
  prompt: string;
  inputIndex: number;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function InputPromptDialog({
  isOpen,
  prompt,
  inputIndex,
  onSubmit,
  onCancel,
}: InputPromptDialogProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 每次開啟或換到下一個 input 時清空並聚焦（連續多個 input 用 inputIndex 區分）
  useEffect(() => {
    if (isOpen) {
      setValue("");
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, inputIndex]);

  const footer = (
    <>
      <Button variant="secondary" onClick={onCancel}>
        取消
      </Button>
      <Button variant="primary" onClick={() => onSubmit(value)}>
        確認
      </Button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={`輸入 #${inputIndex + 1}`}
      footer={footer}
      size="sm"
    >
      <div className={styles.body}>
        {prompt && <div className={styles.prompt}>{prompt}</div>}
        <input
          ref={inputRef}
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit(value);
          }}
          placeholder="輸入值並按 Enter…"
        />
      </div>
    </Dialog>
  );
}

export default InputPromptDialog;
