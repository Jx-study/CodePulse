"""
precheck.py — 語法預檢 + 自動包裝

precheck_and_wrap(code):
  - AST parse 失敗 → 拋出 SyntaxError（含行號）
  - 頂層無 def → 自動包裝 explore_wrapper(n)
  - 回傳 (processed_code, is_wrapped)
"""

import ast


def precheck_and_wrap(code: str) -> tuple[str, bool]:
    """
    回傳 (處理後的 code, is_wrapped)。
    語法錯誤時拋出 SyntaxError（含行號與訊息）。
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        raise

    has_def = any(isinstance(n, ast.FunctionDef) for n in ast.iter_child_nodes(tree))
    if has_def:
        return code, False

    wrapped = "def explore_wrapper(n):\n"
    wrapped += "\n".join("    " + line for line in code.splitlines())
    return wrapped, True
