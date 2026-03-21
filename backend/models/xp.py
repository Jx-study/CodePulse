from database import db
from datetime import datetime, timezone
import enum


class XpSourceType(enum.Enum):
    teaching_complete = 'teaching_complete'
    practice_pass = 'practice_pass'
    practice_perfect = 'practice_perfect'
    achievement_unlock = 'achievement_unlock'
    login_streak = 'login_streak'


class AchievementCategory(enum.Enum):
    learning = 'learning'
    practice = 'practice'
    streak = 'streak'
    milestone = 'milestone'


class AchievementConditionType(enum.Enum):
    tutorials_completed = 'tutorials_completed'
    category_completed = 'category_completed'
    perfect_score = 'perfect_score'
    login_streak = 'login_streak'
    xp_milestone = 'xp_milestone'
    skill_tier_reached = 'skill_tier_reached'


class XpEvent(db.Model):
    __tablename__ = 'xp_events'

    xp_event_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    source_type = db.Column(db.Enum(XpSourceType), nullable=False)
    source_id = db.Column(db.BigInteger, nullable=True)
    xp_amount = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.Index('ix_xp_events_user_id', 'user_id'),
        db.Index('ix_xp_events_source_type', 'source_type'),
        db.Index('ix_xp_events_created_at', 'created_at'),
        # Partial unique indexes must be created manually via migration:
        # CREATE UNIQUE INDEX ux_xp_teaching ON xp_events (user_id, source_id) WHERE source_type = 'teaching_complete';
        # CREATE UNIQUE INDEX ux_xp_practice_pass ON xp_events (user_id, source_id) WHERE source_type = 'practice_pass';
        # CREATE UNIQUE INDEX ux_xp_practice_perfect ON xp_events (user_id, source_id) WHERE source_type = 'practice_perfect';
        # CREATE UNIQUE INDEX ux_xp_achievement ON xp_events (user_id, source_id) WHERE source_type = 'achievement_unlock';
    )

    def __repr__(self):
        return f'<XpEvent {self.xp_event_id} user={self.user_id} type={self.source_type} xp={self.xp_amount}>'


class AchievementDefinition(db.Model):
    __tablename__ = 'achievement_definitions'

    achievement_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(100), nullable=True)
    category = db.Column(db.Enum(AchievementCategory), nullable=False)
    condition_type = db.Column(db.Enum(AchievementConditionType), nullable=False)
    condition_value = db.Column(db.JSON, nullable=False)
    # e.g. {"count": 1} or {"days": 7} or {"tier": 4}
    points = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    translations = db.relationship('AchievementTranslation', backref='achievement', cascade='all, delete-orphan')
    user_achievements = db.relationship('UserAchievement', backref='achievement', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('ix_achievement_definitions_slug', 'slug'),
        db.Index('ix_achievement_definitions_category', 'category'),
        db.Index('ix_achievement_definitions_active', 'is_active'),
    )

    def __repr__(self):
        return f'<AchievementDefinition {self.slug}>'


class AchievementTranslation(db.Model):
    __tablename__ = 'achievement_translations'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    achievement_id = db.Column(db.BigInteger, db.ForeignKey('achievement_definitions.achievement_id', ondelete='CASCADE'), nullable=False)
    language_code = db.Column(db.String(10), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('achievement_id', 'language_code', name='uq_achievement_translation'),
        db.Index('ix_achievement_translations_achievement_id', 'achievement_id'),
    )

    def __repr__(self):
        return f'<AchievementTranslation {self.achievement_id}:{self.language_code}>'


class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    achievement_id = db.Column(db.BigInteger, db.ForeignKey('achievement_definitions.achievement_id', ondelete='CASCADE'), nullable=False)
    unlocked_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'achievement_id', name='uq_user_achievement'),
        db.Index('ix_user_achievements_user_id', 'user_id'),
        db.Index('ix_user_achievements_unlocked_at', 'unlocked_at'),
    )

    def __repr__(self):
        return f'<UserAchievement user={self.user_id} achievement={self.achievement_id}>'
