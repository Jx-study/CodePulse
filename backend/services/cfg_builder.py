"""
cfg_builder.py — Python AST → CfgGraph

PoC Scope: Supports if/elif/else, for/while, function def, return, and basic statements.
Known Limitations: Complex syntax like try/except, with, yield, match/case to be added.

=============================================================================
Acknowledgments & License Notice
=============================================================================
This module's core AST traversal and control flow logic is inspired by and 
adapted from the following open-source projects:

1. py2cfg (Copyright 2020 ClassroomCode / Various Contributors)
   Source: https://gitlab.com/classroomcode/py2cfg
2. StatiCFG (Copyright 2018 Aurélien Coet, 2020 Andrei Nacu)
   Source: https://github.com/coetaur0/staticfg

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
=============================================================================

State of Changes (Modifications for CodePulse):
- Re-implemented the builder to output custom CfgGraph dataclasses for JSON serialization.
- Decoupled from Graphviz/DOT rendering to support Cytoscape.js web integration.
- Optimized block categorization (kind: branch, loop, etc.) for teaching visualization.
- Refined by Julian Tee(2026) for the CodePulse project.
"""

import ast
from dataclasses import dataclass, field


@dataclass
class CfgNode:
    id: str
    lines: list[int]
    label: str
    kind: str  # "entry" | "exit" | "branch" | "loop" | "basic" | "call" | "return"


@dataclass
class CfgEdge:
    source: str
    target: str
    label: str  # "" | "True" | "False" | "loop back" | "call" | "return"


@dataclass
class CfgGraph:
    nodes: list[CfgNode] = field(default_factory=list)
    edges: list[CfgEdge] = field(default_factory=list)


class CfgBuilder:
    def __init__(self):
        self._counter = 0

    def _new_id(self) -> str:
        self._counter += 1
        return f"block_{self._counter}"

    def _lines_of(self, node: ast.AST) -> list[int]:
        lines = set()
        for n in ast.walk(node):
            if hasattr(n, "lineno"):
                lines.add(n.lineno)
        return sorted(lines)

    def _label_of(self, stmts: list[ast.stmt], max_lines: int = 2) -> str:
        parts = []
        for stmt in stmts[:max_lines]:
            parts.append(ast.unparse(stmt))
        label = "\n".join(parts)
        if len(stmts) > max_lines:
            label += "\n..."
        return label

    def build(self, func_def: ast.FunctionDef) -> CfgGraph:
        cfg = CfgGraph()

        entry = CfgNode(
            id=self._new_id(),
            lines=[func_def.lineno],
            label=f"def {func_def.name}(...)",
            kind="entry",
        )
        cfg.nodes.append(entry)

        exit_node = CfgNode(
            id=self._new_id(),
            lines=[],
            label="exit",
            kind="exit",
        )
        # 先加入，最後補行號
        cfg.nodes.append(exit_node)

        exits = self._build_body(func_def.body, cfg, entry.id, exit_node)

        # 把所有懸空出口接到 exit
        for node_id, edge_label in exits:
            cfg.edges.append(CfgEdge(source=node_id, target=exit_node.id, label=edge_label))

        return cfg

    def _build_body(
        self,
        stmts: list[ast.stmt],
        cfg: CfgGraph,
        prev_id: str,
        exit_node: CfgNode,
    ) -> list[tuple[str, str]]:
        """
        處理一段 statement 列表，回傳「懸空出口」(node_id, edge_label) 列表。
        懸空出口由上層決定要接到哪裡（下一個 block 或函式 exit）。
        """
        current_prev = prev_id
        danglers: list[tuple[str, str]] = []
        basic_buf: list[ast.stmt] = []

        def flush_basic():
            nonlocal current_prev
            if not basic_buf:
                return
            node = CfgNode(
                id=self._new_id(),
                lines=sorted({ln for s in basic_buf for ln in self._lines_of(s)}),
                label=self._label_of(basic_buf),
                kind="basic",
            )
            cfg.nodes.append(node)
            cfg.edges.append(CfgEdge(source=current_prev, target=node.id, label=""))
            current_prev = node.id
            basic_buf.clear()

        for stmt in stmts:
            if isinstance(stmt, ast.Return):
                flush_basic()
                ret_node = CfgNode(
                    id=self._new_id(),
                    lines=self._lines_of(stmt),
                    label=ast.unparse(stmt),
                    kind="return",
                )
                cfg.nodes.append(ret_node)
                cfg.edges.append(CfgEdge(source=current_prev, target=ret_node.id, label=""))
                cfg.edges.append(CfgEdge(source=ret_node.id, target=exit_node.id, label="return"))
                current_prev = None  # 此分支結束
                break

            elif isinstance(stmt, (ast.If,)):
                flush_basic()
                branch_node = CfgNode(
                    id=self._new_id(),
                    lines=self._lines_of(stmt.test),
                    label=f"if {ast.unparse(stmt.test)}",
                    kind="branch",
                )
                cfg.nodes.append(branch_node)
                cfg.edges.append(CfgEdge(source=current_prev, target=branch_node.id, label=""))

                # True branch
                true_exits = self._build_body(stmt.body, cfg, branch_node.id, exit_node)
                # False / elif / else branch
                if stmt.orelse:
                    false_exits = self._build_body(stmt.orelse, cfg, branch_node.id, exit_node)
                    # 若 orelse 是另一個 if，build_body 已處理；直接合併出口
                    merge_exits = true_exits + false_exits
                else:
                    # 沒有 else：True 出口懸空，False 出口指向 branch 本身（繼續往下）
                    merge_exits = true_exits + [(branch_node.id, "False")]

                if not merge_exits:
                    current_prev = None
                    break

                # 建 merge block 匯合所有出口
                merge_node = CfgNode(
                    id=self._new_id(),
                    lines=[],
                    label="",
                    kind="basic",
                )
                cfg.nodes.append(merge_node)
                for mid, mlabel in merge_exits:
                    cfg.edges.append(CfgEdge(source=mid, target=merge_node.id, label=mlabel))
                current_prev = merge_node.id

            elif isinstance(stmt, (ast.For, ast.While)):
                flush_basic()
                if isinstance(stmt, ast.For):
                    loop_label = f"for {ast.unparse(stmt.target)} in {ast.unparse(stmt.iter)}"
                else:
                    loop_label = f"while {ast.unparse(stmt.test)}"

                loop_node = CfgNode(
                    id=self._new_id(),
                    lines=self._lines_of(stmt) [:1],
                    label=loop_label,
                    kind="loop",
                )
                cfg.nodes.append(loop_node)
                cfg.edges.append(CfgEdge(source=current_prev, target=loop_node.id, label=""))

                body_exits = self._build_body(stmt.body, cfg, loop_node.id, exit_node)
                # loop body 出口 → loop back
                for bid, _ in body_exits:
                    cfg.edges.append(CfgEdge(source=bid, target=loop_node.id, label="loop back"))

                current_prev = loop_node.id  # 迴圈結束出口（False 方向）

            elif isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Call):
                flush_basic()
                call_node = CfgNode(
                    id=self._new_id(),
                    lines=self._lines_of(stmt),
                    label=ast.unparse(stmt),
                    kind="call",
                )
                cfg.nodes.append(call_node)
                cfg.edges.append(CfgEdge(source=current_prev, target=call_node.id, label=""))
                current_prev = call_node.id

            else:
                basic_buf.append(stmt)

        flush_basic()

        if current_prev is not None:
            danglers.append((current_prev, ""))

        return danglers


def build_cfg(source: str) -> dict[str, CfgGraph]:
    """
    解析 source，對每個 top-level FunctionDef 建構 CfgGraph。
    回傳 { func_name: CfgGraph }。
    """
    tree = ast.parse(source)
    builder = CfgBuilder()
    result: dict[str, CfgGraph] = {}

    for node in ast.iter_child_nodes(tree):
        if isinstance(node, ast.FunctionDef):
            result[node.name] = builder.build(node)

    return result

