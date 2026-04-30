import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-do-not-use-in-production'
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = ['http://localhost:5173']
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 465))
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'True').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_USERNAME')
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

    @classmethod
    def init_app(cls, app):
        pass

class DevelopmentConfig(Config):
    DEBUG = True
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_DOMAIN = os.environ.get('SESSION_COOKIE_DOMAIN') or '.code-pulse.cc'
    ENV = 'production'

    SECRET_KEY = os.environ.get('SECRET_KEY')
    CORS_ORIGINS = [o for o in os.environ.get('ALLOWED_ORIGINS', '').split(',') if o.strip()]

    @classmethod
    def init_app(cls, app):
        super().init_app(app)
        required = {
            'SECRET_KEY': cls.SECRET_KEY,
            'ALLOWED_ORIGINS': cls.CORS_ORIGINS,
            'DATABASE_URL': os.environ.get('DATABASE_URL'),
            'GOOGLE_CLIENT_ID': cls.GOOGLE_CLIENT_ID,
            'GOOGLE_CLIENT_SECRET': cls.GOOGLE_CLIENT_SECRET,
        }
        missing = [k for k, v in required.items() if not v]
        if missing:
            raise ValueError(f'Missing required environment variables: {", ".join(missing)}')

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False
    WTF_CSRF_ENABLED = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
