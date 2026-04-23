"""
complexity_analyzer.py — big-O 步驟計數 + 曲線擬合

measure_step_counts(wrapped_code) -> str
  對多個 n 值執行 wrapped_code，收集 step_count，曲線擬合回傳複雜度標籤。
  可用資料點 < 2 時回傳 "unknown"。
"""
from __future__ import annotations

import numpy as np
from scipy.optimize import curve_fit

from services.sandbox import run_in_sandbox

N_VALUES = [10, 50, 100, 200, 500]
PER_N_TIMEOUT = 5  # 秒，每個 n 值的獨立 timeout


def measure_step_counts(wrapped_code: str) -> str:
    """
    對 N_VALUES 中每個 n 執行 wrapped_code（呼叫 explore_wrapper(n)），
    收集 step_count，曲線擬合後回傳複雜度標籤。
    """
    counts: list[int] = []
    valid_ns: list[int] = []

    for n in N_VALUES:
        result = run_in_sandbox(wrapped_code, n=n, per_n_timeout=PER_N_TIMEOUT)
        if "error" in result:
            break
        counts.append(result.get("step_count", 0))
        valid_ns.append(n)

    if len(valid_ns) < 2:
        return "unknown"

    return fit_complexity(valid_ns, counts)


def fit_complexity(ns: list[int], counts: list[int]) -> str:
    """
    對候選複雜度函數做最小二乘擬合，回傳殘差最小的標籤。
    O(1) 使用單參數擬合避免退化；其餘用雙參數 a*f(n)+b 消除常數開銷干擾。
    """
    ns_arr = np.array(ns, dtype=float)
    ys_arr = np.array(counts, dtype=float)

    candidates: dict[str, object] = {
        "O(1)":       lambda n, a: np.full_like(n, a),
        "O(log n)":   lambda n, a, b: a * np.log2(np.maximum(n, 1)) + b,
        "O(n)":       lambda n, a, b: a * n + b,
        "O(n log n)": lambda n, a, b: a * n * np.log2(np.maximum(n, 1)) + b,
        "O(n²)":      lambda n, a, b: a * n ** 2 + b,
        "O(n³)":      lambda n, a, b: a * n ** 3 + b,
        "O(2ⁿ)":      lambda n, a, b: a * np.exp2(np.clip(n, 0, 50)) + b,
    }

    best_label = "O(n)"
    best_residual = float("inf")

    for label, func in candidates.items():
        try:
            popt, _ = curve_fit(func, ns_arr, ys_arr, maxfev=1000)
            residual = float(np.sum((ys_arr - func(ns_arr, *popt)) ** 2))
            if residual < best_residual:
                best_residual = residual
                best_label = label
        except Exception:
            continue

    return best_label
