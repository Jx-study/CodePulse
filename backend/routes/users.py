import time
import cloudinary
import cloudinary.uploader
import cloudinary.utils
from datetime import datetime, timezone
from flask import Blueprint, jsonify, current_app, g, request

from auth_utils import login_required, hash_password, verify_password
from database import db
from models.user import User, UserIdentity, UserToken, ProviderType, Language, Theme

users_bp = Blueprint('users', __name__)

ALLOWED_THEMES = {theme.value for theme in Theme}
ALLOWED_LANGUAGES = {lang.value for lang in Language}


def _init_cloudinary():
    cloudinary.config(
        cloud_name=current_app.config['CLOUDINARY_CLOUD_NAME'],
        api_key=current_app.config['CLOUDINARY_API_KEY'],
        api_secret=current_app.config['CLOUDINARY_API_SECRET'],
    )


@users_bp.route('/me/upload-signature', methods=['GET'])
@login_required
def get_upload_signature():
    _init_cloudinary()
    user_id = g.current_user_id
    timestamp = int(time.time())
    folder = 'avatars'
    public_id = f'user_{user_id}'

    params_to_sign = {
        'folder': folder,
        'public_id': public_id,
        'timestamp': timestamp,
    }

    signature = cloudinary.utils.api_sign_request(
        params_to_sign,
        current_app.config['CLOUDINARY_API_SECRET'],
    )

    return jsonify({
        'signature': signature,
        'timestamp': timestamp,
        'cloud_name': current_app.config['CLOUDINARY_CLOUD_NAME'],
        'api_key': current_app.config['CLOUDINARY_API_KEY'],
        'folder': folder,
        'public_id': public_id,
    }), 200


@users_bp.route('/me', methods=['PATCH'])
@login_required
def update_me():
    user = db.session.get(User, g.current_user_id)
    if not user or user.deleted_at is not None:
        return jsonify({'success': False, 'message': '用戶不存在'}), 404

    data = request.get_json(silent=True) or {}
    errors = {}

    if 'display_name' in data:
        name = data['display_name']
        if not name or not name.strip():
            errors['display_name'] = '顯示名稱不可為空'
        elif len(name.strip()) > 50:
            errors['display_name'] = '顯示名稱不可超過 50 字元'
        else:
            user.display_name = name.strip()

    if 'avatar_url' in data:
        url = data['avatar_url']
        if url:
            if len(url) > 500:
                errors['avatar_url'] = 'URL 過長'
            elif not url.startswith('https://res.cloudinary.com/'):
                errors['avatar_url'] = 'avatar_url 只允許 Cloudinary 圖片'
            else:
                user.avatar_url = url
        else:
            user.avatar_url = None

    if 'theme' in data:
        if data['theme'] not in ALLOWED_THEMES:
            errors['theme'] = f"theme 需為 {ALLOWED_THEMES} 之一"
        else:
            user.theme = Theme(data['theme'])

    if 'language' in data:
        if data['language'] not in ALLOWED_LANGUAGES:
            errors['language'] = f"language 需為 {ALLOWED_LANGUAGES} 之一"
        else:
            user.language = Language(data['language'])

    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'update_me failed: {e}')
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({'success': True, 'user': user.to_dict()}), 200


@users_bp.route('/me/password', methods=['PUT'])
@login_required
def change_password():
    data = request.get_json(silent=True) or {}
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({
            'success': False,
            'error_code': 'MISSING_FIELDS',
            'message': '請填寫所有欄位',
        }), 400

    user = db.session.get(User, g.current_user_id)
    if not user or user.deleted_at is not None:
        return jsonify({
            'success': False,
            'error_code': 'USER_NOT_FOUND',
            'message': '用戶不存在',
        }), 404

    identity = UserIdentity.query.filter_by(
        user_id=user.user_id,
        provider=ProviderType.local,
    ).first()

    if not identity:
        return jsonify({
            'success': False,
            'error_code': 'NO_LOCAL_ACCOUNT',
            'message': '此帳號使用 Google 登入，無法修改密碼',
        }), 400

    if not verify_password(current_password, identity.password_hash):
        return jsonify({
            'success': False,
            'error_code': 'WRONG_PASSWORD',
            'message': '目前密碼錯誤',
        }), 400

    if len(new_password) < 6:
        return jsonify({
            'success': False,
            'error_code': 'WEAK_PASSWORD',
            'message': '密碼至少需要 6 個字元',
        }), 400

    if verify_password(new_password, identity.password_hash):
        return jsonify({
            'success': False,
            'error_code': 'SAME_PASSWORD',
            'message': '新密碼不可與目前密碼相同',
        }), 400

    try:
        identity.password_hash = hash_password(new_password)
        now = datetime.now(timezone.utc)
        UserToken.query.filter(
            UserToken.user_id == user.user_id,
            UserToken.is_revoked == False,
            UserToken.expires_at > now,
        ).update({'is_revoked': True})
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'change_password failed: {e}')
        return jsonify({
            'success': False,
            'error_code': 'SERVER_ERROR',
            'message': '伺服器錯誤，請稍後再試',
        }), 500

    return jsonify({'success': True, 'message': '密碼已更新，請重新登入'}), 200


@users_bp.route('/me/progress', methods=['GET'])
@login_required
def get_my_progress():
    from models.tutorial import UserTutorialProgress, Tutorial
    user_id = g.current_user_id

    rows = (
        db.session.query(UserTutorialProgress, Tutorial.slug)
        .join(Tutorial, Tutorial.tutorial_id == UserTutorialProgress.tutorial_id)
        .filter(UserTutorialProgress.user_id == user_id)
        .all()
    )

    progress = []
    for utp, slug in rows:
        progress.append({
            'tutorial_slug': slug,
            'teaching_completed': utp.teaching_completed,
            'best_score': utp.best_score,
            'best_time_seconds': utp.best_time_seconds,
            'attempt_count': utp.attempt_count,
            'practice_passed': utp.practice_passed,
            'status': utp.status.value,
            'last_accessed_at': utp.last_accessed_at.isoformat() if utp.last_accessed_at else None,
        })

    return jsonify({'success': True, 'progress': progress}), 200
