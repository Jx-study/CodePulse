from database import db
from datetime import datetime, timezone, date
import enum

class UserRole(enum.Enum):
    user = 'user'
    admin = 'admin'
    
class Theme(enum.Enum):
    light = 'light'
    dark = 'dark'
    system = 'system'
    
class Language(enum.Enum):
    en = 'en'
    zh_TW = 'zh-TW'

class ProviderType(enum.Enum):
    local = 'local'
    google = 'google'
    github = 'github'

class VerificationPurpose(enum.Enum):
    registration = 'registration'
    password_reset = 'password_reset'

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    username = db.Column(db.String(15), unique=True, nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.user)
    theme = db.Column(db.Enum(Theme), default=Theme.system)
    language = db.Column(db.Enum(Language), default=Language.en)
    timezone = db.Column(db.String(50), nullable=False, default='UTC')

    total_xp = db.Column(db.Integer, nullable=False, default=0)
    current_streak = db.Column(db.Integer, nullable=False, default=0)
    longest_streak = db.Column(db.Integer, nullable=False, default=0)
    last_login_date = db.Column(db.Date, nullable=True)

    skill_rating = db.Column(db.Float, nullable=False, default=1000.0)
    skill_tier = db.Column(db.Integer, nullable=False, default=1)

    deleted_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    identities = db.relationship('UserIdentity', backref='user', cascade='all, delete-orphan')
    tokens = db.relationship('UserToken', backref='user', cascade='all, delete-orphan')
    login_streaks = db.relationship('UserLoginStreak', backref='user', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'username': self.username,
            'display_name': self.display_name,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'role': self.role.value,
            'theme': self.theme.value if self.theme else None,
            'language': self.language.value if self.language else None,
            'total_xp': self.total_xp,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'skill_rating': self.skill_rating,
            'skill_tier': self.skill_tier,
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
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

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
    family_id = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.Index('ix_user_tokens_user_id', 'user_id'),
        db.Index('ix_user_tokens_hash', 'token_hash'),
        db.Index('ix_user_tokens_user_active', 'user_id', 'is_revoked', 'expires_at'),
    )

    def __repr__(self):
        return f'<UserToken user={self.user_id}>'

class EmailVerification(db.Model):
    __tablename__ = 'email_verifications'

    verification_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), nullable=False)
    code_hash = db.Column(db.String(255), nullable=False)
    purpose = db.Column(db.Enum(VerificationPurpose), nullable=False, default=VerificationPurpose.registration)
    extra_data = db.Column('metadata', db.JSON, nullable=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    is_used = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        db.Index('ix_email_verifications_email', 'email'),
        db.Index('ix_email_verifications_expires_at', 'expires_at'),
        db.Index('ix_email_verifications_email_created', 'email', 'created_at'),
    )

    def __repr__(self):
        return f'<EmailVerification {self.email} {self.purpose.value}>'


class UserLoginStreak(db.Model):
    __tablename__ = 'user_login_streaks'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    login_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'login_date', name='uq_user_login_date'),
        db.Index('ix_user_login_streaks_user_id', 'user_id'),
        db.Index('ix_user_login_streaks_date', 'login_date'),
    )

    def __repr__(self):
        return f'<UserLoginStreak user={self.user_id} date={self.login_date}>'
