"""
tracer.py — sys.settrace PoC

驗證目標：
1. TraceEvent[] 格式（tag: "LINE" | "CALL" | "RETURN"，含 variables、meta.lineno）
2. call/return events 建構 CallGraph
3. MAX_TRACE_STEPS 硬限制
4. 執行緒安全（閉包封裝，不用 module-level globals）
"""
from __future__ import annotations

import sys
from dataclasses import dataclass, field
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from services.cfg_builder import CfgGraph


MAX_TRACE_STEPS = 2000

RESTRICTED_BUILTINS = {
    "range", "len", "print", "int", "float", "str", "bool",
    "list", "dict", "set", "tuple", "enumerate", "zip",
    "min", "max", "sum", "abs", "sorted", "reversed",
}


# ---------------------------------------------------------------------------
# 資料結構（對應前端 trace.ts）
# ---------------------------------------------------------------------------

# dunder key 過濾集合（module-level constant）
_GLOBAL_FILTER = frozenset({
    "__builtins__", "__name__", "__doc__",
    "__package__", "__spec__", "__loader__",
    "__build_class__", "__debug__", "__import__",
})


def _is_internal_symbol(func_name: str) -> bool:
    """過濾內部 symbol：以 _ 開頭或包含 < 的 frame name（<module> 除外）。"""
    return func_name.startswith("_") or ("<" in func_name and func_name != "<module>")


@dataclass
class TraceEvent:
    tag: str           # "LINE" | "CALL" | "RETURN"
    local_vars: dict
    global_vars: dict
    dataSnapshot: list
    meta: dict         # { lineno, func_name }


@dataclass
class CallNode:
    id: str            # "func_<name>"
    func_name: str
    cfg: CfgGraph | None = None   # PoC 階段由外部注入；正式版由 cfg_builder 提供


@dataclass
class CallEdge:
    source: str        # caller CallNode.id
    target: str        # callee CallNode.id
    steps: list[int] = field(default_factory=list)
    return_steps: list[int] = field(default_factory=list)  # RETURN event step indices


@dataclass
class CallGraph:
    nodes: list[CallNode] = field(default_factory=list)
    edges: list[CallEdge] = field(default_factory=list)
    root: str = ""


@dataclass
class TraceResult:
    trace: list[TraceEvent]
    call_graph: CallGraph
    is_truncated: bool
    step_count: int
    stdout_events: list[dict] = field(default_factory=list)


# ---------------------------------------------------------------------------
# 核心 tracer
# ---------------------------------------------------------------------------

def run_trace(user_code: str) -> TraceResult:
    """
    執行 user_code，收集 TraceEvent[] 並建構 CallGraph。
    執行緒安全：所有狀態以閉包封裝。
    """
    trace_log: list[TraceEvent] = []
    is_truncated = False
    stdout_events: list[dict] = []

    call_graph = CallGraph()
    call_stack: list[str] = []   # func_name stack

    def _get_or_create_node(func_name: str) -> CallNode:
        node_id = f"func_{func_name}"
        for n in call_graph.nodes:
            if n.id == node_id:
                return n
        node = CallNode(id=node_id, func_name=func_name)
        call_graph.nodes.append(node)
        return node

    def _get_or_create_edge(caller_id: str, callee_id: str) -> CallEdge:
        for e in call_graph.edges:
            if e.source == caller_id and e.target == callee_id:
                return e
        edge = CallEdge(source=caller_id, target=callee_id)
        call_graph.edges.append(edge)
        return edge

    def tracer(frame, event, arg):
        nonlocal is_truncated

        if len(trace_log) >= MAX_TRACE_STEPS:
            is_truncated = True
            # return None 停止此 frame 的 local tracing；
            # sys.settrace(None) 在 local tracer 內是 no-op，全域清除由 finally 塊負責。
            return None

        func_name = frame.f_code.co_name
        lineno = frame.f_lineno

        # 過濾內部 symbol（call 和 return 都需要過濾）
        if event in ("call", "return") and _is_internal_symbol(func_name):
            return None

        # local_vars：當前 frame 的局部變數
        # 對 <module> frame，f_locals 就是 sandboxed_globals，用過濾集排除內建 key
        local_vars = {
            k: repr(v)
            for k, v in frame.f_locals.items()
            if k not in _GLOBAL_FILTER
        }

        # global_vars：sandboxed_globals 中用戶定義的 key（排除內建 key 與函式物件）
        global_vars = {
            k: repr(v)
            for k, v in frame.f_globals.items()
            if k not in _GLOBAL_FILTER and not callable(v)
        }

        if event == "call":
            node = _get_or_create_node(func_name)

            if func_name == "<module>" and not call_graph.root:
                call_graph.root = node.id  # root 永遠是 <module>

            if call_stack:
                caller_id = f"func_{call_stack[-1]}"
                edge = _get_or_create_edge(caller_id, node.id)
                edge.steps.append(len(trace_log))

            call_stack.append(func_name)

            trace_log.append(TraceEvent(
                tag="CALL",
                local_vars=local_vars,
                global_vars=global_vars,
                dataSnapshot=[],
                meta={"lineno": lineno, "func_name": func_name},
            ))

        elif event == "return":
            # Record return step to corresponding call edge
            if (len(call_stack) >= 2
                    and call_stack[-1] == func_name):  # Defensive: ensure stack top matches current frame
                callee_id = f"func_{func_name}"
                caller_id = f"func_{call_stack[-2]}"
                edge = _get_or_create_edge(caller_id, callee_id)
                edge.return_steps.append(len(trace_log))  # len() before append = correct index

            trace_log.append(TraceEvent(
                tag="RETURN",
                local_vars=local_vars,
                global_vars=global_vars,
                dataSnapshot=[],
                meta={"lineno": lineno, "func_name": func_name, "return_value": repr(arg)},
            ))
            if call_stack and call_stack[-1] == func_name:
                call_stack.pop()

        elif event == "line":
            trace_log.append(TraceEvent(
                tag="LINE",
                local_vars=local_vars,
                global_vars=global_vars,
                dataSnapshot=[],
                meta={"lineno": lineno, "func_name": func_name},
            ))

        return tracer

    def _traced_print(*args, sep=" ", end="\n", **_kwargs):
        text = sep.join(str(a) for a in args)
        stdout_events.append({"step": len(trace_log), "text": text})

    import builtins as _builtins_module
    sandboxed_globals = {
        "__builtins__": {
            **{
                k: getattr(_builtins_module, k)
                for k in RESTRICTED_BUILTINS
                if hasattr(_builtins_module, k)
            },
            "print": _traced_print,
        },
        "__name__": "__explore__",
    }

    sys.settrace(tracer)
    try:
        exec(user_code, sandboxed_globals)  # noqa: S102
    finally:
        sys.settrace(None)

    return TraceResult(
        trace=trace_log,
        call_graph=call_graph,
        is_truncated=is_truncated,
        step_count=len(trace_log),
        stdout_events=stdout_events,
    )


