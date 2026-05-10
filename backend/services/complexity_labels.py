"""
complexity_labels.py — canonical Big-O label normalization

All complexity strings produced by AST analysis, big-O curve fitting,
and Gemini should pass through normalize_complexity() so comparisons work.
"""
from __future__ import annotations

_ALIASES: dict[str, str] = {
    "o(1)":        "O(1)",
    "o(log n)":    "O(log n)",
    "o(logn)":     "O(log n)",
    "o(log(n))":   "O(log n)",
    "o(n)":        "O(n)",
    "o(n log n)":  "O(n log n)",
    "o(nlogn)":    "O(n log n)",
    "o(n log(n))": "O(n log n)",
    "o(n*log n)":  "O(n log n)",
    "o(n*logn)":   "O(n log n)",
    "o(n^2)":      "O(n²)",
    "o(n**2)":     "O(n²)",
    "o(n2)":       "O(n²)",
    "o(n²)":       "O(n²)",
    "o(n^3)":      "O(n³)",
    "o(n**3)":     "O(n³)",
    "o(n3)":       "O(n³)",
    "o(n³)":       "O(n³)",
    "o(2^n)":      "O(2ⁿ)",
    "o(2**n)":     "O(2ⁿ)",
    "o(2ⁿ)":       "O(2ⁿ)",
}

CANONICAL_LABELS: tuple[str, ...] = (
    "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)",
)


def normalize_complexity(val: str | None) -> str | None:
    """
    Map any known complexity string variant to the canonical form.
    Returns None for unknown/empty. Returns val unchanged if not in alias table.
    """
    if val is None or val.strip().lower() in ("unknown", ""):
        return None
    return _ALIASES.get(val.strip().lower(), val.strip())
