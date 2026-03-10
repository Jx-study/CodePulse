import jwt
import bcrypt
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app

# ── JWT ─────────────────────────────────────────────────────────────────────

ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRES = timedelta(days=7)

ALGORITHM = 'HS256'


def _secret():
    return current_app.config['SECRET_KEY']


def create_access_token(user_id: int) -> str:
    """Sign a short-lived access JWT."""
    now = datetime.now(timezone.utc)
    payload = {
        'sub': str(user_id),
        'type': 'access',
        'iat': now,
        'exp': now + ACCESS_TOKEN_EXPIRES,
    }
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    """Sign a long-lived refresh JWT."""
    now = datetime.now(timezone.utc)
    payload = {
        'sub': str(user_id),
        'type': 'refresh',
        'jti': secrets.token_hex(16),   # unique per token
        'iat': now,
        'exp': now + REFRESH_TOKEN_EXPIRES,
    }
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def decode_token(token: str, expected_type: str) -> dict:
    """
    Decode and validate a JWT.
    Raises jwt.ExpiredSignatureError, jwt.InvalidTokenError on failure.
    """
    payload = jwt.decode(token, _secret(), algorithms=[ALGORITHM])
    if payload.get('type') != expected_type:
        raise jwt.InvalidTokenError('Wrong token type')
    return payload


# ── Token hash (for DB storage) ──────────────────────────────────────────────

def hash_token(token: str) -> str:
    """SHA-256 hash of a token string for safe DB storage."""
    return hashlib.sha256(token.encode()).hexdigest()


# ── Password hashing ─────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── Cookie helpers ───────────────────────────────────────────────────────────

COOKIE_SECURE = False   # set to True in production (HTTPS only)
COOKIE_SAMESITE = 'Lax'


def set_auth_cookies(response, access_token: str, refresh_token: str):
    """Set HTTP-only auth cookies on the response."""
    response.set_cookie(
        'access_token',
        access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=int(ACCESS_TOKEN_EXPIRES.total_seconds()),
        path='/',
    )
    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=int(REFRESH_TOKEN_EXPIRES.total_seconds()),
        path='/api/auth',   # restrict refresh cookie to auth routes
    )


def clear_auth_cookies(response):
    """Clear both auth cookies."""
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/api/auth')


# ── Verification code ─────────────────────────────────────────────────────────

import string

_CODE_ALPHABET = string.ascii_uppercase + string.digits

def generate_verification_code(length: int = 6) -> str:
    """Generate a cryptographically secure uppercase alphanumeric code."""
    return ''.join(secrets.choice(_CODE_ALPHABET) for _ in range(length))


# ── Auth decorator ────────────────────────────────────────────────────────────

def login_required(f):
    """Decorator: require valid access_token cookie. Injects g.current_user_id."""
    from flask import g
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('access_token')
        if not token:
            return jsonify({'success': False, 'message': '請先登入', 'error_code': 'UNAUTHORIZED'}), 401
        try:
            payload = decode_token(token, 'access')
            g.current_user_id = int(payload['sub'])
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token 已過期，請重新登入', 'error_code': 'TOKEN_EXPIRED'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': '無效的 Token', 'error_code': 'INVALID_TOKEN'}), 401
        return f(*args, **kwargs)
    return decorated
