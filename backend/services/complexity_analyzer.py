"""
complexity_analyzer.py — big-O 步驟計數 + 曲線擬合

measure_step_counts(wrapped_code) -> str
  對多個 n 值執行 wrapped_code，收集 step_count，曲線擬合回傳複雜度標籤。
  可用資料點 < 2 時回傳 "unknown"。
"""
from __future__ import annotations

import ast as _ast
import concurrent.futures
import numpy as np
from scipy.optimize import curve_fit

from services.sandbox import run_in_sandbox
from services.complexity_labels import normalize_complexity

_INT_PARAMS = {"n", "k", "x", "num", "target", "val", "value", "count"}
_LIST_PARAMS = {"arr", "nums", "lst", "array", "data", "items", "values"}
_STR_PARAMS = {"s", "string", "text", "word", "pattern"}
_MATRIX_PARAMS = {"matrix", "grid", "board"}


def _find_main_func(tree: _ast.Module) -> _ast.FunctionDef | None:
    top_funcs: list[_ast.FunctionDef] = [
        node for node in tree.body if isinstance(node, _ast.FunctionDef)
    ]
    if not top_funcs:
        return None

    called: set[str] = set()
    for func in top_funcs:
        for node in _ast.walk(func):
            if (
                isinstance(node, _ast.Call)
                and isinstance(node.func, _ast.Name)
                and node.func.id != func.name
            ):
                called.add(node.func.id)

    uncalled = [f for f in top_funcs if f.name not in called]

    if len(uncalled) == 1:
        return uncalled[0]
    return top_funcs[-1]


def _is_recursive(func: _ast.FunctionDef) -> bool:
    for node in _ast.walk(func):
        if (
            isinstance(node, _ast.Call)
            and isinstance(node.func, _ast.Name)
            and node.func.id == func.name
        ):
            return True
    return False


def generate_bigo_wrapper(code: str) -> str | None:
    """
    Appends a def explore_wrapper(n): ... definition to code for bigO measurement.
    Returns None when a wrapper cannot be generated (recursive, unknown param, etc.).
    """
    try:
        tree = _ast.parse(code)
    except SyntaxError:
        return None

    main_func = _find_main_func(tree)
    if main_func is None:
        return None

    if _is_recursive(main_func):
        return None

    args = main_func.args.args
    if not args:
        return None

    first_param = args[0].arg
    func_name = main_func.name

    if first_param in _INT_PARAMS:
        call_expr = f"{func_name}(n)"
    elif first_param in _LIST_PARAMS:
        call_expr = f"{func_name}(list(range(n, 0, -1)))"
    elif first_param in _STR_PARAMS:
        call_expr = f'{func_name}("a" * n)'
    elif first_param in _MATRIX_PARAMS:
        call_expr = f"{func_name}([[0]*10 for _ in range(n)])"
    else:
        return None

    wrapper = f"\ndef explore_wrapper(n):\n    {call_expr}\n"
    return code + wrapper


N_VALUES = [10, 50, 100, 200, 500]
PER_N_TIMEOUT = 5  # 秒，每個 n 值的獨立 timeout


def measure_step_counts(wrapped_code: str) -> str:
    """
    對 N_VALUES 中每個 n 平行執行 wrapped_code（呼叫 explore_wrapper(n)），
    收集 step_count，曲線擬合後回傳複雜度標籤。
    """
    def _run_one(n: int) -> tuple[int, dict]:
        return n, run_in_sandbox(wrapped_code, n=n, per_n_timeout=PER_N_TIMEOUT)

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(N_VALUES)) as pool:
        futures = {pool.submit(_run_one, n): n for n in N_VALUES}
        results: dict[int, dict] = {}
        for fut in concurrent.futures.as_completed(futures):
            n, result = fut.result()
            results[n] = result

    counts: list[int] = []
    valid_ns: list[int] = []
    for n in N_VALUES:
        result = results[n]
        if "error" in result:
            continue
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

    return normalize_complexity(best_label) or "unknown"
