from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os

# 導入配置和資料庫
from config import config
from database import init_supabase, test_connection

# 導入路由
from routes.auth import auth_bp
from routes.analyze import analyze_bp
from routes.summary import summary_bp

def create_app(config_name=None):
    """應用程式工廠"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 設置日誌
    logging.basicConfig(level=logging.INFO)
    
    # 初始化擴展
    CORS(app)  # 允許跨域請求
    
    # 初始化 Supabase
    try:
        init_supabase()
        logging.info("Supabase 初始化成功")
    except Exception as e:
        logging.warning(f"Supabase 初始化失敗: {e}")
    
    # 註冊藍圖
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(analyze_bp)
    app.register_blueprint(summary_bp)
    
    # 健康檢查端點
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'CodePulse API is running',
            'supabase': test_connection()
        })
    
    # 根路由
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to CodePulse API',
            'version': '1.0.0',
            'auth_provider': 'Supabase',
            'endpoints': {
                'auth': '/api/auth',
                'analyze': '/api/analyze',
                'summary': '/api/summary',
                'health': '/api/health'
            }
        })

    return app

# 創建應用程式實例
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'], use_reloader=True)