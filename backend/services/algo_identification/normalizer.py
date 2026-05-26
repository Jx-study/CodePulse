import ast


def normalize_identifiers(source: str) -> str:
    """Replace user-defined function/variable names with generic placeholders.

    Only normalizes function names and their parameters; preserves local variable
    names because they carry semantic fingerprints (e.g. `pivot`, `mid`, `key`)
    that improve known/unknown distribution separability. See
    Note/technical/normalizer-ablation-study.md for the ablation that motivated
    this choice. Falls back to the original source if parsing fails.
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
