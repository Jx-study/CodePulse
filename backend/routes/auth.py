from flask import Blueprint, request, jsonify
from database import get_supabase_client
import logging

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """用戶註冊 - 使用 Supabase Auth"""
    try:
        data = request.get_json()
        
        # 驗證必要欄位
        required_fields = ['email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error_code': 'MISSING_REQUIRED_FIELD',
                    'field': field,
                    'message': f'缺少必要欄位: {field}'
                }), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        username = data.get('username', '').strip()
        
        # 驗證密碼強度
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error_code': 'PASSWORD_TOO_SHORT',
                'message': '密碼至少需要6個字符'
            }), 400
        
        # 使用 Supabase Auth 註冊
        supabase = get_supabase_client()
        
        # 準備用戶元數據
        user_metadata = {}
        if username:
            user_metadata['username'] = username
        
        auth_response = supabase.auth.sign_up({
            'email': email,
            'password': password,
            'options': {
                'data': user_metadata
            }
        })
        
        if auth_response.user:
            return jsonify({
                'success': True,
                'message': '註冊成功！請檢查信箱進行驗證。',
                'user': {
                    'id': auth_response.user.id,
                    'email': auth_response.user.email,
                    'username': auth_response.user.user_metadata.get('username'),
                    'email_confirmed': auth_response.user.email_confirmed_at is not None,
                },
                'session': {
                    'access_token': auth_response.session.access_token if auth_response.session else None,
                    'refresh_token': auth_response.session.refresh_token if auth_response.session else None,
                }
            }), 201
        else:
            return jsonify({
                'success': False,
                'error_code': 'REGISTRATION_FAILED',
                'message': '註冊失敗，請稍後再試'
            }), 400
        
    except Exception as e:
        logging.error(f"註冊錯誤: {e}")
        error_message = str(e)
        
        # 處理常見錯誤
        if 'already registered' in error_message.lower():
            return jsonify({
                'success': False,
                'error_code': 'EMAIL_ALREADY_EXISTS',
                'message': '此信箱已被註冊'
            }), 409
        elif 'password' in error_message.lower():
            return jsonify({
                'success': False,
                'error_code': 'INVALID_PASSWORD_FORMAT',
                'message': '密碼格式不符要求'
            }), 400
        else:
            return jsonify({
                'success': False,
                'error_code': 'REGISTRATION_ERROR',
                'message': '註冊失敗，請稍後再試'
            }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """用戶登入 - 使用 Supabase Auth"""
    try:
        data = request.get_json()
        
        # 驗證必要欄位
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'error_code': 'MISSING_CREDENTIALS',
                'message': '請輸入信箱和密碼'
            }), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        # 使用 Supabase Auth 登入
        supabase = get_supabase_client()
        
        auth_response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })
        
        if auth_response.user and auth_response.session:
            return jsonify({
                'success': True,
                'message': '登入成功',
                'user': {
                    'id': auth_response.user.id,
                    'email': auth_response.user.email,
                    'username': auth_response.user.user_metadata.get('username'),
                    'email_confirmed': auth_response.user.email_confirmed_at is not None,
                    'last_sign_in': auth_response.user.last_sign_in_at,
                },
                'session': {
                    'access_token': auth_response.session.access_token,
                    'refresh_token': auth_response.session.refresh_token,
                    'expires_at': auth_response.session.expires_at,
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error_code': 'INVALID_CREDENTIALS',
                'message': '信箱或密碼錯誤'
            }), 401
        
    except Exception as e:
        logging.error(f"登入錯誤: {e}")
        error_message = str(e)
        
        # 處理常見錯誤
        if 'invalid' in error_message.lower() or 'credentials' in error_message.lower():
            return jsonify({
                'success': False,
                'error_code': 'INVALID_CREDENTIALS',
                'message': '信箱或密碼錯誤'
            }), 401
        else:
            return jsonify({
                'success': False,
                'error_code': 'LOGIN_ERROR',
                'message': '登入失敗，請稍後再試'
            }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """用戶登出 - 使用 Supabase Auth"""
    try:
        # 從請求頭獲取 token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': '缺少認證 token'
            }), 401
        
        access_token = auth_header.split(' ')[1]
        
        # 使用 Supabase Auth 登出
        supabase = get_supabase_client()
        supabase.auth.sign_out()
        
        return jsonify({
            'success': True,
            'message': '登出成功'
        }), 200
        
    except Exception as e:
        logging.error(f"登出錯誤: {e}")
        return jsonify({
            'success': False,
            'message': '登出失敗'
        }), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """獲取當前用戶資訊 - 使用 Supabase Auth"""
    try:
        # 從請求頭獲取 token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'message': '缺少認證 token'
            }), 401
        
        access_token = auth_header.split(' ')[1]
        
        # 使用 Supabase Auth 獲取用戶資訊
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(access_token)
        
        if user_response.user:
            return jsonify({
                'success': True,
                'user': {
                    'id': user_response.user.id,
                    'email': user_response.user.email,
                    'username': user_response.user.user_metadata.get('username'),
                    'email_confirmed': user_response.user.email_confirmed_at is not None,
                    'created_at': user_response.user.created_at,
                    'last_sign_in': user_response.user.last_sign_in_at,
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Token 無效或已過期'
            }), 401
        
    except Exception as e:
        logging.error(f"獲取用戶資訊錯誤: {e}")
        return jsonify({
            'success': False,
            'message': 'Token 無效或已過期'
        }), 401

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """刷新 token - 使用 Supabase Auth"""
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({
                'success': False,
                'message': '缺少 refresh token'
            }), 400
        
        # 使用 Supabase Auth 刷新 token
        supabase = get_supabase_client()
        auth_response = supabase.auth.refresh_session(refresh_token)
        
        if auth_response.session:
            return jsonify({
                'success': True,
                'session': {
                    'access_token': auth_response.session.access_token,
                    'refresh_token': auth_response.session.refresh_token,
                    'expires_at': auth_response.session.expires_at,
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Refresh token 無效或已過期'
            }), 401
        
    except Exception as e:
        logging.error(f"Token 刷新錯誤: {e}")
        return jsonify({
            'success': False,
            'message': 'Token 刷新失敗'
        }), 500