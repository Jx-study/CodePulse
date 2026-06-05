import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import Button from "@/shared/components/Button";
import Dialog from "@/shared/components/Dialog";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Textarea from "@/shared/components/Textarea";
import { toast } from "@/shared/components/Toast";
import { DATA_LIMITS, clampNumberInput } from "@/constants/dataLimits";
import styles from "./ActionBar.module.scss";

// ─── Layout 元件 ─────────────────────────────────────────────

export const ActionBarContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={styles.dataActionBarContainer}>{children}</div>;

export const ActionBarGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={styles.actionGroup}>{children}</div>;

export const StaticLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={styles.staticLabel}>{children}</div>;

// ─── DataRow：共用的第一行（載入/重設/隨機 + 隨機筆數） ──────

export interface DataRowProps {
  onLoadData: (data: string) => void;
  onResetData: () => void;
  onRandomData: (params?: any) => void;
  onMaxNodesChange?: (count: number) => void;
  disabled?: boolean;
  maxNodes?: number;
  hideLoadButton?: boolean;
  minValue?: number;
  maxValue?: number;
}

export const DataRow: React.FC<DataRowProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  maxNodes,
  hideLoadButton = false,
  minValue,
  maxValue,
}) => {
  const { t } = useTranslation("tutorials/actionbar");
  const [bulkInput, setBulkInput] = useState("");
  const [randomCount, setRandomCount] = useState(
    DATA_LIMITS.DEFAULT_RANDOM_COUNT,
  );
  const [randomCountInput, setRandomCountInput] = useState(
    String(DATA_LIMITS.DEFAULT_RANDOM_COUNT),
  );

  return (
    <>
      {!hideLoadButton && (
        <>
          <Input
            type="text"
            placeholder="10,40,30..."
            value={bulkInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBulkInput(e.target.value)
            }
            className={`${styles.input} ${styles.bulkDataInput}`}
            disabled={disabled}
            fullWidth={false}
            aria-label="Bulk data input"
          />
          <Tooltip content={t("dataRow.loadTooltip")}>
            <Button
              size="sm"
              onClick={() => {
                let items = bulkInput
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);

                if (minValue !== undefined || maxValue !== undefined) {
                  const min = minValue ?? -Infinity;
                  const max = maxValue ?? Infinity;
                  const invalid = items.filter((s) => {
                    const n = Number(s);
                    return isNaN(n) || n < min || n > max;
                  });
                  if (invalid.length > 0) {
                    toast.warning(
                      t("dataRow.loadValueRangeWarning", { min, max }),
                    );
                    items = items.filter((s) => {
                      const n = Number(s);
                      return !isNaN(n) && n >= min && n <= max;
                    });
                    if (items.length === 0) return;
                  }
                }

                if (maxNodes !== undefined && items.length > maxNodes) {
                  toast.warning(
                    t("dataRow.loadLimitWarning", { max: maxNodes }),
                  );
                  items = items.slice(0, maxNodes);
                }

                onLoadData(items.join(","));
              }}
              disabled={disabled}
              icon="download"
            >
              {t("dataRow.loadBtn")}
            </Button>
          </Tooltip>
        </>
      )}
      <Tooltip content={t("dataRow.resetTooltip")}>
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetData}
          disabled={disabled}
          icon="rotate-right"
        >
          {t("dataRow.resetBtn")}
        </Button>
      </Tooltip>
      <Tooltip content={t("dataRow.randomTooltip")}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onRandomData()}
          disabled={disabled}
          icon="shuffle"
        >
          {t("dataRow.randomBtn")}
        </Button>
      </Tooltip>

      <div className={styles.settingItem}>
        <label className={styles.smallLabel}>
          {t("dataRow.randomCountLabel")}
        </label>
        <Tooltip
          content={
            maxNodes !== undefined
              ? t("dataRow.randomCountTooltipMax", { max: maxNodes })
              : t("dataRow.randomCountTooltip")
          }
        >
          <Input
            type="number"
            value={randomCountInput}
            min={DATA_LIMITS.MIN_RANDOM_COUNT}
            max={maxNodes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRandomCountInput(e.target.value)
            }
            onBlur={() => {
              const num = Number(randomCountInput);
              if (isNaN(num) || randomCountInput.trim() === "") {
                setRandomCountInput(String(randomCount));
              } else if (num < 0) {
                setRandomCountInput(String(randomCount));
              } else {
                if (maxNodes !== undefined && num > maxNodes) {
                  toast.warning(
                    t("dataRow.randomCountLimitWarning", { max: maxNodes }),
                  );
                }
                const v = Math.min(
                  Math.max(num, DATA_LIMITS.MIN_RANDOM_COUNT),
                  maxNodes ?? num,
                );
                setRandomCount(v);
                setRandomCountInput(String(v));
                onMaxNodesChange?.(v);
              }
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={`${styles.input} ${styles.valueInput}`}
            disabled={disabled}
            fullWidth={false}
            aria-label="Random count"
          />
        </Tooltip>
      </div>
    </>
  );
};

// ─── TrieLoaderModal ─────────────────────────────────────────

export interface TrieLoaderModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (data: string) => void;
  maxWords?: number; // 預設限制載入筆數，避免樹狀圖過度龐大
}

const TRIE_DEFAULT_INPUT = "app\napple\napply\nape\nbat\nball\ncat\ncare";

export const TrieLoaderModal: React.FC<TrieLoaderModalProps> = ({
  show,
  onClose,
  onLoad,
  maxWords = 20,
}) => {
  const { t } = useTranslation("tutorials/trie"); // Trie 保留自己的 namespace
  const [committedInput, setCommittedInput] = useState(TRIE_DEFAULT_INPUT);
  const [draftInput, setDraftInput] = useState(TRIE_DEFAULT_INPUT);

  useEffect(() => {
    if (show) setDraftInput(committedInput);
  }, [show, committedInput]);

  const handleLoad = () => {
    if (!draftInput.trim()) {
      toast.warning(t("ui.modal.emptyWarning"));
      return;
    }

    const rawWords = draftInput.split(/[\s,]+/);
    const invalidWords: string[] = [];
    const validWords: string[] = [];

    for (const w of rawWords) {
      if (!w) continue;

      // 檢查是否只包含英文字母 (a-z, A-Z)
      if (!/^[a-zA-Z]+$/.test(w)) {
        invalidWords.push(w);
      } else {
        validWords.push(w.toLowerCase());
      }
    }

    if (invalidWords.length > 0) {
      const sample =
        invalidWords.slice(0, 5).join(", ") +
        (invalidWords.length > 5 ? "..." : "");
      toast.warning(t("ui.modal.invalidWarning", { words: sample }));
    }

    const uniqueWords = Array.from(new Set(validWords));

    if (uniqueWords.length === 0) {
      toast.warning(t("ui.modal.noValidWords"));
      return;
    }

    let finalWords = uniqueWords;
    if (finalWords.length > maxWords) {
      toast.warning(t("ui.modal.truncateWarning", { max: maxWords }));
      finalWords = finalWords.slice(0, maxWords);
    }

    const outputString = finalWords.join(" ");
    setCommittedInput(draftInput);
    onLoad(`TRIE:${outputString}`);
    onClose();
  };

  return (
    <Dialog
      isOpen={show}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className={styles.loaderDialog}
      headerClassName={styles.loaderDialogHeader}
      contentClassName={styles.loaderDialogContent}
      footerClassName={styles.loaderDialogFooter}
      title={t("ui.modal.title")}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("ui.modal.cancel")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoad}
            className={styles.modalConfirmButton}
          >
            {t("ui.modal.loadButton")}
          </Button>
        </>
      }
    >
      <div className={styles.modalFieldColumn}>
        <label className={styles.modalLabel}>{t("ui.modal.inputLabel")}</label>
        <Textarea
          value={draftInput}
          onChange={(e) => setDraftInput(e.target.value)}
          rows={8}
          className={styles.modalGraphTextarea}
          placeholder={t("ui.modal.placeholder")}
        />
        <span style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
          {t("ui.modal.hint", { max: maxWords })}
        </span>
      </div>
    </Dialog>
  );
};

// ─── GraphLoaderModal ────────────────────────────────────────

// 注入 TFunction 以支援 i18n
export type EdgeValidator = (
  parts: string[],
  count: number,
  t: TFunction,
) => string | null;

const unweightedEdgeValidator: EdgeValidator = (parts, _count, t) => {
  if (parts.length !== 2) {
    return t("graphModal.unweightedFormatError", { line: parts.join(" ") });
  }
  if (isNaN(parseInt(parts[0], 10)) || isNaN(parseInt(parts[1], 10))) {
    return t("graphModal.integerError", { line: parts.join(" ") });
  }
  return null;
};

const weightedEdgeValidator: EdgeValidator = (parts, _count, t) => {
  if (parts.length !== 3) {
    return t("graphModal.weightedFormatError", { line: parts.join(" ") });
  }
  const w = parseInt(parts[2], 10);
  if (isNaN(w)) {
    return t("graphModal.weightIntegerError", {
      val: parts[2],
      line: parts.join(" "),
    });
  }
  if (w < 0) {
    return t("graphModal.negativeWeightError");
  }
  return null;
};

const UNWEIGHTED_DEFAULTS = {
  edgeLabelKey: "graphModal.unweightedLabel",
  defaultEdgeInput: "0 1\n0 2\n1 3\n2 4\n3 5\n4 5",
  edgePlaceholder: "0 1\n1 2\n2 0",
};

const WEIGHTED_DEFAULTS = {
  edgeLabelKey: "graphModal.weightedLabel",
  defaultEdgeInput: "0 1 4\n0 2 2\n1 2 5\n1 3 10\n2 4 3\n4 3 4\n5 2 6",
  edgePlaceholder: "0 1 4\n1 2 5\n2 0 10",
};

export interface GraphLoaderModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (data: string) => void;
  isWeighted?: boolean;
  edgeValidator?: EdgeValidator;
}

export const GraphLoaderModal: React.FC<GraphLoaderModalProps> = ({
  show,
  onClose,
  onLoad,
  isWeighted = false,
  edgeValidator,
}) => {
  const { t } = useTranslation("tutorials/actionbar");
  const defaults = isWeighted ? WEIGHTED_DEFAULTS : UNWEIGHTED_DEFAULTS;
  const resolvedValidator =
    edgeValidator ??
    (isWeighted ? weightedEdgeValidator : unweightedEdgeValidator);

  const [committedNodeCount, setCommittedNodeCount] = useState("6");
  const [committedEdgeInput, setCommittedEdgeInput] = useState(
    defaults.defaultEdgeInput,
  );
  const [draftNodeCount, setDraftNodeCount] = useState("6");
  const [draftEdgeInput, setDraftEdgeInput] = useState(
    defaults.defaultEdgeInput,
  );

  useEffect(() => {
    if (show) {
      setDraftNodeCount(committedNodeCount);
      setDraftEdgeInput(committedEdgeInput);
    }
  }, [show]);

  const handleLoad = () => {
    const count = parseInt(draftNodeCount);
    if (isNaN(count) || count <= 0) {
      toast.warning(t("graphModal.invalidNodeCount"));
      return;
    }

    const lines = draftEdgeInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    const invalidLines: string[] = [];

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (resolvedValidator) {
        const error = resolvedValidator(parts, count, t);
        if (error) {
          toast.warning(error);
          return;
        }
      }

      const u = parseInt(parts[0], 10);
      const v = parseInt(parts[1], 10);
      const isValidIdx = (n: number) => !isNaN(n) && n >= 0 && n < count;
      if (!isValidIdx(u) || !isValidIdx(v)) {
        invalidLines.push(line);
      }
    }

    if (invalidLines.length > 0) {
      toast.warning(
        t("graphModal.outOfRangeError", {
          count: count - 1,
          lines: invalidLines.join(", "),
        }),
      );
      return;
    }

    const edges = lines.map((line) => line.replace(/\s+/g, " ")).join(",");
    setCommittedNodeCount(draftNodeCount);
    setCommittedEdgeInput(draftEdgeInput);
    onLoad(`GRAPH:${count}:${edges}`);
    onClose();
  };

  return (
    <Dialog
      isOpen={show}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className={styles.loaderDialog}
      headerClassName={styles.loaderDialogHeader}
      contentClassName={styles.loaderDialogContent}
      footerClassName={styles.loaderDialogFooter}
      title={t("graphModal.title")}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoad}
            className={styles.modalConfirmButton}
          >
            {t("common.confirmLoad")}
          </Button>
        </>
      }
    >
      <div className={styles.modalFieldRow}>
        <label className={styles.modalLabel}>
          {t("graphModal.nodeCountLabel")}
        </label>
        <Input
          type="number"
          value={draftNodeCount}
          fullWidth={false}
          min={1}
          max={DATA_LIMITS.MAX_GRAPH_NODE_COUNT}
          onChange={(e) => setDraftNodeCount(clampNumberInput(e.target.value, 1, DATA_LIMITS.MAX_GRAPH_NODE_COUNT))}
          className={`${styles.input} ${styles.nodeCountInput}`}
          aria-label="Node count"
        />
      </div>
      <div className={styles.modalFieldColumn}>
        <label className={styles.modalLabel}>{t(defaults.edgeLabelKey)}</label>
        <Textarea
          value={draftEdgeInput}
          onChange={(e) => setDraftEdgeInput(e.target.value)}
          rows={6}
          className={styles.modalGraphTextarea}
          placeholder={defaults.edgePlaceholder}
        />
      </div>
    </Dialog>
  );
};

// ─── GridLoaderModal ────────────────────────────────────────

export interface GridLoaderModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (data: string) => void;
}

export const GridLoaderModal: React.FC<GridLoaderModalProps> = ({
  show,
  onClose,
  onLoad,
}) => {
  const { t } = useTranslation("tutorials/actionbar");
  const DEFAULT_GRID = "0 0 0 0 0\n0 1 1 1 0\n0 0 0 0 0";
  const [committedGridText, setCommittedGridText] = useState(DEFAULT_GRID);
  const [draftGridText, setDraftGridText] = useState(DEFAULT_GRID);

  useEffect(() => {
    if (show) setDraftGridText(committedGridText);
  }, [show]);

  const handleLoad = () => {
    const trimmed = draftGridText.trim();
    if (trimmed === "") {
      toast.warning(t("gridModal.emptyWarning"));
      return;
    }

    const rowsArr = trimmed
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r !== "");
    const parsedRows: number[][] = [];
    let firstRowCols = -1;

    for (let i = 0; i < rowsArr.length; i++) {
      const cells = rowsArr[i].split(/[\s,]+/).filter(Boolean);
      for (const cell of cells) {
        if (cell !== "0" && cell !== "1") {
          toast.warning(
            t("gridModal.invalidCellWarning", { row: i + 1, cell }),
          );
          return;
        }
      }
      const nums = cells.map(Number);
      if (firstRowCols === -1) {
        firstRowCols = nums.length;
      } else if (nums.length !== firstRowCols) {
        toast.warning(
          t("gridModal.columnMismatchWarning", {
            row: i + 1,
            cols: nums.length,
            firstCols: firstRowCols,
          }),
        );
        return;
      }
      parsedRows.push(nums);
    }

    const rows = parsedRows.length;
    const cols = firstRowCols;

    if (rows < 1 || cols < 1) {
      toast.warning(t("gridModal.minSizeWarning"));
      return;
    }

    if (rows * cols > 400) {
      toast.warning(
        t("gridModal.maxSizeWarning", { rows, cols, total: rows * cols }),
      );
      return;
    }

    const gridData = parsedRows.flat();
    setCommittedGridText(draftGridText);
    onLoad(`GRID:${cols}:${gridData.join(",")}`);
    onClose();
  };

  return (
    <Dialog
      isOpen={show}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className={styles.loaderDialog}
      headerClassName={styles.loaderDialogHeader}
      contentClassName={styles.loaderDialogContent}
      footerClassName={styles.loaderDialogFooter}
      title={t("gridModal.title")}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoad}
            className={styles.modalConfirmButton}
          >
            {t("common.confirmLoad")}
          </Button>
        </>
      }
    >
      <Textarea
        value={draftGridText}
        onChange={(e) => setDraftGridText(e.target.value)}
        rows={5}
        className={styles.modalTextarea}
        placeholder={"0 0 0\n0 1 0\n0 0 0"}
      />
    </Dialog>
  );
};

// ─── KnapsackLoaderModal ──────────────────────────────────────

export interface KnapsackLoaderModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (itemsStr: string) => void;
}

export const KnapsackLoaderModal: React.FC<KnapsackLoaderModalProps> = ({
  show,
  onClose,
  onLoad,
}) => {
  const { t } = useTranslation("tutorials/actionbar");
  const DEFAULT_ITEMS = "1 15\n3 20\n4 30";
  const [committedItemInput, setCommittedItemInput] = useState(DEFAULT_ITEMS);
  const [draftItemInput, setDraftItemInput] = useState(DEFAULT_ITEMS);

  useEffect(() => {
    if (show) setDraftItemInput(committedItemInput);
  }, [show]);

  const handleLoad = () => {
    const lines = draftItemInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (
        parts.length < 2 ||
        isNaN(Number(parts[0])) ||
        isNaN(Number(parts[1]))
      ) {
        toast.warning(t("knapsackModal.formatError"));
        return;
      }
      if (Number(parts[0]) <= 0 || Number(parts[1]) <= 0) {
        toast.warning(t("knapsackModal.positiveError"));
        return;
      }
    }

    const items = lines.map((line) => line.replace(/\s+/g, " ")).join(",");
    setCommittedItemInput(draftItemInput);
    onLoad(items);
    onClose();
  };

  return (
    <Dialog
      isOpen={show}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className={styles.loaderDialog}
      headerClassName={styles.loaderDialogHeader}
      contentClassName={styles.loaderDialogContent}
      footerClassName={styles.loaderDialogFooter}
      title={t("knapsackModal.title")}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoad}
            className={styles.modalConfirmButton}
          >
            {t("common.confirmLoad")}
          </Button>
        </>
      }
    >
      <div className={styles.modalFieldColumn}>
        <label className={styles.modalLabel}>
          {t("knapsackModal.inputLabel")}
        </label>
        <Textarea
          value={draftItemInput}
          onChange={(e) => setDraftItemInput(e.target.value)}
          rows={6}
          className={styles.modalGraphTextarea}
          placeholder={"1 15\n3 20\n4 30"}
        />
      </div>
    </Dialog>
  );
};

export { styles };
