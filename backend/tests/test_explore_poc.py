"""
test_explore_poc.py — PoC 驗證：cfg_builder + tracer

測試目標：
- CfgGraph 結構正確（節點種類、邊的連接）
- TraceEvent[] 格式符合契約
- CallGraph 建構正確（root、nodes、edges.steps）
- MAX_TRACE_STEPS 截斷機制
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services"))

from cfg_builder import build_cfg, CfgGraph, CfgNode
from tracer import run_trace, MAX_TRACE_STEPS

BUBBLE_SORT = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

result = bubble_sort([3, 1, 2])
"""

RECURSIVE = """
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(4)
"""


# ---------------------------------------------------------------------------
# cfg_builder tests
# ---------------------------------------------------------------------------

class TestCfgBuilder:
    def test_returns_cfg_for_function(self):
        cfgs = build_cfg(BUBBLE_SORT)
        assert "bubble_sort" in cfgs
        assert isinstance(cfgs["bubble_sort"], CfgGraph)

    def test_has_entry_and_exit(self):
        cfg = build_cfg(BUBBLE_SORT)["bubble_sort"]
        kinds = [n.kind for n in cfg.nodes]
        assert "entry" in kinds
        assert "exit" in kinds

    def test_has_loop_nodes(self):
        cfg = build_cfg(BUBBLE_SORT)["bubble_sort"]
        kinds = [n.kind for n in cfg.nodes]
        assert kinds.count("loop") == 2  # 外層 for + 內層 for

    def test_has_branch_node(self):
        cfg = build_cfg(BUBBLE_SORT)["bubble_sort"]
        kinds = [n.kind for n in cfg.nodes]
        assert "branch" in kinds

    def test_has_return_node(self):
        cfg = build_cfg(BUBBLE_SORT)["bubble_sort"]
        kinds = [n.kind for n in cfg.nodes]
        assert "return" in kinds

    def test_exit_reachable(self):
        """exit node 必須有 edge 指向它"""
        cfg = build_cfg(BUBBLE_SORT)["bubble_sort"]
        exit_node = next(n for n in cfg.nodes if n.kind == "exit")
        targets = {e.target for e in cfg.edges}
        assert exit_node.id in targets

    def test_nodes_have_lines(self):
        cfg = build_cfg(BUBBLE_SORT)["bubble_sort"]
        non_exit = [n for n in cfg.nodes if n.kind not in ("exit",) and n.label]
        for node in non_exit:
            assert isinstance(node.lines, list)

    def test_if_else_code(self):
        code = """
def classify(x):
    if x > 0:
        return 1
    else:
        return -1
"""
        cfg = build_cfg(code)["classify"]
        kinds = [n.kind for n in cfg.nodes]
        assert "branch" in kinds
        assert kinds.count("return") == 2


# ---------------------------------------------------------------------------
# tracer tests
# ---------------------------------------------------------------------------

class TestTracer:
    def test_basic_trace_events(self):
        result = run_trace(BUBBLE_SORT)
        assert result.step_count > 0
        assert not result.is_truncated
        tags = {ev.tag for ev in result.trace}
        assert "LINE" in tags
        assert "CALL" in tags
        assert "RETURN" in tags

    def test_trace_event_format(self):
        result = run_trace(BUBBLE_SORT)
        for ev in result.trace:
            assert hasattr(ev, "tag")
            assert hasattr(ev, "variables")
            assert hasattr(ev, "dataSnapshot")
            assert hasattr(ev, "meta")
            assert "lineno" in ev.meta
            assert "func_name" in ev.meta

    def test_call_graph_root(self):
        result = run_trace(BUBBLE_SORT)
        assert result.call_graph.root == "func_bubble_sort"

    def test_call_graph_nodes(self):
        result = run_trace(BUBBLE_SORT)
        node_ids = [n.id for n in result.call_graph.nodes]
        assert "func_bubble_sort" in node_ids

    def test_call_graph_edge_steps(self):
        result = run_trace(BUBBLE_SORT)
        # 應有從 <module> 到 bubble_sort 的邊
        edges = result.call_graph.edges
        assert any(
            e.source == "func_<module>" and e.target == "func_bubble_sort"
            for e in edges
        )
        edge = next(
            e for e in edges
            if e.source == "func_<module>" and e.target == "func_bubble_sort"
        )
        assert len(edge.steps) >= 1

    def test_recursive_call_graph(self):
        result = run_trace(RECURSIVE)
        node_ids = [n.id for n in result.call_graph.nodes]
        assert "func_factorial" in node_ids

        # factorial 自身遞迴：應有 func_factorial → func_factorial 的邊
        self_edges = [
            e for e in result.call_graph.edges
            if e.source == "func_factorial" and e.target == "func_factorial"
        ]
        assert len(self_edges) == 1
        assert len(self_edges[0].steps) == 3  # factorial(4) 遞迴 3 次

    def test_truncation(self):
        # 製造超過 MAX_TRACE_STEPS 的迴圈
        code = f"""
def heavy():
    for i in range({MAX_TRACE_STEPS}):
        pass

heavy()
"""
        result = run_trace(code)
        assert result.is_truncated
        assert result.step_count == MAX_TRACE_STEPS
