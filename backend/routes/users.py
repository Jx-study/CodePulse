import time
import cloudinary
import cloudinary.uploader
import cloudinary.utils
from flask import Blueprint, jsonify, current_app, g, request

from auth_utils import login_required
from database import db
from models.user import User

users_bp = Blueprint('users', __name__)

ALLOWED_THEMES = {'light', 'dark', 'system'}
ALLOWED_LANGUAGES = {'en', 'zh-TW', 'zh-CN'}


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
    user = User.query.get(g.current_user_id)
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
        if url and len(url) > 500:
            errors['avatar_url'] = 'URL 過長'
        else:
            user.avatar_url = url or None

    if 'theme' in data:
        if data['theme'] not in ALLOWED_THEMES:
            errors['theme'] = f"theme 需為 {ALLOWED_THEMES} 之一"
        else:
            user.theme = data['theme']

    if 'language' in data:
        if data['language'] not in ALLOWED_LANGUAGES:
            errors['language'] = f"language 需為 {ALLOWED_LANGUAGES} 之一"
        else:
            user.language = data['language']

    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'update_me failed: {e}')
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({'success': True, 'user': user.to_dict()}), 200
