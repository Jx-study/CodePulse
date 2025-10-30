import os
from dotenv import load_dotenv

# 載入環境變數 - 從根目錄載入 .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class Config:
    # Flask 配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

    # Supabase 配置
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    # CORS 配置
    CORS_ORIGINS = ['http://localhost:5173']

class DevelopmentConfig(Config):
    DEBUG = True
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

class ProductionConfig(Config):
    DEBUG = False
    # 從環境變數讀取允許的前端域名
    CORS_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '').split(',')

    # 生產環境安全設置
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # 確保生產環境必須設置 SECRET_KEY
    @property
    def SECRET_KEY(self):
        secret = os.environ.get('SECRET_KEY')
        if not secret:
            raise ValueError('SECRET_KEY must be set in production environment')
        return secret

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}