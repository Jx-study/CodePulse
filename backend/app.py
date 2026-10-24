from flask import Flask, jsonify
from flask_cors import CORS
from flask_mailman import Mail
import logging
import os

from config import config
from database import init_db, test_connection
from extensions import limiter

from routes.auth import auth_bp
from routes.analyze import analyze_bp
from routes.summary import summary_bp
from routes.oauth import register_oauth_routes
from routes.users import users_bp
from routes.tutorials import tutorials_bp
from routes.explore import explore_bp
from services.algo_identification import warmup as algo_warmup

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    cfg = config[config_name]
    app.config.from_object(cfg)
    cfg.init_app(app)

    if config_name == 'production':
        # 生產環境 gunicorn 綁 127.0.0.1，前面有 reverse proxy：
        # 沒有 ProxyFix 時 request.remote_addr 恆為 proxy IP，
        # flask-limiter 的 per-IP 限制會退化成全站共用一個配額
        from werkzeug.middleware.proxy_fix import ProxyFix
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    limiter.init_app(app)

    logging.basicConfig(level=logging.INFO)

    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    })

    # Initialize SQLAlchemy + Flask-Migrate
    # Import models so Flask-Migrate can detect them
    import models  # noqa: F401
    init_db(app)

    mail = Mail(app)
    app.extensions['mail'] = mail

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(analyze_bp)
    app.register_blueprint(summary_bp)
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(tutorials_bp, url_prefix='/api/tutorials')
    app.register_blueprint(explore_bp)
    register_oauth_routes(app)

    if not app.config.get("TESTING") and os.getenv("SKIP_ML_WARMUP") != "1":
        algo_warmup()

    @app.errorhandler(429)
    def handle_rate_limit(e):
        # flask-limiter 觸發限流時預設回 HTML，統一轉成前端可解析的 JSON。
        # 各 route 自行 jsonify 的 429（如重寄驗證碼冷卻）不走此 handler。
        return jsonify({
            'success': False,
            'error_code': 'RATE_LIMITED',
            'message': '操作太頻繁，請幾分鐘後再試',
        }), 429

    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'CodePulse API is running',
            'database': test_connection()
        })

    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to CodePulse API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'analyze': '/api/analyze',
                'summary': '/api/summary',
                'health': '/api/health'
            }
        })

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'], use_reloader=True)
