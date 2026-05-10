from dataclasses import dataclass


@dataclass(frozen=True)
class GeminiSummary:
    purpose: str
    feedback: str


@dataclass(frozen=True)
class GeminiAnalysisResult:
    detected_algorithm: str | None
    time_complexity: str | None
    summary: GeminiSummary | None
    is_fallback: bool
    fallback_reason: str | None  # "rpm_exhausted" | "rpd_exhausted" | "api_error" | "parse_error" | None
