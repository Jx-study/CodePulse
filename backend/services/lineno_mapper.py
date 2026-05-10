"""
lineno_mapper.py — 把 Level 1 語意 tag 對應到 user code 的行號

對外唯一入口：map_tags_to_linenos(code, algo_name) -> dict[str, int]

策略：對每個 algo 用 AST walk 找「最能代表該語意的節點行號」。
不追求 100% 精準，目標是讓 90%+ 常見寫法正確對應。
找不到就回傳 None（前端不高亮）。
"""
from __future__ import annotations

import ast
from typing import Callable


def map_tags_to_linenos(code: str, algo_name: str) -> dict[str, int | list[int] | None]:
    """
    解析 user code，回傳 {tag_name: lineno} mapping。
    lineno 是 1-based（與 CodeEditor 一致）。
    值可以是單一 int 或 list[int]（多行同時高亮）。
    找不到的 tag 值為 None。
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return {}

    mapper = _MAPPERS.get(algo_name)
    if mapper is None:
        return {}

    return mapper(tree)


# ---------------------------------------------------------------------------
# 共用輔助函式
# ---------------------------------------------------------------------------

def _find_func(tree: ast.AST) -> ast.FunctionDef | None:
    """找 tree 中第一個 FunctionDef（使用者的主函式）。"""
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            return node
    return None


def _find_outer_for(func: ast.FunctionDef) -> ast.For | None:
    """找函式 body 中第一層的第一個 For loop。"""
    for node in func.body:
        if isinstance(node, ast.For):
            return node
    return None


def _find_inner_for(outer: ast.For) -> ast.For | ast.While | None:
    """找 outer for body 中第一個 For 或 While loop。"""
    for node in ast.walk(outer):
        if node is outer:
            continue
        if isinstance(node, (ast.For, ast.While)):
            return node
    return None


def _find_compare_in_loop(loop: ast.For | ast.While) -> list[int] | None:
    """
    回傳 [loop行, if比較行]，讓 CodeEditor 同時高亮 for/while 行與 if 條件行。
    找不到 if 時只回傳 [loop行]。
    """
    for node in loop.body:
        if isinstance(node, ast.If):
            if (isinstance(node.test, ast.Compare)
                    or (isinstance(node.test, ast.UnaryOp)
                        and isinstance(node.test.operand, ast.Compare))):
                return [loop.lineno, node.lineno]
    return [loop.lineno]


def _find_tuple_swap(func: ast.FunctionDef) -> int | None:
    """找函式中 a, b = b, a 風格的 tuple swap，回傳行號。"""
    for node in ast.walk(func):
        if isinstance(node, ast.Assign):
            # 左側是 Tuple，右側也是 Tuple
            if (isinstance(node.targets[0], ast.Tuple)
                    and isinstance(node.value, ast.Tuple)):
                return node.lineno
    return None


def _find_subscript_swap(loop_body: list) -> int | None:
    """在 loop body 中找 data[i], data[j] = data[j], data[i] 風格的 swap。"""
    for node in loop_body:
        if isinstance(node, ast.Assign):
            if (isinstance(node.targets[0], ast.Tuple)
                    and isinstance(node.value, ast.Tuple)):
                return node.lineno
    return None


def _last_lineno(func: ast.FunctionDef) -> int:
    """函式最後一個節點的行號（用於 *_END tag）。"""
    all_nodes = list(ast.walk(func))
    return max((getattr(n, "lineno", 0) for n in all_nodes), default=func.lineno)


# ---------------------------------------------------------------------------
# Bubble Sort mapper
# ---------------------------------------------------------------------------

def _bubble_sort_mapper(tree: ast.AST) -> dict[str, int | list[int] | None]:
    func = _find_func(tree)
    if func is None:
        return {}

    outer = _find_outer_for(func)
    inner = _find_inner_for(outer) if outer else None

    compare_ln: int | None = None
    swap_ln: int | None = None

    if inner is not None:
        compare_ln = _find_compare_in_loop(inner)
        # swap 在 inner if body 內
        for node in inner.body:
            if isinstance(node, ast.If):
                swap_ln = _find_subscript_swap(node.body)
                break

    return {
        "SORT_START": func.lineno,
        "SORT_COMPARE": compare_ln,
        "SORT_SWAP": swap_ln,
        "SORT_END": _last_lineno(func),
    }


# ---------------------------------------------------------------------------
# Selection Sort mapper
# ---------------------------------------------------------------------------

def _selection_sort_mapper(tree: ast.AST) -> dict[str, int | list[int] | None]:
    func = _find_func(tree)
    if func is None:
        return {}

    outer = _find_outer_for(func)
    inner = _find_inner_for(outer) if outer else None

    compare_ln: int | None = None
    min_found_ln: int | None = None
    swap_ln: int | None = None

    if inner is not None:
        compare_ln = _find_compare_in_loop(inner)
        # min_idx = j 在 inner if body 內
        for node in inner.body:
            if isinstance(node, ast.If):
                for stmt in node.body:
                    if isinstance(stmt, ast.Assign):
                        min_found_ln = stmt.lineno
                        break
                break

    if outer is not None:
        # swap 在 outer for body 內（inner for 之後），找 tuple swap
        for node in outer.body:
            if isinstance(node, ast.Assign):
                if (isinstance(node.targets[0], ast.Tuple)
                        and isinstance(node.value, ast.Tuple)):
                    swap_ln = node.lineno
                    break
            # 也有人先 if min_idx != i: 再 swap
            if isinstance(node, ast.If):
                for stmt in ast.walk(node):
                    if isinstance(stmt, ast.Assign):
                        if (isinstance(stmt.targets[0], ast.Tuple)
                                and isinstance(stmt.value, ast.Tuple)):
                            swap_ln = stmt.lineno
                            break

        # MIN_FOUND：inner for 結束後的第一個有意義節點（min_idx 確定後）
        # 如果上面 inner if 裡找不到，fallback 找 outer body 的 `min_idx = i` 初始化那行
        if min_found_ln is None:
            for node in outer.body:
                if isinstance(node, ast.Assign):
                    # min_idx = i 或類似名稱的初始化
                    min_found_ln = node.lineno
                    break

    return {
        "SORT_START": func.lineno,
        "SORT_COMPARE": compare_ln,
        "SORT_MIN_FOUND": min_found_ln,
        "SORT_SWAP": swap_ln,
        "SORT_END": _last_lineno(func),
    }


# ---------------------------------------------------------------------------
# Insertion Sort mapper
# ---------------------------------------------------------------------------

def _insertion_sort_mapper(tree: ast.AST) -> dict[str, int | list[int] | None]:
    func = _find_func(tree)
    if func is None:
        return {}

    outer = _find_outer_for(func)
    inner = _find_inner_for(outer) if outer else None

    compare_ln: int | None = None
    insert_ln: int | None = None

    if inner is not None:
        # while loop 的 condition 本身是 Compare，用 inner.lineno
        if isinstance(inner, ast.While):
            compare_ln = inner.lineno
        else:
            compare_ln = _find_compare_in_loop(inner)

        # insert：inner while 結束後（outer body 裡 while 之後）的第一個 Assign
        if outer is not None:
            after_while = False
            for node in outer.body:
                if node is inner:
                    after_while = True
                    continue
                if after_while and isinstance(node, ast.Assign):
                    insert_ln = node.lineno
                    break

    return {
        "SORT_START": func.lineno,
        "SORT_COMPARE": compare_ln,
        "SORT_INSERT": insert_ln,
        "SORT_END": _last_lineno(func),
    }


# ---------------------------------------------------------------------------
# Linear Search mapper
# ---------------------------------------------------------------------------

def _linear_search_mapper(tree: ast.AST) -> dict[str, int | list[int] | None]:
    func = _find_func(tree)
    if func is None:
        return {}

    outer = _find_outer_for(func)
    compare_ln: int | None = None
    found_ln: int | None = None
    not_found_ln: int | None = None

    if outer is not None:
        # compare: if data[i] == target
        compare_ln = _find_compare_in_loop(outer)
        # found: 在 if body 內（return 或其他語意操作）
        for node in outer.body:
            if isinstance(node, ast.If) and isinstance(node.test, ast.Compare):
                if node.body:
                    found_ln = node.body[0].lineno
                break

        # not_found: for loop 之後的第一個語句
        after_for = False
        for node in func.body:
            if node is outer:
                after_for = True
                continue
            if after_for:
                not_found_ln = node.lineno
                break

    return {
        "SEARCH_START": func.lineno,
        "SEARCH_COMPARE": compare_ln,
        "SEARCH_FOUND": found_ln,
        "SEARCH_NOT_FOUND": not_found_ln,
        "SEARCH_END": _last_lineno(func),
    }


# ---------------------------------------------------------------------------
# Binary Search mapper
# ---------------------------------------------------------------------------

def _binary_search_mapper(tree: ast.AST) -> dict[str, int | list[int] | None]:
    func = _find_func(tree)
    if func is None:
        return {}

    # binary search 用 while loop
    while_node: ast.While | None = None
    for node in func.body:
        if isinstance(node, ast.While):
            while_node = node
            break

    narrow_ln: int | None = None
    compare_ln: int | None = None
    found_ln: int | None = None
    not_found_ln: int | None = None

    if while_node is not None:
        # narrow: mid = ... 那行
        for node in while_node.body:
            if isinstance(node, ast.Assign):
                narrow_ln = node.lineno
                break

        # compare: while行 + if data[mid] == target 行（同時高亮）
        for node in while_node.body:
            if isinstance(node, ast.If) and isinstance(node.test, ast.Compare):
                compare_ln = [while_node.lineno, node.lineno]
                if node.body:
                    found_ln = node.body[0].lineno
                break

        # not_found: while 結束後
        after_while = False
        for node in func.body:
            if node is while_node:
                after_while = True
                continue
            if after_while:
                not_found_ln = node.lineno
                break

    return {
        "SEARCH_START": func.lineno,
        "SEARCH_NARROW": narrow_ln,
        "SEARCH_COMPARE": compare_ln,
        "SEARCH_FOUND": found_ln,
        "SEARCH_NOT_FOUND": not_found_ln,
        "SEARCH_END": _last_lineno(func),
    }


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------

_MAPPERS: dict[str, Callable[[ast.AST], dict[str, int | None]]] = {
    "bubble_sort":    _bubble_sort_mapper,
    "selection_sort": _selection_sort_mapper,
    "insertion_sort": _insertion_sort_mapper,
    "linear_search":  _linear_search_mapper,
    "binary_search":  _binary_search_mapper,
}
