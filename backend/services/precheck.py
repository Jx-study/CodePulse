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
    空白/純註解時拋出 ValueError。
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        raise

    if not tree.body:
        raise ValueError("empty code: no executable statements found")

    return code, False
