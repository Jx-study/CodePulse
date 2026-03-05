from database import db
from datetime import datetime, date
import enum

class UserRole(enum.Enum):
    user = 'user'
    admin = 'admin'

class ProviderType(enum.Enum):
    local = 'local'
    google = 'google'
    github = 'github'

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    display_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.user)
    theme = db.Column(db.String(20), default='system')
    language = db.Column(db.String(10), default='en')

    total_xp = db.Column(db.Integer, nullable=False, default=0)
    current_streak = db.Column(db.Integer, nullable=False, default=0)
    longest_streak = db.Column(db.Integer, nullable=False, default=0)
    last_login_date = db.Column(db.Date, nullable=True)

    deleted_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    identities = db.relationship('UserIdentity', backref='user', cascade='all, delete-orphan')
    progress = db.relationship('UserTutorialProgress', backref='user', cascade='all, delete-orphan')
    tokens = db.relationship('UserToken', backref='user', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'display_name': self.display_name,
            'email': self.email,
            'role': self.role.value,
            'total_xp': self.total_xp,
            'current_streak': self.current_streak,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<User {self.email}>'


class UserIdentity(db.Model):
    __tablename__ = 'user_identities'

    identity_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    provider = db.Column(db.Enum(ProviderType), nullable=False)
    provider_id = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('provider', 'provider_id', name='uq_identity_provider'),
        db.Index('ix_user_identities_user_id', 'user_id'),
    )

    def __repr__(self):
        return f'<UserIdentity {self.provider.value}:{self.provider_id}>'


class UserToken(db.Model):
    __tablename__ = 'user_tokens'

    token_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    token_hash = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    is_revoked = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        db.Index('ix_user_tokens_user_id', 'user_id'),
        db.Index('ix_user_tokens_hash', 'token_hash'),
        db.Index('ix_user_tokens_user_active', 'user_id', 'is_revoked', 'expires_at'),
    )

    def __repr__(self):
        return f'<UserToken user={self.user_id}>'
