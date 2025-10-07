from database import db
from flask_login import UserMixin
from datetime import datetime
import bcrypt
import uuid

class User(UserMixin, db.Model):
    """用戶模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.set_password(password)
    
    def set_password(self, password):
        """設置密碼（加密）"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """驗證密碼"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def update_last_login(self):
        """更新最後登入時間"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self):
        """轉換為字典格式"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }
    
    @staticmethod
    def find_by_username(username):
        """根據用戶名查找用戶"""
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def find_by_email(email):
        """根據信箱查找用戶"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_username_or_email(identifier):
        """根據用戶名或信箱查找用戶"""
        return User.query.filter(
            (User.username == identifier) | (User.email == identifier)
        ).first()
    
    def __repr__(self):
        return f'<User {self.username}>'