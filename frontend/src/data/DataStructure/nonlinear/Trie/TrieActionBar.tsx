import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  maxNodes = 20,
  disabled = false,
  onCustomAction,
}) => {
  const { t } = useTranslation("tutorials/trie");
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

  const handleDelete = () => {
    if (disabled || !wordInput.trim() || !onCustomAction) return;
    onCustomAction("delete", { word: wordInput.trim().toLowerCase() });
    setWordInput("");
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
        maxWords={maxNodes}
      />

      <ActionBarGroup>
        <StaticLabel>{t("ui.batchOps")}</StaticLabel>

        <Tooltip content={t("ui.loadListTooltip")}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowLoader(true)}
            disabled={disabled}
            icon="upload"
          >
            {t("ui.loadList")}
          </Button>
        </Tooltip>

        <div className={styles.settingItem}>
          <label className={styles.smallLabel}>{t("ui.randomCount")}</label>
          <Tooltip content={t("ui.randomCountTooltip", { max: maxNodes })}>
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
                    toast.warning(t("ui.randomCountExceeded", { max: maxNodes }));
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

        <Tooltip content={t("ui.randomTooltip")}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRandomWords}
            disabled={disabled}
            icon="shuffle"
          >
            {t("ui.randomGenerate")}
          </Button>
        </Tooltip>

        <Tooltip content={t("ui.resetTooltip")}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetData}
            disabled={disabled}
            icon="rotate-right"
          >
            {t("ui.reset")}
          </Button>
        </Tooltip>
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Trie Operation</StaticLabel>

        <Input
          type="text"
          placeholder={t("ui.wordInput")}
          value={wordInput}
          onChange={(e) =>
            setWordInput(e.target.value.replace(/[^a-zA-Z]/g, ""))
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          onKeyDown={(e) => e.key === "Enter" && handleInsert()}
        />

        <Tooltip content={t("ui.insertTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            className={styles.btnInsert}
            onClick={handleInsert}
            disabled={disabled || !wordInput}
            icon="plus"
          >
            Insert
          </Button>
        </Tooltip>

        <Tooltip content={t("ui.searchTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSearch}
            className={styles.btnSearch}
            disabled={disabled || !wordInput}
            icon="search"
          >
            Search Word
          </Button>
        </Tooltip>

        <Tooltip content={t("ui.startsWithTooltip")}>
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

        <Tooltip content={t("ui.deleteTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            className={styles.btnDelete}
            onClick={handleDelete}
            disabled={disabled || !wordInput}
            icon="trash"
          >
            Delete
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
