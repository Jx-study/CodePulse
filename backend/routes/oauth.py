import os
import secrets
import uuid
import requests as http_requests
from datetime import datetime, timezone
from urllib.parse import urlencode

from flask import Blueprint, redirect, request, current_app, make_response
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

from database import db
from models.user import User, UserIdentity, UserToken, ProviderType, UserRole
from auth_utils import (
    create_access_token, create_refresh_token,
    create_onboarding_token,
    hash_token, set_auth_cookies, REFRESH_TOKEN_EXPIRES,
)
from routes.auth import _update_streak

GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
OAUTH_STATE_MAX_AGE = 600   # 10 minutes
LINK_TOKEN_MAX_AGE = 300    # 5 minutes for link confirmation


def _frontend_callback_url():
    return current_app.config.get('FRONTEND_URL', 'http://localhost:5173') + '/auth/callback'


def _backend_url():
    return os.environ.get('BACKEND_URL', 'http://localhost:5000')


def _cookie_secure():
    return current_app.config.get('SESSION_COOKIE_SECURE', False)


def register_oauth_routes(app):
    oauth_bp = Blueprint('oauth', __name__)

    @oauth_bp.route('/api/auth/google')
    def google_login():
        # Generate nonce and sign it as state using SECRET_KEY
        nonce = secrets.token_urlsafe(32)
        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        state = serializer.dumps({'nonce': nonce})

        params = {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'redirect_uri': f'{_backend_url()}/api/auth/google/authorized',
            'response_type': 'code',
            'scope': 'openid email profile',
            'state': state,
            'access_type': 'online',
        }

        response = make_response(redirect(f'{GOOGLE_AUTH_URL}?{urlencode(params)}'))
        # Store nonce in short-lived httponly cookie for CSRF verification
        response.set_cookie(
            'oauth_nonce',
            nonce,
            max_age=OAUTH_STATE_MAX_AGE,
            httponly=True,
            samesite='Lax',
            secure=_cookie_secure(),
            path='/api/auth/google',
        )
        return response

    @oauth_bp.route('/api/auth/google/authorized')
    def google_authorized():
        frontend_cb = _frontend_callback_url()
        state = request.args.get('state')
        cookie_nonce = request.cookies.get('oauth_nonce')

        # Verify signed state + CSRF nonce
        if not state or not cookie_nonce:
            current_app.logger.warning('OAuth: missing state or nonce cookie')
            return redirect(f'{frontend_cb}?error=oauth_cancelled')

        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            data = serializer.loads(state, max_age=OAUTH_STATE_MAX_AGE)
            if data.get('nonce') != cookie_nonce:
                raise ValueError('CSRF nonce mismatch')
        except (SignatureExpired, BadSignature, ValueError) as e:
            current_app.logger.warning(f'OAuth state invalid: {e}')
            return redirect(f'{frontend_cb}?error=oauth_cancelled')

        if request.args.get('error'):
            return redirect(f'{frontend_cb}?error=oauth_cancelled')

        code = request.args.get('code')
        if not code:
            return redirect(f'{frontend_cb}?error=oauth_failed')

        # Exchange code for access token
        try:
            token_resp = http_requests.post(GOOGLE_TOKEN_URL, data={
                'code': code,
                'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
                'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
                'redirect_uri': f'{_backend_url()}/api/auth/google/authorized',
                'grant_type': 'authorization_code',
            })
            if not token_resp.ok:
                current_app.logger.error(f'Token exchange failed: {token_resp.text}')
                return redirect(f'{frontend_cb}?error=oauth_failed')

            google_access_token = token_resp.json().get('access_token')

            userinfo_resp = http_requests.get(
                GOOGLE_USERINFO_URL,
                headers={'Authorization': f'Bearer {google_access_token}'},
            )
            if not userinfo_resp.ok:
                return redirect(f'{frontend_cb}?error=oauth_failed')

            info = userinfo_resp.json()
            google_sub = info.get('id') or info.get('sub')
            email = (info.get('email') or '').strip().lower()
            name = info.get('name') or email.split('@')[0]
            picture = info.get('picture')  # Google avatar URL

            if not email or not google_sub:
                return redirect(f'{frontend_cb}?error=oauth_failed')

        except Exception as e:
            current_app.logger.error(f'OAuth token/userinfo failed: {e}')
            return redirect(f'{frontend_cb}?error=oauth_failed')

        # ── Account Linking Logic ────────────────────────────────────────
        query_param = ''
        try:
            existing_identity = UserIdentity.query.filter_by(
                provider=ProviderType.google,
                provider_id=google_sub,
            ).first()

            if existing_identity:
                user = User.query.get(existing_identity.user_id)
                if not user or user.deleted_at is not None:
                    return redirect(f'{frontend_cb}?error=account_disabled')

            else:
                user = User.query.filter_by(email=email).first()

                if user and user.deleted_at is not None:
                    return redirect(f'{frontend_cb}?error=account_disabled')

                elif user:
                    # Email already exists — ask user to confirm linking
                    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
                    link_token = serializer.dumps({
                        'user_id': user.user_id,
                        'google_sub': google_sub,
                        'email': email,
                        'picture': picture,
                    })
                    response = make_response(redirect(
                        f'{frontend_cb}?link_prompt=true'
                    ))
                    response.set_cookie(
                        'oauth_link_token',
                        link_token,
                        max_age=LINK_TOKEN_MAX_AGE,
                        httponly=True,
                        samesite='Lax',
                        secure=_cookie_secure(),
                        path='/api/auth/google',
                    )
                    response.set_cookie('oauth_nonce', '', expires=0, path='/api/auth/google')
                    return response

                else:
                    # 新用戶注冊：先不建立用戶資料，核發 Onboarding Token ，用於延後建立帳號
                    onboarding_token = create_onboarding_token(
                        google_sub=google_sub,
                        email=email,
                        display_name=name,
                        avatar_url=picture,
                    )
                    frontend_onboarding = current_app.config.get('FRONTEND_URL', 'http://localhost:5173') + '/auth/onboarding'
                    response = make_response(redirect(frontend_onboarding))
                    response.set_cookie(
                        'onboarding_token',
                        onboarding_token,
                        max_age=600,
                        httponly=True,
                        samesite='Lax',
                        secure=_cookie_secure(),
                        path='/api/auth',
                    )
                    response.set_cookie('oauth_nonce', '', expires=0, path='/api/auth/google')
                    return response

            _update_streak(user)

            jwt_access = create_access_token(user.user_id)
            jwt_refresh = create_refresh_token(user.user_id)

            token_record = UserToken(
                user_id=user.user_id,
                token_hash=hash_token(jwt_refresh),
                expires_at=datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRES,
                family_id=str(uuid.uuid4()),
            )
            db.session.add(token_record)
            db.session.commit()

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'OAuth account linking failed: {e}')
            return redirect(f'{frontend_cb}?error=server_error')

        response = make_response(redirect(f'{frontend_cb}'))
        set_auth_cookies(response, jwt_access, jwt_refresh)
        response.set_cookie('oauth_nonce', '', expires=0, path='/api/auth/google')
        return response

    @oauth_bp.route('/api/auth/google/confirm-link', methods=['POST'])
    def confirm_link():
        from flask import jsonify

        link_token = request.cookies.get('oauth_link_token')
        if not link_token:
            return jsonify({'success': False, 'message': '連結請求已過期，請重新使用 Google 登入'}), 400

        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            data = serializer.loads(link_token, max_age=LINK_TOKEN_MAX_AGE)
        except (SignatureExpired, BadSignature):
            return jsonify({'success': False, 'message': '連結請求已過期，請重新使用 Google 登入'}), 400

        user_id = data['user_id']
        google_sub = data['google_sub']

        user = User.query.get(user_id)
        if not user or user.deleted_at is not None:
            return jsonify({'success': False, 'message': '帳號不存在或已停用'}), 400

        # Check if already linked (race condition guard)
        existing = UserIdentity.query.filter_by(
            provider=ProviderType.google,
            provider_id=google_sub,
        ).first()
        if existing:
            return jsonify({'success': False, 'message': '此 Google 帳號已綁定'}), 400

        try:
            new_identity = UserIdentity(
                user_id=user.user_id,
                provider=ProviderType.google,
                provider_id=google_sub,
                is_verified=True,
            )
            db.session.add(new_identity)

            if not user.avatar_url and data.get('picture'):
                user.avatar_url = data['picture']

            _update_streak(user)

            jwt_access = create_access_token(user.user_id)
            jwt_refresh = create_refresh_token(user.user_id)

            token_record = UserToken(
                user_id=user.user_id,
                token_hash=hash_token(jwt_refresh),
                expires_at=datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRES,
                family_id=str(uuid.uuid4()),
            )
            db.session.add(token_record)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'Confirm link failed: {e}')
            return jsonify({'success': False, 'message': '伺服器錯誤，請稍後再試'}), 500

        resp = make_response(jsonify({'success': True, 'message': 'Google 帳號已成功綁定'}))
        set_auth_cookies(resp, jwt_access, jwt_refresh)
        resp.set_cookie('oauth_link_token', '', expires=0, path='/api/auth/google')
        return resp

    @oauth_bp.route('/api/auth/google/cancel-link', methods=['POST'])
    def cancel_link():
        from flask import jsonify
        resp = make_response(jsonify({'success': True}))
        resp.set_cookie('oauth_link_token', '', expires=0, path='/api/auth/google')
        return resp

    @oauth_bp.route('/api/auth/google/link-info', methods=['GET'])
    def link_info():
        from flask import jsonify
        link_token = request.cookies.get('oauth_link_token')
        if not link_token:
            return jsonify({'success': False, 'message': '連結請求已過期'}), 400
        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            data = serializer.loads(link_token, max_age=LINK_TOKEN_MAX_AGE)
        except (SignatureExpired, BadSignature):
            return jsonify({'success': False, 'message': '連結請求已過期'}), 400
        return jsonify({'success': True, 'email': data['email']})

    app.register_blueprint(oauth_bp)
