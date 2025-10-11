from flask import Blueprint, request, jsonify
from database import get_supabase_client, get_supabase_admin_client
import logging

auth_bp = Blueprint('auth', __name__)

# TODO: 後續調整為為新的table存取用戶的信息，避免登入時一直使用 admin client 查詢所有用戶
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
    """用戶登入 - 使用 Supabase Auth，支援 email 或 username"""
    try:
        data = request.get_json()
        username_or_email = data.get('usernameOrEmail')
        password = data.get('password')

        if not username_or_email or not password:
            return jsonify({
                'success': False,
                'error_code': 'MISSING_CREDENTIALS',
                'message': '請輸入用戶名/信箱和密碼'
            }), 400

        username_or_email = username_or_email.strip()

        # 判斷輸入是 email 還是 username
        email = None
        if '@' in username_or_email:
            # 輸入包含 @，視為 email
            email = username_or_email.lower()
        else:
            # 輸入不含 @，視為 username，需要查詢對應的 email
            try:
                # 使用 Admin client 查詢用戶
                supabase_admin = get_supabase_admin_client()

                if not supabase_admin:
                    logging.error("Admin client 未初始化，無法查詢 username")
                    return jsonify({
                        'success': False,
                        'error_code': 'ADMIN_API_UNAVAILABLE',
                        'message': 'Username 登入功能暫時無法使用，請使用 email 登入'
                    }), 503

                # 從 Supabase 查詢所有用戶（明確指定分頁參數）
                response = supabase_admin.auth.admin.list_users(page=1, per_page=1000)
                # Supabase Python SDK 直接返回 list，不是物件
                users = response if isinstance(response, list) else []

                logging.info(f"查詢 username: {username_or_email}, 找到 {len(users)} 個用戶")

                # 查找匹配的 username
                for user in users:
                    user_metadata = getattr(user, 'user_metadata', None)

                    logging.info(f"檢查用戶 {user.email}: metadata = {user_metadata}")

                    username_in_db = user_metadata.get('username', '') if isinstance(user_metadata, dict) else ''

                    if username_in_db and username_in_db.lower() == username_or_email.lower():
                        # logging.info(f"找到匹配的用戶: {user.email}")
                        email = user.email
                        # 檢查 email 是否已驗證
                        if not getattr(user, 'email_confirmed_at', None):
                            return jsonify({
                                'success': False,
                                'error_code': 'EMAIL_NOT_VERIFIED',
                                'message': '請先驗證 Email 後再登入'
                            }), 403
                        break

                if not email:
                    return jsonify({
                        'success': False,
                        'error_code': 'USER_NOT_FOUND',
                        'message': '找不到此用戶名'
                    }), 404
            except Exception as e:
                # 如果查詢失敗，嘗試直接當作 email 使用
                email = username_or_email.lower()

        # 使用一般 client 進行登入
        supabase = get_supabase_client()
        auth_response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })
        
        # Supabase 認證成功必定有 user 和 session，這裡可以直接使用
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
        
    except Exception as e:
        logging.error(f"登入錯誤: {e}")
        error_message = str(e).lower()
        
        # 處理認證失敗（帳號密碼錯誤）
        if 'invalid' in error_message or 'credentials' in error_message:
            return jsonify({
                'success': False,
                'error_code': 'INVALID_CREDENTIALS',
                'message': '信箱或密碼錯誤'
            }), 401
        
        # 其他未預期的錯誤
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

@auth_bp.route('/status', methods=['GET'])
def get_user_status():
    """檢查用戶登入狀態 - 用於前端 UserStatus 組件

    TODO: 考慮加入 CORS 檢查，確保僅信任的 origin 可呼叫
    TODO: 實作 rate limiting 防止暴力攻擊
    """
    try:
        # 從請求頭獲取 token
        auth_header = request.headers.get('Authorization')

        # 未提供 token，返回未登入狀態
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'isAuthenticated': False
            }), 200

        access_token = auth_header.split(' ')[1]

        # 使用 Supabase Auth 驗證 token
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(access_token)

        if user_response.user:
            return jsonify({
                'isAuthenticated': True,
                'user': {
                    'id': user_response.user.id,
                    'email': user_response.user.email,
                    'username': user_response.user.user_metadata.get('username'),
                    'avatar': user_response.user.user_metadata.get('avatar'),
                    'email_confirmed': user_response.user.email_confirmed_at is not None,
                    'created_at': user_response.user.created_at,
                    'last_sign_in': user_response.user.last_sign_in_at,
                }
            }), 200
        else:
            return jsonify({
                'isAuthenticated': False
            }), 200

    except Exception as e:
        logging.error(f"檢查用戶狀態錯誤: {e}")
        # 發生錯誤時，返回未登入狀態（安全降級）
        return jsonify({
            'isAuthenticated': False
        }), 200