import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Tooltip from "@/shared/components/Tooltip";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";
import type { DSActionBarProps } from "@/types/implementation";

export const TrieActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  maxNodes,
  disabled = false,
  onCustomAction,
}) => {
  const [wordInput, setWordInput] = useState("");

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

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <DataRow
          onLoadData={onLoadData}
          onResetData={onResetData}
          onRandomData={onRandomData}
          onMaxNodesChange={onMaxNodesChange}
          disabled={disabled}
          maxNodes={maxNodes}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>字典樹 (Trie)</StaticLabel>

        <Input
          type="text"
          placeholder="輸入單字 (僅限英文字母)"
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
            variant="secondary"
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
