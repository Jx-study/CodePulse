"""Tests for POST /api/users/me/checkin"""
import pytest
from datetime import date, timedelta
from unittest.mock import patch
from models.user import User, UserRole, UserLoginStreak
from models.xp import XpEvent, XpSourceType
from database import db


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
    today = date.today().isoformat()
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
        assert streak.login_date.isoformat() == today


def test_second_checkin_same_day_is_idempotent(client, app):
    uid = _make_authed_user(client, app)
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
    yesterday = date.today() - timedelta(days=1)
    with app.app_context():
        db.session.add(UserLoginStreak(user_id=uid, login_date=yesterday))
        user = db.session.get(User, uid)
        user.current_streak = 3
        db.session.commit()
    resp = client.post('/api/users/me/checkin')
    data = resp.get_json()
    assert data['current_streak'] == 4


def test_gap_resets_streak(client, app):
    uid = _make_authed_user(client, app)
    two_days_ago = date.today() - timedelta(days=2)
    with app.app_context():
        db.session.add(UserLoginStreak(user_id=uid, login_date=two_days_ago))
        user = db.session.get(User, uid)
        user.current_streak = 5
        db.session.commit()
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
