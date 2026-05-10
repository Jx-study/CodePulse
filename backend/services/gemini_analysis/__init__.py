from .client import call_gemini
from .prompt import RESPONSE_SCHEMA, build_prompt
from .rate_limiter import get_token_bucket
from .result import GeminiAnalysisResult, GeminiSummary
from services.complexity_labels import normalize_complexity


def analyze(code: str) -> GeminiAnalysisResult:
    """
    Analyze user code with Gemini and return a structured result.
    Never raises; returns is_fallback=True on rate-limit or API failure.
    """
    bucket = get_token_bucket()
    rl_error = bucket.acquire()
    if rl_error is not None:
        return _fallback(rl_error)

    raw = call_gemini(build_prompt(code), RESPONSE_SCHEMA)
    if isinstance(raw, str):
        return _fallback(raw)

    return _build_result(raw)


def _fallback(reason: str) -> GeminiAnalysisResult:
    return GeminiAnalysisResult(
        detected_algorithm=None,
        time_complexity=None,
        summary=None,
        is_fallback=True,
        fallback_reason=reason,
    )


def _build_result(raw: dict) -> GeminiAnalysisResult:
    summary_raw = raw.get("summary", {})
    return GeminiAnalysisResult(
        detected_algorithm=_normalize(raw.get("detected_algorithm")),
        time_complexity=_normalize(raw.get("time_complexity")),
        summary=GeminiSummary(
            purpose=summary_raw.get("purpose", ""),
            feedback=summary_raw.get("feedback", ""),
        ),
        is_fallback=False,
        fallback_reason=None,
    )


def _normalize(val: str | None) -> str | None:
    return normalize_complexity(val)
