from flask import Blueprint, jsonify, request, make_response, g
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import uuid

from database import db
from models.user import User, UserIdentity, UserToken, EmailVerification, ProviderType, UserRole, VerificationPurpose
from auth_utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, hash_token,
    set_auth_cookies, clear_auth_cookies,
    login_required, REFRESH_TOKEN_EXPIRES,
    generate_verification_code,
)
from services.mail import send_verification_email

auth_bp = Blueprint('auth', __name__)


def _user_to_dict(user):
    return {
        'id': str(user.user_id),
        'email': user.email,
        'display_name': user.display_name,
        'role': user.role.value,
        'avatar_url': user.avatar_url,
        'theme': user.theme,
        'language': user.language,
        'total_xp': user.total_xp,
        'current_streak': user.current_streak,
        'longest_streak': user.longest_streak,
        'last_login_date': user.last_login_date.isoformat() if user.last_login_date else None,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }


# ── Streak helper ────────────────────────────────────────────────────────────

def _update_streak(user):
    """Update login streak for user. Call inside an open DB session."""
    try:
        tz = ZoneInfo(user.timezone or 'UTC')
    except Exception:
        tz = ZoneInfo('UTC')

    today = datetime.now(timezone.utc).astimezone(tz).date()

    try:
        db.session.execute(
            db.text(
                "INSERT INTO user_login_streaks (user_id, login_date) "
                "VALUES (:uid, :d) ON CONFLICT DO NOTHING"
            ),
            {'uid': user.user_id, 'd': today}
        )
    except Exception:
        db.session.rollback()

    last = user.last_login_date
    if last is None or last < today:
        if last is not None and (today - last).days == 1:
            user.current_streak += 1
        else:
            user.current_streak = 1
        if user.current_streak > user.longest_streak:
            user.longest_streak = user.current_streak
        user.last_login_date = today


# ── Register ─────────────────────────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
def register():
    import logging
    raw_body = request.get_data(as_text=True)
    content_type = request.content_type
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    username = (data.get('username') or '').strip()

    # Validation
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': '請輸入有效的信箱', 'error_code': 'INVALID_EMAIL'}), 400
    if not password or len(password) < 6:
        return jsonify({'success': False, 'message': '密碼至少需要6個字符', 'error_code': 'WEAK_PASSWORD'}), 400
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
        user = User.query.filter_by(email=username_or_email.lower()).first()
    else:
        user = User.query.filter_by(display_name=username_or_email).first()

    if not user or user.deleted_at is not None:
        return jsonify({'success': False, 'message': 'Email 或密碼錯誤', 'error_code': 'INVALID_CREDENTIALS'}), 401

    # Get local identity
    identity = UserIdentity.query.filter_by(
        user_id=user.user_id,
        provider=ProviderType.local,
    ).first()

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

        # Update streak (uses updated user.timezone)
        _update_streak(user)

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
        'session': {
            'access_token': access_token,
            'refresh_token': refresh_token,
        },
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
    user = User.query.get(g.current_user_id)
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

    user = User.query.get(user_id)
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
            user = User.query.get(int(payload['sub']))
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

            user = User.query.get(user_id)
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
                secure=False,
                samesite='Lax',
                max_age=15 * 60,
                path='/',
            )
            return resp

        except (pyjwt.InvalidTokenError, Exception):
            return jsonify({'isAuthenticated': False}), 200

    if user is None or user.deleted_at is not None:
        return jsonify({'isAuthenticated': False}), 200

    return jsonify({
        'isAuthenticated': True,
        'user': _user_to_dict(user),
    }), 200
