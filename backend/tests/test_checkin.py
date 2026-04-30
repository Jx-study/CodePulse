"""Tests for POST /api/users/me/checkin"""
import pytest
from datetime import date, datetime, timedelta, timezone
from unittest.mock import patch, MagicMock
from models.user import User, UserRole, UserLoginStreak
from models.xp import XpEvent, XpSourceType
from database import db

# 固定一個 UTC 日期，避免測試結果因機器時區而異
_FIXED_UTC_DATE = date(2026, 4, 24)
_FIXED_UTC_DT = datetime(_FIXED_UTC_DATE.year, _FIXED_UTC_DATE.month, _FIXED_UTC_DATE.day, 12, 0, 0, tzinfo=timezone.utc)


def _patch_today():
    """Mock routes.users.datetime，讓 today 固定為 _FIXED_UTC_DATE（UTC）。"""
    mock_dt = MagicMock(wraps=datetime)
    mock_dt.now.return_value = _FIXED_UTC_DT
    return patch('routes.users.datetime', mock_dt)


def _make_authed_user(client, app):
    """Helper: create user and return cookie jar."""
    from auth_utils import create_access_token
    with app.app_context():
        user = User(
            user_id=42,
            username='checkinuser',
            display_name='Checkin User',
            email='checkin@example.com',
            role=UserRole.user,
            timezone='UTC',
        )
        db.session.add(user)
        db.session.commit()
        token = create_access_token(user.user_id)
        uid = user.user_id
    client.set_cookie('access_token', token)
    return uid


def test_first_checkin_creates_streak(client, app):
    uid = _make_authed_user(client, app)
    with _patch_today():
        resp = client.post('/api/users/me/checkin')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    assert data['already_checked_in'] is False
    assert data['xp_earned'] == 5
    assert data['current_streak'] == 1
    with app.app_context():
        streak = UserLoginStreak.query.filter_by(user_id=uid).first()
        assert streak is not None
        assert streak.login_date.isoformat() == _FIXED_UTC_DATE.isoformat()


def test_second_checkin_same_day_is_idempotent(client, app):
    uid = _make_authed_user(client, app)
    with _patch_today():
        client.post('/api/users/me/checkin')
        resp = client.post('/api/users/me/checkin')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['already_checked_in'] is True
    assert data['xp_earned'] == 0
    with app.app_context():
        count = UserLoginStreak.query.filter_by(user_id=uid).count()
        assert count == 1
        xp_count = XpEvent.query.filter_by(
            user_id=uid, source_type=XpSourceType.login_streak
        ).count()
        assert xp_count == 1


def test_consecutive_day_increments_streak(client, app):
    uid = _make_authed_user(client, app)
    yesterday = _FIXED_UTC_DATE - timedelta(days=1)
    with app.app_context():
        db.session.add(UserLoginStreak(user_id=uid, login_date=yesterday))
        user = db.session.get(User, uid)
        user.current_streak = 3
        db.session.commit()
    with _patch_today():
        resp = client.post('/api/users/me/checkin')
    data = resp.get_json()
    assert data['current_streak'] == 4


def test_gap_resets_streak(client, app):
    uid = _make_authed_user(client, app)
    two_days_ago = _FIXED_UTC_DATE - timedelta(days=2)
    with app.app_context():
        db.session.add(UserLoginStreak(user_id=uid, login_date=two_days_ago))
        user = db.session.get(User, uid)
        user.current_streak = 5
        db.session.commit()
    with _patch_today():
        resp = client.post('/api/users/me/checkin')
    data = resp.get_json()
    assert data['current_streak'] == 1


def test_checkin_requires_auth(client, app):
    resp = client.post('/api/users/me/checkin')
    assert resp.status_code == 401


def test_checkin_history_returns_dates(client, app):
    uid = _make_authed_user(client, app)
    with app.app_context():
        db.session.add(UserLoginStreak(user_id=uid, login_date=date(2026, 3, 1)))
        db.session.add(UserLoginStreak(user_id=uid, login_date=date(2026, 3, 5)))
        db.session.commit()
    resp = client.get('/api/users/me/checkin-history?year=2026&month=3')
    assert resp.status_code == 200
    data = resp.get_json()
    assert '2026-03-01' in data['dates']
    assert '2026-03-05' in data['dates']
    assert data['dates'] == sorted(data['dates'])


def test_checkin_history_missing_params(client, app):
    _make_authed_user(client, app)
    resp = client.get('/api/users/me/checkin-history?year=2026')
    assert resp.status_code == 400
    assert resp.get_json()['error_code'] == 'INVALID_PARAMS'


def test_checkin_history_invalid_month(client, app):
    _make_authed_user(client, app)
    resp = client.get('/api/users/me/checkin-history?year=2026&month=13')
    assert resp.status_code == 400
    assert resp.get_json()['error_code'] == 'INVALID_PARAMS'


def test_checkin_history_requires_auth(client, app):
    resp = client.get('/api/users/me/checkin-history?year=2026&month=3')
    assert resp.status_code == 401
