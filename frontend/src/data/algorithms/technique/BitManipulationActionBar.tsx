import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
import { toast } from "@/shared/components/Toast";
import { DATA_LIMITS, clampNumberInput } from "@/constants/dataLimits";
import type {
  AlgoActionBarProps,
  AlgorithmViewMode,
  BitManipulationMode,
  RunParams,
} from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";
import {
  BIT_WIDTH,
  MAX_BIT_VALUE,
  type BitManipulationData,
  type BitOp,
  type SingleBitOp,
} from "./bitManipulation/simulateTrace";

const DEFAULT_MODE: BitManipulationMode = "bit_ops";
const MODES: BitManipulationMode[] = [
  "bit_ops",
  "single_bit",
  "xor_swap",
  "lowbit",
  "count_bits",
  "subsets",
];
const OPS: BitOp[] = ["AND", "OR", "XOR", "NOT", "SHL", "SHR"];
const SINGLE_OPS: SingleBitOp[] = ["SET", "TEST", "CLEAR", "TOGGLE"];
const MAX_TARGET = DATA_LIMITS.MAX_SUBSET_ITEM * DATA_LIMITS.MAX_SUBSET_ITEMS;
const MAX_K = BIT_WIDTH - 1;

const OP_LABELS: Record<BitOp, string> = {
  AND: "AND (&)",
  OR: "OR (|)",
  XOR: "XOR (^)",
  NOT: "NOT (~)",
  SHL: "<<",
  SHR: ">>",
};

const isShift = (op: BitOp) => op === "SHL" || op === "SHR";

function toBitManipulationMode(viewMode: AlgorithmViewMode | undefined): BitManipulationMode {
  return MODES.includes(viewMode as BitManipulationMode) ? (viewMode as BitManipulationMode) : DEFAULT_MODE;
}

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const parseItems = (text: string): number[] | null => {
  const parts = text.split(/[,\s]+/).filter(Boolean);
  if (parts.length === 0 || parts.length > DATA_LIMITS.MAX_SUBSET_ITEMS) return null;
  const nums = parts.map((p) => Number(p));
  const valid = nums.every(
    (v) =>
      Number.isInteger(v) &&
      v >= DATA_LIMITS.MIN_SUBSET_ITEM &&
      v <= DATA_LIMITS.MAX_SUBSET_ITEM,
  );
  return valid ? nums : null;
};

type InputState = {
  a: string;
  b: string;
  op: BitOp;
  k: string;
  singleOp: SingleBitOp;
  n: string;
  items: string;
  target: string;
};

const FALLBACK: InputState = {
  a: "12",
  b: "10",
  op: "AND",
  k: "2",
  singleOp: "SET",
  n: "44",
  items: "3, 5, 2, 7",
  target: "10",
};

/** 以畫布目前的資料為準，讓切換分頁或模式後輸入框和畫面一致 */
const fromData = (data: Partial<BitManipulationData> | undefined): InputState => {
  if (!data || typeof data !== "object") return FALLBACK;
  return {
    a: String(data.a ?? FALLBACK.a),
    b: String(data.b ?? FALLBACK.b),
    op: data.op ?? FALLBACK.op,
    k: String(data.k ?? FALLBACK.k),
    singleOp: data.singleOp ?? FALLBACK.singleOp,
    n: String(data.n ?? FALLBACK.n),
    items: Array.isArray(data.items) ? data.items.join(", ") : FALLBACK.items,
    target: String(data.target ?? FALLBACK.target),
  };
};

export const BitManipulationActionBar: React.FC<AlgoActionBarProps> = ({
  onResetData,
  disabled = false,
  onRun,
  onRandomData,
  viewMode,
  onViewModeChange,
  currentData,
}) => {
  const { t } = useTranslation("tutorials/bit-manipulation");
  const currentMode = toBitManipulationMode(viewMode);
  const [inputs, setInputs] = useState<InputState>(() => fromData(currentData));

  useEffect(() => {
    setInputs(fromData(currentData));
  }, [currentData]);

  const set = <K extends keyof InputState>(key: K, value: InputState[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as BitManipulationMode;
    if (MODES.includes(v)) onViewModeChange?.(v);
  };

  const invalid = (key: string) => {
    toast.warning(t(key));
  };

  const handleRun = () => {
    const a = parseInt(inputs.a, 10);
    if (currentMode === "bit_ops") {
      const b = parseInt(inputs.b, 10);
      if (isNaN(a) || (inputs.op !== "NOT" && isNaN(b))) return invalid("ui.invalidNumber");
      onRun({
        type: "bitManipulation",
        mode: currentMode,
        a,
        b: isNaN(b) ? 0 : isShift(inputs.op) ? Math.min(b, BIT_WIDTH) : b,
        op: inputs.op,
      });
      return;
    }
    if (currentMode === "single_bit") {
      const k = parseInt(inputs.k, 10);
      if (isNaN(a) || isNaN(k)) return invalid("ui.invalidNumber");
      onRun({ type: "bitManipulation", mode: currentMode, a, k, singleOp: inputs.singleOp });
      return;
    }
    if (currentMode === "xor_swap") {
      const b = parseInt(inputs.b, 10);
      if (isNaN(a) || isNaN(b)) return invalid("ui.invalidNumber");
      onRun({ type: "bitManipulation", mode: currentMode, a, b });
      return;
    }
    if (currentMode === "lowbit") {
      if (isNaN(a)) return invalid("ui.invalidNumber");
      onRun({ type: "bitManipulation", mode: currentMode, a });
      return;
    }
    if (currentMode === "count_bits") {
      const n = parseInt(inputs.n, 10);
      if (isNaN(n)) return invalid("ui.invalidNumber");
      onRun({ type: "bitManipulation", mode: currentMode, n });
      return;
    }
    const items = parseItems(inputs.items);
    const target = parseInt(inputs.target, 10);
    if (!items || isNaN(target)) return invalid("ui.invalidItems");
    onRun({ type: "bitManipulation", mode: currentMode, items, target });
  };

  // 隨機只換資料、停在第一步，和其他關卡的隨機一樣，要按「開始執行」才播放
  const randomize = (params: RunParams) => onRandomData(params);

  const handleRandom = () => {
    if (currentMode === "bit_ops") {
      const op = OPS[randomInt(0, OPS.length - 1)];
      const a = randomInt(0, MAX_BIT_VALUE);
      const b = isShift(op) ? randomInt(1, 3) : randomInt(0, MAX_BIT_VALUE);
      randomize({ type: "bitManipulation", mode: currentMode, a, b, op });
      return;
    }
    if (currentMode === "single_bit") {
      const singleOp = SINGLE_OPS[randomInt(0, SINGLE_OPS.length - 1)];
      randomize({
        type: "bitManipulation",
        mode: currentMode,
        a: randomInt(0, MAX_BIT_VALUE),
        k: randomInt(0, MAX_K),
        singleOp,
      });
      return;
    }
    if (currentMode === "xor_swap") {
      randomize({
        type: "bitManipulation",
        mode: currentMode,
        a: randomInt(0, MAX_BIT_VALUE),
        b: randomInt(0, MAX_BIT_VALUE),
      });
      return;
    }
    if (currentMode === "lowbit") {
      randomize({ type: "bitManipulation", mode: currentMode, a: randomInt(1, MAX_BIT_VALUE) });
      return;
    }
    if (currentMode === "count_bits") {
      randomize({ type: "bitManipulation", mode: currentMode, n: randomInt(1, MAX_BIT_VALUE) });
      return;
    }
    const count = randomInt(3, DATA_LIMITS.MAX_SUBSET_ITEMS);
    const items = Array.from({ length: count }, () => randomInt(1, 9));
    // 從隨機子集取目標和，保證至少有一組解
    const pickMask = randomInt(1, (1 << count) - 1);
    const target = items.reduce((acc, v, j) => ((pickMask >> j) & 1 ? acc + v : acc), 0);
    randomize({ type: "bitManipulation", mode: currentMode, items, target });
  };

  type FieldName = "a" | "b" | "s" | "op" | "k" | "singleOp" | "n" | "items" | "target";

  /** 每個輸入欄位左邊都有標籤，滑鼠移上去會說明這個值代表什麼 */
  const field = (name: FieldName, control: React.ReactElement) => (
    <Tooltip key={name} content={t(`ui.field.${name}.hint`)}>
      <div className={styles.viewModeContainer}>
        <span className={styles.viewModeLabel}>{t(`ui.field.${name}.label`)}:</span>
        {control}
      </div>
    </Tooltip>
  );

  const numberInput = (
    key: "a" | "b" | "k" | "n" | "target",
    max: number,
    name: FieldName = key,
  ) =>
    field(
      name,
      <Input
        type="number"
        value={inputs[key]}
        min={0}
        max={max}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          set(key, clampNumberInput(e.target.value, 0, max))
        }
        className={`${styles.input} ${styles.valueInput}`}
        disabled={disabled}
        fullWidth={false}
        aria-label={t(`ui.field.${name}.label`)}
      />,
    );

  const selectBox = <T extends string>(
    name: FieldName,
    value: T,
    options: { value: T; label: string }[],
    onChange: (v: T) => void,
  ) =>
    field(
      name,
      <Select
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as T)}
        disabled={disabled}
        size="sm"
        fullWidth={false}
        className={styles.viewModeSelect}
        options={options}
        aria-label={t(`ui.field.${name}.label`)}
      />,
    );

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <Button size="sm" onClick={onResetData} disabled={disabled} icon="rotate-right">
          {t("ui.reset")}
        </Button>
        <Button size="sm" onClick={handleRandom} disabled={disabled} icon="shuffle">
          {t("ui.random")}
        </Button>
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{t("ui.controlLabel")}</StaticLabel>
        <div className={styles.viewModeContainer}>
          <span className={styles.viewModeLabel}>{t("ui.modeLabel")}:</span>
          <Select
            value={currentMode}
            onChange={handleModeChange}
            disabled={disabled}
            size="sm"
            fullWidth={false}
            className={styles.viewModeSelect}
            options={MODES.map((m) => ({ value: m, label: t(`ui.mode.${m}`) }))}
            aria-label={t("ui.ariaMode")}
          />
        </div>

        {currentMode === "bit_ops" && (
          <>
            {numberInput("a", MAX_BIT_VALUE)}
            {selectBox(
              "op",
              inputs.op,
              OPS.map((op) => ({ value: op, label: OP_LABELS[op] })),
              (v) =>
                setInputs((prev) => ({
                  ...prev,
                  op: v,
                  // b 同時當位移量用，切到移位時若超出 0 ~ 8 就改成 1
                  b: isShift(v) && Number(prev.b) > BIT_WIDTH ? "1" : prev.b,
                })),
            )}
            {inputs.op !== "NOT" &&
              (isShift(inputs.op)
                ? numberInput("b", BIT_WIDTH, "s")
                : numberInput("b", MAX_BIT_VALUE))}
          </>
        )}

        {currentMode === "single_bit" && (
          <>
            {numberInput("a", MAX_BIT_VALUE)}
            {selectBox(
              "singleOp",
              inputs.singleOp,
              SINGLE_OPS.map((op) => ({ value: op, label: t(`ui.singleOp.${op}`) })),
              (v) => set("singleOp", v),
            )}
            {numberInput("k", MAX_K)}
          </>
        )}

        {currentMode === "xor_swap" && (
          <>
            {numberInput("a", MAX_BIT_VALUE)}
            {numberInput("b", MAX_BIT_VALUE)}
          </>
        )}

        {currentMode === "lowbit" && numberInput("a", MAX_BIT_VALUE)}

        {currentMode === "count_bits" && numberInput("n", MAX_BIT_VALUE)}

        {currentMode === "subsets" && (
          <>
            {field(
              "items",
              <Input
                placeholder={t("ui.placeholderItems")}
                value={inputs.items}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("items", e.target.value)}
                className={styles.input}
                disabled={disabled}
                fullWidth={false}
                aria-label={t("ui.field.items.label")}
              />,
            )}
            {numberInput("target", MAX_TARGET)}
          </>
        )}

        <Tooltip content={t(`ui.runTooltip.${currentMode}`)}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRun}
            disabled={disabled}
            className={styles.btnRun}
            icon="play"
          >
            {t("ui.run")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
