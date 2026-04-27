"""
Unit tests for the analyze() facade in services/gemini_analysis/__init__.py.
Uses mocks for rate_limiter and client — no real API calls.
"""
from unittest.mock import MagicMock, patch

import pytest

from services.gemini_analysis import analyze
from services.gemini_analysis.result import GeminiAnalysisResult, GeminiSummary

_BUBBLE_SORT_CODE = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
"""

_VALID_RAW = {
    "detected_algorithm": "bubble_sort",
    "time_complexity": "O(n²)",
    "summary": {"purpose": "這是氣泡排序。", "feedback": "寫得不錯！"},
}


class TestSuccessPath:
    def test_returns_structured_result(self):
        with (
            patch("services.gemini_analysis.get_token_bucket") as mock_bucket_fn,
            patch("services.gemini_analysis.call_gemini") as mock_call,
        ):
            mock_bucket_fn.return_value.acquire.return_value = None
            mock_call.return_value = _VALID_RAW

            result = analyze(_BUBBLE_SORT_CODE)

        assert isinstance(result, GeminiAnalysisResult)
        assert result.is_fallback is False
        assert result.fallback_reason is None
        assert result.detected_algorithm == "bubble_sort"
        assert result.time_complexity == "O(n²)"
        assert isinstance(result.summary, GeminiSummary)
        assert result.summary.purpose == "這是氣泡排序。"
        assert result.summary.feedback == "寫得不錯！"

    def test_unknown_algorithm_normalised_to_none(self):
        raw = dict(_VALID_RAW, detected_algorithm="unknown")
        with (
            patch("services.gemini_analysis.get_token_bucket") as mock_bucket_fn,
            patch("services.gemini_analysis.call_gemini") as mock_call,
        ):
            mock_bucket_fn.return_value.acquire.return_value = None
            mock_call.return_value = raw

            result = analyze(_BUBBLE_SORT_CODE)

        assert result.detected_algorithm is None
        assert result.is_fallback is False

    def test_unknown_complexity_normalised_to_none(self):
        raw = dict(_VALID_RAW, time_complexity="unknown")
        with (
            patch("services.gemini_analysis.get_token_bucket") as mock_bucket_fn,
            patch("services.gemini_analysis.call_gemini") as mock_call,
        ):
            mock_bucket_fn.return_value.acquire.return_value = None
            mock_call.return_value = raw

            result = analyze(_BUBBLE_SORT_CODE)

        assert result.time_complexity is None
        assert result.is_fallback is False

    def test_empty_string_normalised_to_none(self):
        raw = dict(_VALID_RAW, detected_algorithm="  ")
        with (
            patch("services.gemini_analysis.get_token_bucket") as mock_bucket_fn,
            patch("services.gemini_analysis.call_gemini") as mock_call,
        ):
            mock_bucket_fn.return_value.acquire.return_value = None
            mock_call.return_value = raw

            result = analyze(_BUBBLE_SORT_CODE)

        assert result.detected_algorithm is None


class TestRateLimitFallback:
    @pytest.mark.parametrize("reason", ["rpm_exhausted", "rpd_exhausted"])
    def test_rate_limit_returns_fallback(self, reason):
        with patch("services.gemini_analysis.get_token_bucket") as mock_bucket_fn:
            mock_bucket_fn.return_value.acquire.return_value = reason

            result = analyze(_BUBBLE_SORT_CODE)

        assert result.is_fallback is True
        assert result.fallback_reason == reason
        assert result.detected_algorithm is None
        assert result.time_complexity is None
        assert result.summary is None


class TestApiErrorFallback:
    @pytest.mark.parametrize("error_reason", ["api_error", "parse_error"])
    def test_api_error_returns_fallback(self, error_reason):
        with (
            patch("services.gemini_analysis.get_token_bucket") as mock_bucket_fn,
            patch("services.gemini_analysis.call_gemini") as mock_call,
        ):
            mock_bucket_fn.return_value.acquire.return_value = None
            mock_call.return_value = error_reason

            result = analyze(_BUBBLE_SORT_CODE)

        assert result.is_fallback is True
        assert result.fallback_reason == error_reason
        assert result.summary is None
