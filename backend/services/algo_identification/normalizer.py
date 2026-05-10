import ast


def normalize_identifiers(source: str) -> str:
    """Replace user-defined function/variable names with generic placeholders.

    Makes embeddings robust to renaming: `def my_sort(data)` and
    `def bubble_sort(arr)` produce similar vectors when structurally identical.
    Falls back to the original source if parsing fails (e.g. syntax errors).
    """
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return source

    seen: dict[str, str] = {}
    counters: dict[str, int] = {"func": 0, "var": 0}

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if node.name not in seen:
                seen[node.name] = f"func_{counters['func']}"
                counters["func"] += 1
            for arg in node.args.args:
                if arg.arg not in seen:
                    seen[arg.arg] = f"var_{counters['var']}"
                    counters["var"] += 1
        elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            if node.id not in seen:
                seen[node.id] = f"var_{counters['var']}"
                counters["var"] += 1

    class _Renamer(ast.NodeTransformer):
        def visit_FunctionDef(self, node):
            node.name = seen.get(node.name, node.name)
            self.generic_visit(node)
            return node

        visit_AsyncFunctionDef = visit_FunctionDef

        def visit_arg(self, node):
            node.arg = seen.get(node.arg, node.arg)
            return node

        def visit_Name(self, node):
            node.id = seen.get(node.id, node.id)
            return node

    renamed = _Renamer().visit(tree)
    ast.fix_missing_locations(renamed)
    return ast.unparse(renamed)
