import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Tooltip from "@/shared/components/Tooltip";
import { toast } from "@/shared/components/Toast";
import {
  ActionBarContainer,
  ActionBarGroup,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";
import type { DSActionBarProps } from "@/types/implementation";
import { TrieLoaderModal } from "@/modules/core/components/ActionBar/ActionBarCommon";

export const TrieActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  maxNodes = 15,
  disabled = false,
  onCustomAction,
}) => {
  const [wordInput, setWordInput] = useState("");

  const [randomCount, setRandomCount] = useState(5);
  const [randomCountInput, setRandomCountInput] = useState("5");

  // 控制 Modal 開關的 State
  const [showLoader, setShowLoader] = useState(false);

  const handleInsert = () => {
    if (disabled || !wordInput.trim() || !onCustomAction) return;
    onCustomAction("insert", { word: wordInput.trim().toLowerCase() });
    setWordInput("");
  };

  const handleSearch = () => {
    if (disabled || !wordInput.trim() || !onCustomAction) return;
    onCustomAction("search", { word: wordInput.trim().toLowerCase() });
  };

  const handleStartsWith = () => {
    if (disabled || !wordInput.trim() || !onCustomAction) return;
    onCustomAction("startsWith", { word: wordInput.trim().toLowerCase() });
  };

  // 觸發隨機生成 (Random)
  const handleRandomWords = () => {
    if (disabled) return;
    // 傳入筆數參數給 actionHandler
    onRandomData({ count: randomCount });
  };

  return (
    <ActionBarContainer>
      {/* 第一行：資料生成與載入 */}
      <TrieLoaderModal
        show={showLoader}
        onClose={() => setShowLoader(false)}
        onLoad={onLoadData} // 直接把最終整理好的字串拋給外層
        maxWords={20}
      />

      <ActionBarGroup>
        <StaticLabel>批次操作</StaticLabel>

        <Tooltip content="開啟進階單字清單載入介面">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowLoader(true)}
            disabled={disabled}
            icon="upload"
          >
            進階載入清單
          </Button>
        </Tooltip>

        <div className={styles.settingItem}>
          <label className={styles.smallLabel}>隨機筆數:</label>
          <Tooltip content={`設定隨機生成的單字數量，上限為 ${maxNodes}`}>
            <Input
              type="number"
              value={randomCountInput}
              min={1}
              max={maxNodes}
              fullWidth={false}
              onChange={(e) => setRandomCountInput(e.target.value)}
              onBlur={() => {
                const num = Number(randomCountInput);
                if (isNaN(num) || randomCountInput.trim() === "") {
                  setRandomCountInput(String(randomCount));
                } else {
                  if (num > maxNodes)
                    toast.warning(`隨機筆數上限為 ${maxNodes}`);
                  const v = Math.min(Math.max(num, 1), maxNodes);
                  setRandomCount(v);
                  setRandomCountInput(String(v));
                  onMaxNodesChange?.(v);
                }
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.target as HTMLInputElement).blur()
              }
              className={`${styles.input} ${styles.valueInput}`}
              disabled={disabled}
            />
          </Tooltip>
        </div>

        <Tooltip content="隨機生成一組具備共用前綴的單字">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRandomWords}
            disabled={disabled}
            icon="shuffle"
          >
            隨機生成
          </Button>
        </Tooltip>

        <Tooltip content="清除所有單字，恢復初始狀態">
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetData}
            disabled={disabled}
            icon="rotate-right"
          >
            重設
          </Button>
        </Tooltip>
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Trie Operation</StaticLabel>

        <Input
          type="text"
          placeholder="輸入單字 (限英文字母)"
          value={wordInput}
          onChange={(e) =>
            setWordInput(e.target.value.replace(/[^a-zA-Z]/g, ""))
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          onKeyDown={(e) => e.key === "Enter" && handleInsert()}
        />

        <Tooltip content="將單字逐字元新增至字典樹中">
          <Button
            size="sm"
            variant="primary"
            onClick={handleInsert}
            disabled={disabled || !wordInput}
            icon="plus"
          >
            Insert
          </Button>
        </Tooltip>

        <Tooltip content="精確搜尋該單字是否完整存在">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSearch}
            disabled={disabled || !wordInput}
            icon="search"
          >
            Search Word
          </Button>
        </Tooltip>

        <Tooltip content="搜尋是否包含該前綴 (Prefix)">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleStartsWith}
            disabled={disabled || !wordInput}
            icon="spell-check"
          >
            StartsWith
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
