from flask import Blueprint, jsonify

summary_bp = Blueprint('summary', __name__, url_prefix='/api/summary')

@summary_bp.route('/', methods=['GET'])
def summary_index():
    """摘要功能首頁"""
    return jsonify({
        'message': 'Code Summary API',
        'endpoints': [
            'GET /api/summary/ - 此頁面',
            'POST /api/summary/generate - 生成程式摘要（待實作）'
        ]
    })

@summary_bp.route('/generate', methods=['POST'])
def generate_summary():
    """生成程式摘要 - 待實作"""
    return jsonify({
        'message': '程式摘要生成功能待實作',
        'status': 'coming_soon'
    })