from flask import Blueprint, jsonify, request, make_response, g
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
import uuid

from database import db
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from models.user import User, UserIdentity, UserToken, EmailVerification, ProviderType, UserRole, VerificationPurpose
from auth_utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_onboarding_token,
    decode_token, hash_token,
    set_auth_cookies, clear_auth_cookies,
    login_required, REFRESH_TOKEN_EXPIRES,
    generate_verification_code, _cookie_secure,
)
from services.mail import send_verification_email, send_password_reset_email
from extensions import limiter

auth_bp = Blueprint('auth', __name__)


def _user_to_dict(user):
    has_local_password = any(
        i.provider == ProviderType.local and bool(i.password_hash)
        for i in user.identities
    )
    return {
        'id': str(user.user_id),
        'username': user.username,
        'email': user.email,
        'display_name': user.display_name,
        'role': user.role.value,
        'avatar_url': user.avatar_url,
        'theme': user.theme.value if user.theme else None,
        'language': user.language.value if user.language else None,
        'total_xp': user.total_xp,
        'current_streak': user.current_streak,
        'longest_streak': user.longest_streak,
        'last_login_date': user.last_login_date.isoformat() if user.last_login_date else None,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'has_local_password': has_local_password,
        'timezone': user.timezone,
    }


# ── Register ─────────────────────────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    username = (data.get('username') or '').strip()

    # Validation
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': '請輸入有效的信箱', 'error_code': 'INVALID_EMAIL'}), 400
    if pw_err := _validate_password(password):
        return jsonify({'success': False, 'message': pw_err, 'error_code': 'WEAK_PASSWORD'}), 400
    if not username or len(username) < 3:
        return jsonify({'success': False, 'message': '用戶名至少需要3個字符', 'error_code': 'INVALID_USERNAME'}), 400

    # Check email uniqueness
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': '此 Email 已被註冊', 'error_code': 'EMAIL_EXISTS'}), 409

    # Generate verification code and store pending registration
    code = generate_verification_code()
    password_hash = hash_password(password)

    verification = EmailVerification(
        email=email,
        code_hash=hash_token(code),
        purpose=VerificationPurpose.registration,
        extra_data={'username': username, 'password_hash': password_hash},
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
    )
    try:
        db.session.add(verification)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '伺服器錯誤，請稍後再試', 'error_code': 'SERVER_ERROR'}), 500

    try:
        send_verification_email(email, code)
    except Exception:
        return jsonify({'success': False, 'message': '驗證碼寄送失敗，請稍後再試', 'error_code': 'MAIL_ERROR'}), 500

    return jsonify({'success': True, 'message': '驗證碼已寄出，請檢查您的信箱'}), 200


# ── Login ────────────────────────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute; 50 per hour")
def login():
    data = request.get_json(silent=True) or {}
    username_or_email = (data.get('usernameOrEmail') or '').strip()
    password = data.get('password') or ''

    if not username_or_email:
        return jsonify({'success': False, 'message': '請輸入 Email 或用戶名', 'error_code': 'MISSING_CREDENTIALS'}), 400
    if not password:
        return jsonify({'success': False, 'message': '請輸入密碼', 'error_code': 'MISSING_PASSWORD'}), 400

    # Find user by email or username
    if '@' in username_or_email:
        user = User.query.options(joinedload(User.identities)).filter_by(email=username_or_email.lower()).first()
    else:
        user = User.query.options(joinedload(User.identities)).filter(
            db.func.lower(User.username) == username_or_email.lower()
        ).first()

    if not user or user.deleted_at is not None:
        return jsonify({'success': False, 'message': 'Email 或密碼錯誤', 'error_code': 'INVALID_CREDENTIALS'}), 401

    # Get local identity
    identity = next(
        (i for i in user.identities if i.provider == ProviderType.local),
        None,
    )

    if not identity or not identity.password_hash:
        return jsonify({'success': False, 'message': 'Email 或密碼錯誤', 'error_code': 'INVALID_CREDENTIALS'}), 401

    if not verify_password(password, identity.password_hash):
        return jsonify({'success': False, 'message': 'Email 或密碼錯誤', 'error_code': 'INVALID_CREDENTIALS'}), 401

    try:
        # Sync timezone from client (silent update)
        client_tz = (data.get('timezone') or '').strip()
        if client_tz and len(client_tz) <= 50 and client_tz != user.timezone:
            try:
                ZoneInfo(client_tz)
                user.timezone = client_tz
            except Exception:
                pass

        # Issue tokens
        access_token = create_access_token(user.user_id)
        refresh_token = create_refresh_token(user.user_id)

        # Persist refresh token hash
        token_record = UserToken(
            user_id=user.user_id,
            token_hash=hash_token(refresh_token),
            expires_at=datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRES,
            family_id=str(uuid.uuid4()),
        )
        db.session.add(token_record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '登入失敗，請稍後再試', 'error_code': 'SERVER_ERROR'}), 500

    resp = make_response(jsonify({
        'success': True,
        'message': '登入成功',
        'user': _user_to_dict(user),
    }), 200)
    set_auth_cookies(resp, access_token, refresh_token)
    return resp


# ── Logout ───────────────────────────────────────────────────────────────────

@auth_bp.route('/logout', methods=['POST'])
def logout():
    refresh_token_cookie = request.cookies.get('refresh_token')

    if refresh_token_cookie:
        try:
            token_hash = hash_token(refresh_token_cookie)
            token_record = UserToken.query.filter_by(token_hash=token_hash).first()
            if token_record:
                token_record.is_revoked = True
                db.session.commit()
        except Exception:
            db.session.rollback()

    resp = make_response(jsonify({'success': True, 'message': '已登出'}), 200)
    clear_auth_cookies(resp)
    return resp


# ── Me ───────────────────────────────────────────────────────────────────────

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    user = db.session.get(User, g.current_user_id, options=[joinedload(User.identities)])
    if not user or user.deleted_at is not None:
        return jsonify({'success': False, 'message': '用戶不存在', 'error_code': 'USER_NOT_FOUND'}), 404
    return jsonify({'success': True, 'user': _user_to_dict(user)}), 200


# ── Verify Email ─────────────────────────────────────────────────────────────

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip().upper()

    if not email or not code:
        return jsonify({'success': False, 'message': '缺少必要欄位', 'error_code': 'MISSING_FIELDS'}), 400

    now = datetime.now(timezone.utc)

    # Find latest valid verification record
    verification = EmailVerification.query.filter(
        EmailVerification.email == email,
        EmailVerification.purpose == VerificationPurpose.registration,
        EmailVerification.is_used == False,
        EmailVerification.expires_at > now,
    ).order_by(EmailVerification.created_at.desc()).first()

    if not verification:
        return jsonify({'success': False, 'message': '驗證碼無效或已過期', 'error_code': 'INVALID_OR_EXPIRED_CODE'}), 400

    if verification.code_hash != hash_token(code):
        return jsonify({'success': False, 'message': '驗證碼無效或已過期', 'error_code': 'INVALID_OR_EXPIRED_CODE'}), 400

    # Check email not taken since code was sent
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': '此 Email 已被註冊', 'error_code': 'EMAIL_ALREADY_EXISTS'}), 409

    username = verification.extra_data.get('username')
    password_hash = verification.extra_data.get('password_hash')

    try:
        user = User(
            username=username,
            display_name=username,
            email=email,
            role=UserRole.user,
        )
        db.session.add(user)
        db.session.flush()

        identity = UserIdentity(
            user_id=user.user_id,
            provider=ProviderType.local,
            provider_id=email,
            password_hash=password_hash,
            is_verified=True,
        )
        db.session.add(identity)

        access_token = create_access_token(user.user_id)
        refresh_token = create_refresh_token(user.user_id)

        token_record = UserToken(
            user_id=user.user_id,
            token_hash=hash_token(refresh_token),
            expires_at=now + REFRESH_TOKEN_EXPIRES,
            family_id=str(uuid.uuid4()),
        )
        db.session.add(token_record)

        verification.is_used = True
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '註冊失敗，請稍後再試', 'error_code': 'SERVER_ERROR'}), 500

    resp = make_response(jsonify({
        'success': True,
        'user': _user_to_dict(user),
    }), 200)
    set_auth_cookies(resp, access_token, refresh_token)
    return resp


# ── Complete Setup (Google Onboarding) ───────────────────────────────────────

RESERVED_USERNAMES = {'admin', 'root', 'system', 'codepulse', 'support', 'moderator', 'staff'}
USERNAME_RE = __import__('re').compile(r'^[a-zA-Z0-9_]{3,15}$')


@auth_bp.route('/complete-setup', methods=['POST'])
def complete_setup():
    import jwt as pyjwt

    onboarding_token = request.cookies.get('onboarding_token')
    if not onboarding_token:
        return jsonify({'success': False, 'message': 'Onboarding token 不存在或已過期', 'error_code': 'MISSING_TOKEN'}), 401

    try:
        token_data = decode_onboarding_token(onboarding_token)
    except pyjwt.ExpiredSignatureError:
        return jsonify({'success': False, 'message': '註冊連結已過期，請重新使用 Google 登入', 'error_code': 'TOKEN_EXPIRED'}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({'success': False, 'message': '無效的 Token', 'error_code': 'INVALID_TOKEN'}), 401

    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    display_name = (data.get('display_name') or '').strip() or token_data['display_name']

    if not USERNAME_RE.match(username):
        return jsonify({'success': False, 'message': '用戶名只能包含英文、數字、底線，長度 3-15', 'error_code': 'INVALID_USERNAME'}), 400
    if username.lower() in RESERVED_USERNAMES:
        return jsonify({'success': False, 'message': '此用戶名不可使用', 'error_code': 'RESERVED_USERNAME'}), 400

    existing = User.query.filter(db.func.lower(User.username) == username.lower()).first()
    if existing:
        return jsonify({'success': False, 'message': '此用戶名已被使用', 'error_code': 'USERNAME_TAKEN'}), 409

    google_sub = token_data['google_sub']
    email = token_data['email']
    avatar_url = token_data.get('avatar_url')

    try:
        user = User(
            username=username,
            display_name=display_name,
            email=email,
            role=UserRole.user,
            avatar_url=avatar_url,
        )
        db.session.add(user)
        db.session.flush()

        identity = UserIdentity(
            user_id=user.user_id,
            provider=ProviderType.google,
            provider_id=google_sub,
            is_verified=True,
        )
        db.session.add(identity)

        access_token = create_access_token(user.user_id)
        refresh_token = create_refresh_token(user.user_id)

        token_record = UserToken(
            user_id=user.user_id,
            token_hash=hash_token(refresh_token),
            expires_at=datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRES,
            family_id=str(uuid.uuid4()),
        )
        db.session.add(token_record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'complete-setup failed: {e}')
        return jsonify({'success': False, 'message': '伺服器錯誤，請稍後再試', 'error_code': 'SERVER_ERROR'}), 500

    resp = make_response(jsonify({'success': True, 'user': _user_to_dict(user)}), 200)
    set_auth_cookies(resp, access_token, refresh_token)
    resp.set_cookie('onboarding_token', '', expires=0, path='/api/auth')
    return resp


# ── Check Username Availability ───────────────────────────────────────────────

@auth_bp.route('/check-username', methods=['GET'])
def check_username():
    username = (request.args.get('username') or '').strip()
    if not USERNAME_RE.match(username):
        return jsonify({'error': 'Invalid username format'}), 400
    if username.lower() in RESERVED_USERNAMES:
        return jsonify({'available': False}), 200
    taken = User.query.filter(db.func.lower(User.username) == username.lower()).first()
    return jsonify({'available': taken is None}), 200


# ── Onboarding Info ──────────────────────────────────────────────────────────

@auth_bp.route('/onboarding-info', methods=['GET'])
def onboarding_info():
    import jwt as pyjwt

    onboarding_token = request.cookies.get('onboarding_token')
    if not onboarding_token:
        return jsonify({'success': False, 'error_code': 'MISSING_TOKEN'}), 401

    try:
        token_data = decode_onboarding_token(onboarding_token)
    except pyjwt.ExpiredSignatureError:
        return jsonify({'success': False, 'error_code': 'TOKEN_EXPIRED'}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({'success': False, 'error_code': 'INVALID_TOKEN'}), 401

    return jsonify({
        'success': True,
        'display_name': token_data['display_name'],
        'email': token_data['email'],
    }), 200


# ── Resend Verification ───────────────────────────────────────────────────────

RESEND_COOLDOWN_SECONDS = 60
RESEND_DAILY_LIMIT = 5

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()

    if not email or '@' not in email:
        return jsonify({'success': False, 'message': '請輸入有效的信箱', 'error_code': 'INVALID_EMAIL'}), 400

    # If email already registered, no need to resend
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': '此 Email 已完成驗證', 'error_code': 'ALREADY_VERIFIED'}), 409

    now = datetime.now(timezone.utc)

    # Rate limit: 60-second cooldown
    cooldown_boundary = now - timedelta(seconds=RESEND_COOLDOWN_SECONDS)
    recent = EmailVerification.query.filter(
        EmailVerification.email == email,
        EmailVerification.purpose == VerificationPurpose.registration,
        EmailVerification.created_at > cooldown_boundary,
    ).order_by(EmailVerification.created_at.desc()).first()

    if recent:
        elapsed = (now - recent.created_at.replace(tzinfo=timezone.utc)).total_seconds()
        retry_after = int(RESEND_COOLDOWN_SECONDS - elapsed) + 1
        return jsonify({
            'success': False,
            'message': f'請等待 {retry_after} 秒後再重新發送',
            'error_code': 'RATE_LIMITED',
            'retry_after': retry_after,
        }), 429

    # Daily limit: max 5 sends per email per day
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    daily_count = EmailVerification.query.filter(
        EmailVerification.email == email,
        EmailVerification.purpose == VerificationPurpose.registration,
        EmailVerification.created_at >= today_start,
    ).count()

    if daily_count >= RESEND_DAILY_LIMIT:
        return jsonify({
            'success': False,
            'message': '今日重新發送次數已達上限，請明天再試',
            'error_code': 'DAILY_LIMIT_EXCEEDED',
        }), 429

    # Get extra_data (username/password_hash) from latest existing record
    latest = EmailVerification.query.filter(
        EmailVerification.email == email,
        EmailVerification.purpose == VerificationPurpose.registration,
        EmailVerification.is_used == False,
    ).order_by(EmailVerification.created_at.desc()).first()

    if not latest or not latest.extra_data:
        return jsonify({
            'success': False,
            'message': '找不到待驗證的註冊資料，請重新註冊',
            'error_code': 'NO_PENDING_REGISTRATION',
        }), 404

    code = generate_verification_code()
    verification = EmailVerification(
        email=email,
        code_hash=hash_token(code),
        purpose=VerificationPurpose.registration,
        extra_data=latest.extra_data,
        expires_at=now + timedelta(minutes=5),
    )
    try:
        db.session.add(verification)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '伺服器錯誤，請稍後再試', 'error_code': 'SERVER_ERROR'}), 500

    try:
        send_verification_email(email, code)
    except Exception:
        return jsonify({'success': False, 'message': '驗證碼寄送失敗，請稍後再試', 'error_code': 'MAIL_ERROR'}), 500

    return jsonify({
        'success': True,
        'message': '驗證碼已重新發送，請檢查您的信箱',
        'remaining_attempts': RESEND_DAILY_LIMIT - daily_count - 1,
    }), 200


# ── Refresh ──────────────────────────────────────────────────────────────────

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    import jwt as pyjwt

    token_cookie = request.cookies.get('refresh_token')
    if not token_cookie:
        return jsonify({'success': False, 'error_code': 'MISSING_TOKEN', 'message': '缺少 refresh token'}), 401

    # Validate JWT signature and type
    try:
        payload = decode_token(token_cookie, 'refresh')
        user_id = int(payload['sub'])
    except pyjwt.ExpiredSignatureError:
        return jsonify({'success': False, 'error_code': 'TOKEN_EXPIRED', 'message': 'Token 已過期'}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({'success': False, 'error_code': 'INVALID_TOKEN', 'message': '無效的 Token'}), 401

    # Look up token record in DB
    now = datetime.now(timezone.utc)
    token_hash = hash_token(token_cookie)
    token_record = UserToken.query.filter_by(token_hash=token_hash).first()

    if not token_record:
        return jsonify({'success': False, 'error_code': 'INVALID_TOKEN', 'message': '無效的 Token'}), 401

    if token_record.expires_at.replace(tzinfo=timezone.utc) <= now:
        return jsonify({'success': False, 'error_code': 'TOKEN_EXPIRED', 'message': 'Token 已過期'}), 401

    # Token Replay Detection
    if token_record.is_revoked:
        UserToken.query.filter_by(
            family_id=token_record.family_id,
            is_revoked=False,
        ).update({'is_revoked': True})
        db.session.commit()
        return jsonify({'success': False, 'error_code': 'TOKEN_REUSE_DETECTED', 'message': '偵測到異常，請重新登入'}), 401

    user = db.session.get(User, user_id)
    if not user or user.deleted_at is not None:
        return jsonify({'success': False, 'error_code': 'INVALID_TOKEN', 'message': '無效的 Token'}), 401

    # Rotate tokens inside a transaction
    try:
        token_record.is_revoked = True

        new_access = create_access_token(user.user_id)
        new_refresh = create_refresh_token(user.user_id)

        new_token_record = UserToken(
            user_id=user.user_id,
            token_hash=hash_token(new_refresh),
            expires_at=now + REFRESH_TOKEN_EXPIRES,
            family_id=token_record.family_id,
        )
        db.session.add(new_token_record)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'error_code': 'SERVER_ERROR', 'message': '伺服器錯誤，請稍後再試'}), 500

    resp = make_response(jsonify({'success': True}), 200)
    set_auth_cookies(resp, new_access, new_refresh)
    return resp


# ── Status ───────────────────────────────────────────────────────────────────

@auth_bp.route('/status', methods=['GET'])
def get_user_status():
    """
    Validate access_token cookie. If expired, attempt auto-refresh via refresh_token cookie.
    Returns { isAuthenticated, user } — frontend AuthContext polls this on app load.
    """
    import jwt as pyjwt

    access_token = request.cookies.get('access_token')
    refresh_token_cookie = request.cookies.get('refresh_token')

    user = None

    # Try access token first
    if access_token:
        try:
            payload = decode_token(access_token, 'access')
            user = db.session.get(User, int(payload['sub']), options=[joinedload(User.identities)])
        except pyjwt.ExpiredSignatureError:
            pass  # fall through to refresh
        except pyjwt.InvalidTokenError:
            return jsonify({'isAuthenticated': False}), 200

    # Auto-refresh if access token missing or expired
    if user is None and refresh_token_cookie:
        try:
            payload = decode_token(refresh_token_cookie, 'refresh')
            user_id = int(payload['sub'])

            # Verify refresh token is in DB and not revoked
            token_hash = hash_token(refresh_token_cookie)
            now = datetime.now(timezone.utc)
            token_record = UserToken.query.filter_by(
                token_hash=token_hash,
                is_revoked=False,
            ).filter(UserToken.expires_at > now).first()

            if not token_record:
                return jsonify({'isAuthenticated': False}), 200

            user = db.session.get(User, user_id, options=[joinedload(User.identities)])
            if not user or user.deleted_at is not None:
                return jsonify({'isAuthenticated': False}), 200

            # Issue new access token
            new_access = create_access_token(user.user_id)
            resp = make_response(jsonify({
                'isAuthenticated': True,
                'user': _user_to_dict(user),
            }), 200)
            # Only refresh the access token cookie, keep same refresh token
            resp.set_cookie(
                'access_token',
                new_access,
                httponly=True,
                secure=_cookie_secure(),
                samesite='Lax',
                max_age=15 * 60,
                path='/',
            )
            return resp

        except (pyjwt.InvalidTokenError, Exception):
            return jsonify({'isAuthenticated': False}), 200

    if user is None or user.deleted_at is not None:
        return jsonify({'isAuthenticated': False}), 200

    # Sync timezone from client (silent update)
    client_tz = (request.args.get('timezone') or '').strip()
    if client_tz and len(client_tz) <= 50 and client_tz != user.timezone:
        try:
            ZoneInfo(client_tz)
            user.timezone = client_tz
            db.session.commit()
        except Exception:
            db.session.rollback()

    return jsonify({
        'isAuthenticated': True,
        'user': _user_to_dict(user),
    }), 200


# ── Forgot Password ───────────────────────────────────────────────────────────

FORGOT_COOLDOWN_SECONDS = 60
FORGOT_DAILY_LIMIT = 5

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()

    if not email or '@' not in email:
        return jsonify({'success': False, 'error_code': 'INVALID_EMAIL', 'message': '請輸入有效的信箱'}), 400

    # Always return 200 regardless of whether email exists (prevent enumeration)
    user = User.query.filter(
        User.email == email,
        User.deleted_at.is_(None),
    ).first()

    if not user:
        return jsonify({'success': True, 'message': '若此 Email 已註冊，驗證碼已寄出'}), 200

    # Check if account is OAuth-only (no local identity)
    local_identity = UserIdentity.query.filter_by(
        user_id=user.user_id,
        provider=ProviderType.local,
    ).first()
    if not local_identity or not local_identity.password_hash:
        # Silent return — don't reveal the account uses OAuth (prevents account enumeration)
        return jsonify({'success': True, 'message': '若此 Email 已註冊，驗證碼已寄出'}), 200

    now = datetime.now(timezone.utc)

    # Rate limit: 60-second cooldown (silent — return 200 to prevent enumeration)
    cooldown_boundary = now - timedelta(seconds=FORGOT_COOLDOWN_SECONDS)
    recent = EmailVerification.query.filter(
        EmailVerification.email == email,
        EmailVerification.purpose == VerificationPurpose.password_reset,
        EmailVerification.created_at > cooldown_boundary,
    ).order_by(EmailVerification.created_at.desc()).first()

    if recent:
        return jsonify({'success': True, 'message': '若此 Email 已註冊，驗證碼已寄出'}), 200

    # Rate limit: daily limit (silent)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    daily_count = EmailVerification.query.filter(
        EmailVerification.email == email,
        EmailVerification.purpose == VerificationPurpose.password_reset,
        EmailVerification.created_at >= today_start,
    ).count()

    if daily_count >= FORGOT_DAILY_LIMIT:
        return jsonify({'success': True, 'message': '若此 Email 已註冊，驗證碼已寄出'}), 200

    code = generate_verification_code()
    verification = EmailVerification(
        email=email,
        code_hash=hash_token(code),
        purpose=VerificationPurpose.password_reset,
        expires_at=now + timedelta(minutes=10),
    )
    try:
        db.session.add(verification)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'error_code': 'SERVER_ERROR', 'message': '伺服器錯誤，請稍後再試'}), 500

    try:
        send_password_reset_email(email, code)
    except Exception:
        return jsonify({'success': False, 'error_code': 'MAIL_ERROR', 'message': '驗證碼寄送失敗，請稍後再試'}), 500

    return jsonify({'success': True, 'message': '若此 Email 已註冊，驗證碼已寄出'}), 200


# ── Reset Password ────────────────────────────────────────────────────────────

import re as _re
_CODE_RE = _re.compile(r'^[A-Z0-9]{6}$')

_ALLOWED_SYMBOLS = r'!@#$%^&*_\-+=.,?'
_PASSWORD_RE = _re.compile(
    r'^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[' + _ALLOWED_SYMBOLS + r'])'
    r'[a-zA-Z0-9' + _ALLOWED_SYMBOLS + r']{8,20}$'
)

def _validate_password(password: str) -> str | None:
    """Return error message if password fails policy, else None."""
    if not password or len(password) < 8:
        return '密碼至少需要8個字符'
    if len(password) > 20:
        return '密碼不可超過20個字符'
    if not _PASSWORD_RE.match(password):
        return '密碼需包含大寫、小寫、數字及符號（!@#$%^&*_-+=.,?）'
    return None

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip().upper()
    new_password = data.get('new_password') or ''

    if not email or '@' not in email or not _CODE_RE.match(code):
        return jsonify({'success': False, 'error_code': 'INVALID_INPUT', 'message': '請確認所有欄位格式正確'}), 400

    if pw_err := _validate_password(new_password):
        return jsonify({'success': False, 'error_code': 'WEAK_PASSWORD', 'message': pw_err}), 400

    now = datetime.now(timezone.utc)

    verification = EmailVerification.query.filter(
        EmailVerification.email == email,
        EmailVerification.purpose == VerificationPurpose.password_reset,
        EmailVerification.is_used == False,
        EmailVerification.expires_at > now,
    ).order_by(EmailVerification.created_at.desc()).first()

    if not verification:
        return jsonify({'success': False, 'error_code': 'INVALID_CODE', 'message': '驗證碼錯誤或已過期'}), 400

    if hash_token(code) != verification.code_hash:
        return jsonify({'success': False, 'error_code': 'INVALID_CODE', 'message': '驗證碼錯誤或已過期'}), 400

    user = User.query.filter(
        User.email == email,
        User.deleted_at.is_(None),
    ).first()

    if not user:
        return jsonify({'success': False, 'error_code': 'INVALID_CODE', 'message': '驗證碼錯誤或已過期'}), 400

    identity = UserIdentity.query.filter_by(
        user_id=user.user_id,
        provider=ProviderType.local,
    ).first()

    if not identity:
        return jsonify({'success': False, 'error_code': 'NO_LOCAL_ACCOUNT', 'message': '此帳號未設定密碼，請使用 Google 登入'}), 400

    try:
        identity.password_hash = hash_password(new_password)
        verification.is_used = True
        UserToken.query.filter(
            UserToken.user_id == user.user_id,
            UserToken.is_revoked == False,
            UserToken.expires_at > now,
        ).update({'is_revoked': True})
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'error_code': 'SERVER_ERROR', 'message': '伺服器錯誤，請稍後再試'}), 500

    return jsonify({'success': True, 'message': '密碼已重設，請重新登入'}), 200
