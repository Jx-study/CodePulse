import { StatusConfig } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export const TAGS = {
  // 位元運算：逐位計算 a OP b；每種運算各自一個 tag，讓虛擬碼高亮對應的那一行
  OPS_INIT: "OPS_INIT",
  OPS_BIT_AND: "OPS_BIT_AND",
  OPS_BIT_OR: "OPS_BIT_OR",
  OPS_BIT_XOR: "OPS_BIT_XOR",
  OPS_BIT_NOT: "OPS_BIT_NOT",
  OPS_BIT_SHL: "OPS_BIT_SHL",
  OPS_BIT_SHR: "OPS_BIT_SHR",
  OPS_DONE: "OPS_DONE",
  // 單一位元操作：用 1 << k 做出遮罩，再設定 / 檢查 / 清除 / 翻轉第 k 位
  SINGLE_INIT: "SINGLE_INIT",
  SINGLE_MASK: "SINGLE_MASK",
  SINGLE_SET: "SINGLE_SET",
  SINGLE_TEST: "SINGLE_TEST",
  SINGLE_CLEAR: "SINGLE_CLEAR",
  SINGLE_TOGGLE: "SINGLE_TOGGLE",
  // XOR 交換：a = a ^ b、b = a ^ b、a = a ^ b，不用暫存變數
  SWAP_INIT: "SWAP_INIT",
  SWAP_STEP1: "SWAP_STEP1",
  SWAP_STEP2: "SWAP_STEP2",
  SWAP_STEP3: "SWAP_STEP3",
  SWAP_DONE: "SWAP_DONE",
  // lowbit：a & -a 只留下最低位的 1，-a 用二補數 ~a + 1 算出
  LOWBIT_INIT: "LOWBIT_INIT",
  LOWBIT_NOT: "LOWBIT_NOT",
  LOWBIT_NEG: "LOWBIT_NEG",
  LOWBIT_AND: "LOWBIT_AND",
  // 計算 1 的個數：n & (n - 1) 每次清掉最低位的 1
  COUNT_INIT: "COUNT_INIT",
  COUNT_MINUS_ONE: "COUNT_MINUS_ONE",
  COUNT_CLEAR: "COUNT_CLEAR",
  COUNT_DONE: "COUNT_DONE",
  // 子集枚舉：mask 的第 j 位代表是否選 arr[j]
  SUBSET_INIT: "SUBSET_INIT",
  SUBSET_CHECK: "SUBSET_CHECK",
  SUBSET_FOUND: "SUBSET_FOUND",
  SUBSET_DONE: "SUBSET_DONE",
} as const;

export const BitManipulationStatus = {
  Inactive: Status.Inactive, // 標籤 / 位權 / 未參與的欄位
  Unfinished: Status.Unfinished, // 值為 0 的位元
  Prepare: Status.Prepare, // 正在處理的欄位 / 被選中的元素
  Target: Status.Target, // 當前結果位元 / 最低位的 1
  Complete: Status.Complete, // 已算出的結果 / 符合條件的子集
  One: "one", // 值為 1 的位元
} as const;

export const BitManipulationStatusConfig: StatusConfig = {
  i18nNs: "tutorials/bit-manipulation",
  statuses: [
    { key: BitManipulationStatus.Inactive,   label: "statusLegend.label",   color: "#555555" },
    { key: BitManipulationStatus.Unfinished, label: "statusLegend.zero",    color: "#1d79cfff" },
    { key: BitManipulationStatus.One,        label: "statusLegend.one",     color: "#a855f7" },
    { key: BitManipulationStatus.Prepare,    label: "statusLegend.active",  color: "#f59e0b" },
    { key: BitManipulationStatus.Target,     label: "statusLegend.current", color: "#ff6b35" },
    { key: BitManipulationStatus.Complete,   label: "statusLegend.result",  color: "#46f336ff" },
  ],
};
