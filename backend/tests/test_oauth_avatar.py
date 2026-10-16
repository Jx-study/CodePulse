"""Tests for Google OAuth avatar sync rules."""
import pytest

from routes.oauth import _is_replaceable_avatar


@pytest.mark.parametrize('avatar_url', [
    None,
    '',
    'https://lh3.googleusercontent.com/a/abc=s96-c',
    'https://googleusercontent.com/a/abc',
])
def test_replaceable_avatar(avatar_url):
    assert _is_replaceable_avatar(avatar_url) is True


@pytest.mark.parametrize('avatar_url', [
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    'https://evilgoogleusercontent.com/a/abc',
    'https://example.com/googleusercontent.com/a.png',
])
def test_custom_avatar_is_kept(avatar_url):
    assert _is_replaceable_avatar(avatar_url) is False


# ── Callback / confirm-link 整合測試 ─────────────────────────────────────

from unittest.mock import MagicMock, patch

from itsdangerous import URLSafeTimedSerializer
from sqlalchemy import BigInteger
from sqlalchemy.ext.compiler import compiles

from database import db as _db
from models.user import ProviderType, User, UserIdentity, UserRole

@compiles(BigInteger, 'sqlite')
def _bigint_as_integer_on_sqlite(type_, compiler, **kw):
    # SQLite 只有 INTEGER PRIMARY KEY 會自動遞增；callback 會新增
    # UserIdentity / UserToken 而不指定 id，測試 DB 需要這個對應
    return 'INTEGER'


GOOGLE_SUB = 'google-sub-123'
GOOGLE_EMAIL = 'g@example.com'
OLD_GOOGLE_AVATAR = 'https://lh3.googleusercontent.com/a/old=s96-c'
NEW_GOOGLE_AVATAR = 'https://lh3.googleusercontent.com/a/new=s96-c'
CLOUDINARY_AVATAR = 'https://res.cloudinary.com/demo/image/upload/custom.jpg'


def _make_user(avatar_url, email=GOOGLE_EMAIL, with_identity=True):
    user = User(
        username='guser',
        display_name='G User',
        email=email,
        role=UserRole.user,
        avatar_url=avatar_url,
    )
    _db.session.add(user)
    _db.session.flush()
    if with_identity:
        _db.session.add(UserIdentity(
            user_id=user.user_id,
            provider=ProviderType.google,
            provider_id=GOOGLE_SUB,
            is_verified=True,
        ))
    _db.session.commit()
    return user.user_id


def _fake_response(payload):
    resp = MagicMock()
    resp.ok = True
    resp.json.return_value = payload
    return resp


def _run_callback(app, client, picture):
    """以假的 Google token/userinfo 回應呼叫 /api/auth/google/authorized"""
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    nonce = 'test-nonce'
    state = serializer.dumps({'nonce': nonce})
    client.set_cookie('oauth_nonce', nonce, path='/api/auth/google')

    userinfo = {'id': GOOGLE_SUB, 'email': GOOGLE_EMAIL, 'name': 'G User'}
    if picture is not None:
        userinfo['picture'] = picture

    with patch('routes.oauth.http_requests.post',
               return_value=_fake_response({'access_token': 'tok'})), \
         patch('routes.oauth.http_requests.get',
               return_value=_fake_response(userinfo)):
        return client.get(f'/api/auth/google/authorized?state={state}&code=abc')


def _avatar_of(user_id):
    _db.session.expire_all()
    return _db.session.get(User, user_id).avatar_url


class TestCallbackAvatarSync:
    def test_empty_avatar_is_filled(self, app, client):
        uid = _make_user(avatar_url=None)
        resp = _run_callback(app, client, NEW_GOOGLE_AVATAR)
        assert resp.status_code == 302
        assert 'error=' not in resp.headers['Location']
        assert _avatar_of(uid) == NEW_GOOGLE_AVATAR

    def test_stale_google_avatar_is_replaced(self, app, client):
        uid = _make_user(avatar_url=OLD_GOOGLE_AVATAR)
        _run_callback(app, client, NEW_GOOGLE_AVATAR)
        assert _avatar_of(uid) == NEW_GOOGLE_AVATAR

    def test_cloudinary_avatar_is_kept(self, app, client):
        uid = _make_user(avatar_url=CLOUDINARY_AVATAR)
        resp = _run_callback(app, client, NEW_GOOGLE_AVATAR)
        assert resp.status_code == 302
        assert 'error=' not in resp.headers['Location']
        assert _avatar_of(uid) == CLOUDINARY_AVATAR

    def test_missing_picture_keeps_existing_google_avatar(self, app, client):
        uid = _make_user(avatar_url=OLD_GOOGLE_AVATAR)
        _run_callback(app, client, picture=None)
        assert _avatar_of(uid) == OLD_GOOGLE_AVATAR

    def test_missing_picture_keeps_empty_avatar(self, app, client):
        uid = _make_user(avatar_url=None)
        _run_callback(app, client, picture=None)
        assert _avatar_of(uid) is None

    def test_email_match_without_identity_does_not_touch_avatar(self, app, client):
        """未綁定的 email 走 link_prompt，確認前不可改動頭像"""
        uid = _make_user(avatar_url=OLD_GOOGLE_AVATAR, with_identity=False)
        resp = _run_callback(app, client, NEW_GOOGLE_AVATAR)
        assert 'link_prompt=true' in resp.headers['Location']
        assert _avatar_of(uid) == OLD_GOOGLE_AVATAR


class TestConfirmLinkAvatar:
    def _confirm(self, app, client, uid, picture):
        serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
        token = serializer.dumps({
            'user_id': uid,
            'google_sub': GOOGLE_SUB,
            'email': GOOGLE_EMAIL,
            'picture': picture,
        })
        client.set_cookie('oauth_link_token', token, path='/api/auth/google')
        return client.post('/api/auth/google/confirm-link')

    def test_empty_avatar_is_filled(self, app, client):
        uid = _make_user(avatar_url=None, with_identity=False)
        resp = self._confirm(app, client, uid, NEW_GOOGLE_AVATAR)
        assert resp.status_code == 200
        assert _avatar_of(uid) == NEW_GOOGLE_AVATAR

    def test_existing_avatar_is_kept(self, app, client):
        uid = _make_user(avatar_url=CLOUDINARY_AVATAR, with_identity=False)
        resp = self._confirm(app, client, uid, NEW_GOOGLE_AVATAR)
        assert resp.status_code == 200
        assert _avatar_of(uid) == CLOUDINARY_AVATAR
