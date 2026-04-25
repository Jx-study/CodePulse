"""
ast_complexity.py — AST 靜態時間複雜度分析

analyze_complexity(code) -> str
  回傳複雜度標籤，如 "O(n²)"、"O(n log n)"。
  無法判斷時回傳 "unknown"。
"""
from __future__ import annotations

import ast


def _max_loop_depth(node: ast.AST) -> int:
    """遞迴計算 AST 中最深的巢狀迴圈層數（for / while）。"""
    if isinstance(node, (ast.For, ast.While)):
        child_depth = max(
            (_max_loop_depth(child) for child in ast.iter_child_nodes(node)),
            default=0,
        )
        return 1 + child_depth
    max_d = 0
    for child in ast.iter_child_nodes(node):
        max_d = max(max_d, _max_loop_depth(child))
    return max_d


def _has_direct_recursion(func_def: ast.FunctionDef) -> bool:
    """偵測函式是否直接呼叫自身。"""
    func_name = func_def.name
    for node in ast.walk(func_def):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == func_name:
                return True
    return False


def is_recursive(code: str) -> bool:
    """Return True if any top-level function in code calls itself directly."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return False
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and _has_direct_recursion(node):
            return True
    return False


def analyze_complexity(code: str) -> str:
    """
    靜態分析 code 的時間複雜度。

    回傳標籤：
      "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n²)" | "O(n³)" | "unknown"
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return "unknown"

    func_defs = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]

    if not func_defs:
        targets = [tree]
    else:
        targets = func_defs

    order = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "unknown"]

    def _higher(a: str, b: str) -> str:
        ia = order.index(a) if a in order else len(order)
        ib = order.index(b) if b in order else len(order)
        return a if ia >= ib else b

    best = "O(1)"
    for target in targets:
        is_recursive = isinstance(target, ast.FunctionDef) and _has_direct_recursion(target)
        loop_depth = _max_loop_depth(target)

        if is_recursive and loop_depth >= 1:
            label = "O(n log n)"
        elif is_recursive:
            label = "O(log n)"
        elif loop_depth == 0:
            label = "O(1)"
        elif loop_depth == 1:
            label = "O(n)"
        elif loop_depth == 2:
            label = "O(n²)"
        else:
            label = "O(n³)"

        best = _higher(best, label)

    return best
