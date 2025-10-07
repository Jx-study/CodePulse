from flask import Blueprint, jsonify

analyze_bp = Blueprint('analyze', __name__, url_prefix='/api/analyze')

@analyze_bp.route('/', methods=['GET'])
def analyze_index():
    """分析功能首頁"""
    return jsonify({
        'message': 'Code Analysis API',
        'endpoints': [
            'GET /api/analyze/ - 此頁面',
            'POST /api/analyze/code - 分析程式碼（待實作）'
        ]
    })

@analyze_bp.route('/code', methods=['POST'])
def analyze_code():
    """分析程式碼 - 待"""
    return jsonify({
        'message': '程式碼分析功能待實作',
        'status': 'coming_soon'
    })
