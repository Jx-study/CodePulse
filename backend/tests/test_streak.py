"""Tests for _update_streak timezone logic."""
from datetime import date, datetime
from unittest.mock import MagicMock, patch

from routes.auth import _update_streak


def _make_user(tz='UTC', last_login=None, streak=0, longest=0):
    user = MagicMock()
    user.timezone = tz
    user.last_login_date = last_login
    user.current_streak = streak
    user.longest_streak = longest
    return user


def _fake_now(iso_str):
    """Return a real aware datetime for patching datetime.now()."""
    return datetime.fromisoformat(iso_str)


# ── idempotent: same local date ───────────────────────────────────────────────

def test_same_local_day_utc8_is_idempotent():
    """
    UTC 2026-03-12 20:00 → Asia/Taipei local = 2026-03-13 04:00.
    last_login_date already = 2026-03-13 → streak must NOT change.
    """
    user = _make_user(tz='Asia/Taipei', last_login=date(2026, 3, 13), streak=3)
    with patch('routes.auth.datetime') as mock_dt, \
         patch('routes.auth.db') as mock_db:
        mock_dt.now.return_value = _fake_now('2026-03-12 20:00:00+00:00')
        mock_db.session.execute.return_value = None
        _update_streak(user)
    assert user.current_streak == 3


def test_same_local_day_utc_is_idempotent():
    """UTC user, same day re-login. last_login_date = today → streak must NOT change."""
    user = _make_user(tz='UTC', last_login=date(2026, 3, 12), streak=5)
    with patch('routes.auth.datetime') as mock_dt, \
         patch('routes.auth.db') as mock_db:
        mock_dt.now.return_value = _fake_now('2026-03-12 10:00:00+00:00')
        mock_db.session.execute.return_value = None
        _update_streak(user)
    assert user.current_streak == 5


# ── streak continues ──────────────────────────────────────────────────────────

def test_new_local_day_utc8_continues_streak():
    """
    UTC 2026-03-12 20:00 → Asia/Taipei local = 2026-03-13.
    last_login_date = 2026-03-12 → consecutive day → streak increments.
    """
    user = _make_user(tz='Asia/Taipei', last_login=date(2026, 3, 12), streak=5)
    with patch('routes.auth.datetime') as mock_dt, \
         patch('routes.auth.db') as mock_db:
        mock_dt.now.return_value = _fake_now('2026-03-12 20:00:00+00:00')
        mock_db.session.execute.return_value = None
        _update_streak(user)
    assert user.current_streak == 6
    assert user.last_login_date == date(2026, 3, 13)


# ── streak resets ─────────────────────────────────────────────────────────────

def test_streak_resets_on_gap():
    """last_login_date is 2 days ago → streak resets to 1."""
    user = _make_user(tz='UTC', last_login=date(2026, 3, 10), streak=7)
    with patch('routes.auth.datetime') as mock_dt, \
         patch('routes.auth.db') as mock_db:
        mock_dt.now.return_value = _fake_now('2026-03-12 10:00:00+00:00')
        mock_db.session.execute.return_value = None
        _update_streak(user)
    assert user.current_streak == 1


# ── first ever login ──────────────────────────────────────────────────────────

def test_first_login_sets_streak_to_one():
    """last_login_date = None → first ever login → streak = 1."""
    user = _make_user(tz='UTC', last_login=None, streak=0)
    with patch('routes.auth.datetime') as mock_dt, \
         patch('routes.auth.db') as mock_db:
        mock_dt.now.return_value = _fake_now('2026-03-12 10:00:00+00:00')
        mock_db.session.execute.return_value = None
        _update_streak(user)
    assert user.current_streak == 1
    assert user.last_login_date == date(2026, 3, 12)


# ── longest_streak ────────────────────────────────────────────────────────────

def test_longest_streak_updated():
    """longest_streak updates when current_streak exceeds it."""
    user = _make_user(tz='UTC', last_login=date(2026, 3, 11), streak=10, longest=10)
    with patch('routes.auth.datetime') as mock_dt, \
         patch('routes.auth.db') as mock_db:
        mock_dt.now.return_value = _fake_now('2026-03-12 10:00:00+00:00')
        mock_db.session.execute.return_value = None
        _update_streak(user)
    assert user.current_streak == 11
    assert user.longest_streak == 11


# ── invalid timezone fallback ─────────────────────────────────────────────────

def test_invalid_timezone_falls_back_to_utc():
    """Invalid IANA string → silently fall back to UTC, must not crash."""
    user = _make_user(tz='Not/AReal_Zone', last_login=date(2026, 3, 11), streak=3)
    with patch('routes.auth.datetime') as mock_dt, \
         patch('routes.auth.db') as mock_db:
        mock_dt.now.return_value = _fake_now('2026-03-12 10:00:00+00:00')
        mock_db.session.execute.return_value = None
        _update_streak(user)
    # Falls back to UTC → 2026-03-12, consecutive day → streak = 4
    assert user.current_streak == 4
