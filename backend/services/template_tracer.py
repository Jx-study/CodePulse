"""
template_tracer.py — Level 1 模板驅動 Trace 產生器

對外唯一入口：build_level1_trace()
"""
from __future__ import annotations

import copy
import logging
from dataclasses import dataclass, field

try:
    from services.reference_implementations.sorting import (
        bubble_sort, selection_sort, insertion_sort,
    )
    from services.reference_implementations.searching import (
        linear_search, binary_search,
    )
except ImportError:
    from reference_implementations.sorting import (
        bubble_sort, selection_sort, insertion_sort,
    )
    from reference_implementations.searching import (
        linear_search, binary_search,
    )

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 內部資料結構
# ---------------------------------------------------------------------------

@dataclass
class TagEvent:
    tag: str
    variables: dict = field(default_factory=dict)
    dataSnapshot: list = field(default_factory=list)


# ---------------------------------------------------------------------------
# 支援的演算法映射
# ---------------------------------------------------------------------------

def _make_sort_runner(fn):
    """包裝 sorting 函式，統一為 (data, target, _tag) 簽名（target 忽略）。"""
    def runner(data, target, _tag):
        fn(data, _tag)
    return runner


SUPPORTED_ALGORITHMS: dict = {
    "bubble_sort":    _make_sort_runner(bubble_sort),
    "selection_sort": _make_sort_runner(selection_sort),
    "insertion_sort": _make_sort_runner(insertion_sort),
    "linear_search":  linear_search,
    "binary_search":  binary_search,
}


# ---------------------------------------------------------------------------
# run_reference_trace
# ---------------------------------------------------------------------------

def run_reference_trace(
    algo_name: str,
    input_data: list,
    target=None,
) -> list:
    """
    執行標準實作，回傳純 TagEvent[]。
    algo_name 未知時回傳 []。
    """
    algo_fn = SUPPORTED_ALGORITHMS.get(algo_name)
    if algo_fn is None:
        return []

    trace_log: list = []
    data = copy.deepcopy(input_data)

    def _tag(tag_name: str, **kwargs):
        trace_log.append(TagEvent(
            tag=tag_name,
            variables=kwargs,
            dataSnapshot=copy.deepcopy(data),
        ))

    try:
        algo_fn(data, target, _tag)
    except Exception as exc:
        logger.warning("run_reference_trace failed for %s: %s", algo_name, exc)
        return []

    return trace_log


# ---------------------------------------------------------------------------
# align_snapshots
# ---------------------------------------------------------------------------

try:
    from services.tracer import TraceEvent
except ImportError:
    from tracer import TraceEvent  # 測試環境 fallback


def _extract_user_snapshots(user_raw_trace) -> list:
    """
    從用戶 raw trace 提取 list 型別變數的快照序列。
    只保留狀態有變化的快照點（去除連續重複）。
    回傳 list of (snapshot, raw_index)。
    """
    import ast
    snapshots: list = []
    last_snapshot = None

    for raw_idx, event in enumerate(user_raw_trace):
        for val_str in event.local_vars.values():
            try:
                val = ast.literal_eval(val_str)
                if isinstance(val, list) and val != last_snapshot:
                    snapshots.append((val, raw_idx))
                    last_snapshot = val
                    break  # 每個 event 只取第一個 list 變數
            except (ValueError, SyntaxError):
                continue

    return snapshots


def align_snapshots(
    ref_trace: list,
    user_raw_trace: list,
):
    """
    策略 C：
    1. 索引對齊（策略 A）：長度相同時直接對齊
    2. 狀態比對（策略 B）：找內容相同的快照
    3. 失敗 → None

    回傳 (aligned: list[TagEvent], raw_index_map: list[int]) 或 None。
    raw_index_map[i] = 語意第 i 步對應的 rawTrace index。
    """
    snapshot_pairs = _extract_user_snapshots(user_raw_trace)
    # 允許只有 1 個快照（搜尋演算法 data 不變的情況）
    if len(snapshot_pairs) == 0:
        return None

    user_snapshots = [snap for snap, _ in snapshot_pairs]
    raw_indices = [idx for _, idx in snapshot_pairs]

    result = [copy.copy(e) for e in ref_trace]  # shallow copy，保留 tag/variables

    # 策略 A：索引對齊
    if len(user_snapshots) == len(ref_trace):
        for i, event in enumerate(result):
            event.dataSnapshot = user_snapshots[i]
        return result, raw_indices

    # 策略 B：狀態比對
    raw_index_map: list = [0] * len(ref_trace)
    matched = 0
    for i, event in enumerate(result):
        for snap, raw_idx in snapshot_pairs:
            if snap == event.dataSnapshot:
                event.dataSnapshot = snap
                raw_index_map[i] = raw_idx
                matched += 1
                break

    match_rate = matched / len(ref_trace) if ref_trace else 0
    if match_rate >= 0.8:
        return result, raw_index_map

    return None


# ---------------------------------------------------------------------------
# build_level1_trace
# ---------------------------------------------------------------------------

def build_level1_trace(
    algo_name: str,
    user_raw_trace: list,
    input_data,
    target=None,
):
    """
    成功 → 回傳 (trace_events: TraceEvent[], raw_index_map: list[int])
           raw_index_map[i] = 語意第 i 步對應的 rawTrace index（用於前端行號高亮）
    失敗 → 回傳 None（caller 負責 fallback Level 2）
    永遠不 raise。
    """
    try:
        if not isinstance(input_data, list) or len(input_data) == 0:
            return None

        ref_trace = run_reference_trace(algo_name, input_data, target=target)
        if not ref_trace:
            return None

        align_result = align_snapshots(ref_trace, user_raw_trace)
        if align_result is None:
            return None

        aligned, raw_index_map = align_result

        # 轉換 TagEvent[] → TraceEvent[]（符合前端 trace.ts 契約）
        trace_events = [
            TraceEvent(
                tag=event.tag,
                local_vars=event.variables,
                global_vars={},
                dataSnapshot=event.dataSnapshot,
                meta={},
            )
            for event in aligned
        ]
        return trace_events, raw_index_map

    except Exception as exc:
        logger.warning("build_level1_trace failed for %s: %s", algo_name, exc)
        return None
