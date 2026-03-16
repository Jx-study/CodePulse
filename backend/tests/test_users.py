"""Tests for /api/users endpoints."""
import pytest

from database import db as _db


def _authed(client, auth_headers, method, path, **kwargs):
    """Make an authenticated request using the access_token cookie."""
    token = auth_headers['access_token']
    client.set_cookie('access_token', token)
    fn = getattr(client, method)
    resp = fn(path, **kwargs)
    client.delete_cookie('access_token')
    return resp


@pytest.fixture
def auth_headers_with_local_identity(app):
    """Create a test user with a local identity and return auth cookie headers."""
    from models.user import User, UserRole, UserIdentity, ProviderType
    from auth_utils import create_access_token, hash_password

    with app.app_context():
        user = User(
            user_id=10,
            username='localuser',
            display_name='Local User',
            email='local@example.com',
            role=UserRole.user,
        )
        _db.session.add(user)
        _db.session.flush()

        identity = UserIdentity(
            identity_id=1,
            user_id=user.user_id,
            provider=ProviderType.local,
            provider_id='local@example.com',
            password_hash=hash_password('oldpass123'),
            is_verified=True,
        )
        _db.session.add(identity)
        _db.session.commit()
        user_id = user.user_id

    token = create_access_token(user_id)
    return {'access_token': token}


@pytest.fixture
def auth_headers_google_only(app):
    """Create a test user with only a Google identity (no local identity)."""
    from models.user import User, UserRole, UserIdentity, ProviderType
    from auth_utils import create_access_token

    with app.app_context():
        user = User(
            user_id=20,
            username='googleuser',
            display_name='Google User',
            email='google@example.com',
            role=UserRole.user,
        )
        _db.session.add(user)
        _db.session.flush()

        identity = UserIdentity(
            identity_id=2,
            user_id=user.user_id,
            provider=ProviderType.google,
            provider_id='google-sub-12345',
            is_verified=True,
        )
        _db.session.add(identity)
        _db.session.commit()
        user_id = user.user_id

    token = create_access_token(user_id)
    return {'access_token': token}


def test_health_endpoint(client):
    resp = client.get('/api/health')
    assert resp.status_code == 200


def test_upload_signature_requires_auth(client):
    resp = client.get('/api/users/me/upload-signature')
    assert resp.status_code == 401


def test_upload_signature_returns_fields(client, auth_headers):
    resp = _authed(client, auth_headers, 'get', '/api/users/me/upload-signature')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'signature' in data
    assert 'timestamp' in data
    assert 'cloud_name' in data
    assert 'api_key' in data
    assert 'folder' in data
    assert 'public_id' in data


def test_patch_me_updates_avatar_url(client, auth_headers):
    resp = _authed(
        client, auth_headers, 'patch', '/api/users/me',
        json={'avatar_url': 'https://res.cloudinary.com/demo/image/upload/sample.jpg'},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['user']['avatar_url'] == 'https://res.cloudinary.com/demo/image/upload/sample.jpg'


def test_patch_me_rejects_empty_display_name(client, auth_headers):
    resp = _authed(
        client, auth_headers, 'patch', '/api/users/me',
        json={'display_name': ''},
    )
    assert resp.status_code == 400


# ── PUT /api/users/me/password ─────────────────────────────────────────────────

def test_change_password_success(app, client, auth_headers_with_local_identity):
    """Valid current + new password → 200, tokens revoked."""
    from models.user import UserToken
    from auth_utils import hash_token
    from datetime import datetime, timezone, timedelta

    # Create an active token in DB so we can verify revocation
    token_str = auth_headers_with_local_identity['access_token']
    with app.app_context():
        from models.user import User
        user = User.query.filter_by(email='local@example.com').first()
        active_token = UserToken(
            token_id=1,
            user_id=user.user_id,
            token_hash=hash_token(token_str),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
            is_revoked=False,
        )
        _db.session.add(active_token)
        _db.session.commit()
        token_id = active_token.token_id

    resp = _authed(
        client, auth_headers_with_local_identity, 'put', '/api/users/me/password',
        json={'current_password': 'oldpass123', 'new_password': 'newpass456'},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True

    with app.app_context():
        revoked = UserToken.query.get(token_id)
        assert revoked.is_revoked is True


def test_change_password_missing_fields(client, auth_headers_with_local_identity):
    """Missing new_password → 400 MISSING_FIELDS."""
    resp = _authed(
        client, auth_headers_with_local_identity, 'put', '/api/users/me/password',
        json={'current_password': 'oldpass123'},
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data['error_code'] == 'MISSING_FIELDS'


def test_change_password_wrong_current(client, auth_headers_with_local_identity):
    """Wrong current_password → 400 WRONG_PASSWORD."""
    resp = _authed(
        client, auth_headers_with_local_identity, 'put', '/api/users/me/password',
        json={'current_password': 'wrongpass', 'new_password': 'newpass456'},
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data['error_code'] == 'WRONG_PASSWORD'


def test_change_password_weak_new(client, auth_headers_with_local_identity):
    """new_password length < 6 → 400 WEAK_PASSWORD."""
    resp = _authed(
        client, auth_headers_with_local_identity, 'put', '/api/users/me/password',
        json={'current_password': 'oldpass123', 'new_password': '123'},
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data['error_code'] == 'WEAK_PASSWORD'


def test_change_password_same_password(client, auth_headers_with_local_identity):
    """new_password same as current → 400 SAME_PASSWORD."""
    resp = _authed(
        client, auth_headers_with_local_identity, 'put', '/api/users/me/password',
        json={'current_password': 'oldpass123', 'new_password': 'oldpass123'},
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data['error_code'] == 'SAME_PASSWORD'


def test_change_password_no_local_account(client, auth_headers_google_only):
    """User has only Google identity → 400 NO_LOCAL_ACCOUNT."""
    resp = _authed(
        client, auth_headers_google_only, 'put', '/api/users/me/password',
        json={'current_password': 'anypass', 'new_password': 'newpass456'},
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data['error_code'] == 'NO_LOCAL_ACCOUNT'


def test_change_password_unauthenticated(client):
    """No cookie → 401."""
    resp = client.put(
        '/api/users/me/password',
        json={'current_password': 'oldpass123', 'new_password': 'newpass456'},
    )
    assert resp.status_code == 401
