"""
Unit tests for TokenBucket rate limiter.
All tests are fast (no real I/O) — time.time() is mocked where needed.
"""
import time
import threading
from unittest.mock import patch

import pytest

from services.gemini_analysis.rate_limiter import (
    RPD_LIMIT,
    RPM_LIMIT,
    RPM_WAIT_TIMEOUT,
    TokenBucket,
)


def _fresh() -> TokenBucket:
    return TokenBucket()


class TestRpmLimit:
    def test_acquire_succeeds_within_limit(self):
        bucket = _fresh()
        for _ in range(RPM_LIMIT):
            assert bucket.acquire() is None

    def test_acquire_times_out_when_rpm_full(self):
        bucket = _fresh()
        base = 5_000_000.0

        # Fill the window using a frozen timestamp so all 14 slots are in-window
        with patch("services.gemini_analysis.rate_limiter.time") as mock_time:
            mock_time.time.return_value = base
            mock_time.monotonic.return_value = base
            for _ in range(RPM_LIMIT):
                bucket.acquire()

        # One more acquire: deadline is set at base (call #1), then remaining check
        # sees base + TIMEOUT + 1 (call #2) → remaining < 0 → immediate rpm_exhausted.
        # time.time stays at base so the minute window is still full (not evicted).
        with patch("services.gemini_analysis.rate_limiter.time") as mock_time:
            mock_time.time.return_value = base
            mock_time.monotonic.side_effect = [base, base + RPM_WAIT_TIMEOUT + 1]
            reason = bucket.acquire()

        assert reason == "rpm_exhausted"

    def test_acquire_succeeds_after_window_slides(self):
        bucket = _fresh()
        base = 1_000_000.0

        # Fill the RPM window at t=base
        with patch("services.gemini_analysis.rate_limiter.time") as mock_time:
            mock_time.time.return_value = base
            mock_time.monotonic.return_value = base
            for _ in range(RPM_LIMIT):
                bucket.acquire()

        # Advance time past the 60-second window
        with patch("services.gemini_analysis.rate_limiter.time") as mock_time:
            mock_time.time.return_value = base + 61
            mock_time.monotonic.return_value = base + 61
            assert bucket.acquire() is None


class TestRpdLimit:
    def test_rpd_exhausted_when_day_window_full(self):
        bucket = _fresh()
        base = 2_000_000.0

        # Fill the day window; spread requests across different RPM windows
        # to avoid hitting RPM limit (14 per minute)
        with patch("services.gemini_analysis.rate_limiter.time") as mock_time:
            for i in range(RPD_LIMIT):
                # Advance minute every RPM_LIMIT requests so RPM never blocks
                mock_time.time.return_value = base + (i // RPM_LIMIT) * 70
                mock_time.monotonic.return_value = base + (i // RPM_LIMIT) * 70
                result = bucket.acquire()
                assert result is None, f"Expected success on request {i}, got {result}"

        with patch("services.gemini_analysis.rate_limiter.time") as mock_time:
            mock_time.time.return_value = base + (RPD_LIMIT // RPM_LIMIT) * 70 + 1
            mock_time.monotonic.return_value = base + (RPD_LIMIT // RPM_LIMIT) * 70 + 1
            assert bucket.acquire() == "rpd_exhausted"

    def test_rpd_not_exhausted_before_limit(self):
        bucket = _fresh()
        base = 3_000_000.0

        with patch("services.gemini_analysis.rate_limiter.time") as mock_time:
            for i in range(RPD_LIMIT - 1):
                mock_time.time.return_value = base + (i // RPM_LIMIT) * 70
                mock_time.monotonic.return_value = base + (i // RPM_LIMIT) * 70
                assert bucket.acquire() is None


class TestWindowEviction:
    def test_minute_timestamps_evicted_after_60s(self):
        bucket = _fresh()
        base = 4_000_000.0

        with patch("services.gemini_analysis.rate_limiter.time") as mock_time:
            mock_time.time.return_value = base
            mock_time.monotonic.return_value = base
            for _ in range(RPM_LIMIT):
                bucket.acquire()

            # Still within window — should be full
            assert len(bucket._minute_window) == RPM_LIMIT

            # Advance past window
            mock_time.time.return_value = base + 61
            mock_time.monotonic.return_value = base + 61
            bucket.acquire()
            # Old timestamps evicted
            assert len(bucket._minute_window) == 1


class TestSingleton:
    def test_get_token_bucket_returns_same_instance(self):
        from services.gemini_analysis.rate_limiter import get_token_bucket
        assert get_token_bucket() is get_token_bucket()


class TestThreadSafety:
    def test_concurrent_acquires_do_not_exceed_rpm(self):
        bucket = _fresh()
        results: list[str | None] = []
        lock = threading.Lock()

        def worker():
            r = bucket.acquire()
            with lock:
                results.append(r)

        threads = [threading.Thread(target=worker) for _ in range(RPM_LIMIT + 5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=RPM_WAIT_TIMEOUT + 5)

        successes = [r for r in results if r is None]
        # Some requests must succeed, none can exceed the limit (within same window)
        assert len(successes) <= RPM_LIMIT
        assert len(successes) >= 1
