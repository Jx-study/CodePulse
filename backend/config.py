import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://codepulse:codepulse_dev@localhost:5432/codepulse'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ['http://localhost:5173']

class DevelopmentConfig(Config):
    DEBUG = True
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

class ProductionConfig(Config):
    DEBUG = False
    CORS_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '').split(',')
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    @property
    def SECRET_KEY(self):
        secret = os.environ.get('SECRET_KEY')
        if not secret:
            raise ValueError('SECRET_KEY must be set in production environment')
        return secret

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
