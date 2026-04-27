import time
from collections import deque
from threading import Condition, Lock

RPM_LIMIT = 14        # block when 60-second window reaches this (Google cap is 15, -1 buffer)
RPD_LIMIT = 460       # hard-stop when 24-hour window reaches this (Google cap is 500, -40 buffer)
RPM_WINDOW = 60       # seconds
RPD_WINDOW = 86400    # seconds
RPM_WAIT_TIMEOUT = 30 # seconds


class TokenBucket:
    def __init__(self) -> None:
        self._minute_window: deque[float] = deque()
        self._day_window: deque[float] = deque()
        self._cond = Condition(Lock())

    def _evict_expired(self, now: float) -> None:
        minute_cutoff = now - RPM_WINDOW
        while self._minute_window and self._minute_window[0] <= minute_cutoff:
            self._minute_window.popleft()
        day_cutoff = now - RPD_WINDOW
        while self._day_window and self._day_window[0] <= day_cutoff:
            self._day_window.popleft()

    def _can_acquire(self, now: float) -> bool:
        self._evict_expired(now)
        return len(self._minute_window) < RPM_LIMIT

    def acquire(self) -> str | None:
        """
        Attempt to acquire a quota slot.

        Returns None on success, or a fallback_reason string on failure:
          "rpd_exhausted" — daily quota hit
          "rpm_exhausted" — per-minute quota full and wait timed out
        """
        deadline = time.monotonic() + RPM_WAIT_TIMEOUT

        with self._cond:
            now = time.time()
            self._evict_expired(now)

            if len(self._day_window) >= RPD_LIMIT:
                return "rpd_exhausted"

            while not self._can_acquire(time.time()):
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    return "rpm_exhausted"
                self._cond.wait(timeout=min(remaining, 1.0))

            now = time.time()
            self._evict_expired(now)

            if len(self._day_window) >= RPD_LIMIT:
                return "rpd_exhausted"

            self._minute_window.append(now)
            self._day_window.append(now)
            self._cond.notify_all()
            return None


_bucket: TokenBucket | None = None
_bucket_lock = Lock()


def get_token_bucket() -> TokenBucket:
    global _bucket
    if _bucket is None:
        with _bucket_lock:
            if _bucket is None:
                _bucket = TokenBucket()
    return _bucket
