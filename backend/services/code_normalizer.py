import io
import tokenize
import re


def normalize_code(code: str) -> str:
    """Remove comments/docstrings and collapse blank lines for stable hashing."""
    if not code or not code.strip():
        return ""

    try:
        cleaned = _strip_comments_and_docstrings(code)
    except tokenize.TokenError:
        # Fallback: regex-only strip if tokenizer fails (e.g. incomplete code)
        cleaned = _regex_strip_comments(code)

    # Collapse 2+ consecutive blank lines into 1
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def _strip_comments_and_docstrings(code: str) -> str:
    tokens = []
    prev_toktype = tokenize.ENCODING
    last_lineno = -1
    last_col = 0

    reader = io.StringIO(code).readline
    for tok in tokenize.generate_tokens(reader):
        toktype, tokval, (srow, scol), (erow, ecol), _ = tok

        if toktype == tokenize.COMMENT:
            continue

        if toktype == tokenize.STRING:
            # Docstring: STRING token at start of module, class, or function body
            if prev_toktype in (tokenize.INDENT, tokenize.NEWLINE, tokenize.NL,
                                tokenize.ENCODING, 62):  # 62 = ENCODING workaround
                # Check if it looks like a docstring (triple-quoted)
                if tokval.startswith(('"""', "'''")):
                    prev_toktype = toktype
                    continue

        if toktype not in (tokenize.NEWLINE, tokenize.NL, tokenize.INDENT,
                           tokenize.DEDENT, tokenize.ENCODING, tokenize.ENDMARKER):
            prev_toktype = toktype

        if srow > last_lineno:
            tokens.append("\n" * (srow - last_lineno))
            last_col = 0
        if scol > last_col:
            tokens.append(" " * (scol - last_col))
        tokens.append(tokval)
        last_lineno = erow
        last_col = ecol

    return "".join(tokens)


def _regex_strip_comments(code: str) -> str:
    # Only strip full-line and inline # comments (not inside strings — best-effort)
    lines = []
    for line in code.splitlines():
        stripped = re.sub(r"\s*#.*$", "", line)
        lines.append(stripped)
    return "\n".join(lines)
