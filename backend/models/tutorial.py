from database import db, BigIntPK
from datetime import datetime
import enum


class TutorialStatus(enum.Enum):
    teaching_in_progress = 'teaching_in_progress'
    teaching_done = 'teaching_done'
    practicing = 'practicing'
    completed = 'completed'


class AlgorithmCategory(db.Model):
    __tablename__ = 'algorithm_categories'

    category_id = db.Column(BigIntPK, primary_key=True, autoincrement=True)
    slug = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    tutorials = db.relationship('Tutorial', foreign_keys='Tutorial.category_id', backref='category')

    def __repr__(self):
        return f'<AlgorithmCategory {self.slug}>'


class Tutorial(db.Model):
    __tablename__ = 'tutorials'

    tutorial_id = db.Column(BigIntPK, primary_key=True, autoincrement=True)
    category_id = db.Column(db.BigInteger, db.ForeignKey('algorithm_categories.category_id', ondelete='RESTRICT'), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    difficulty = db.Column(db.Integer, nullable=False, default=1)
    practice_enabled = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=False)

    xp_teaching = db.Column(db.Integer, nullable=False, default=10)
    xp_practice_base = db.Column(db.Integer, nullable=False, default=20)
    xp_perfect_bonus = db.Column(db.Integer, nullable=False, default=10)

    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    progress = db.relationship('UserTutorialProgress', backref='tutorial', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('ix_tutorials_category_id', 'category_id'),
        db.Index('ix_tutorials_slug', 'slug'),
        db.Index('ix_tutorials_published', 'is_published'),
    )

    def __repr__(self):
        return f'<Tutorial {self.slug}>'


class UserTutorialProgress(db.Model):
    __tablename__ = 'user_tutorial_progress'

    progress_id = db.Column(BigIntPK, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)

    teaching_completed = db.Column(db.Boolean, default=False)
    teaching_completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    best_score = db.Column(db.Integer, nullable=True)
    best_correct_count = db.Column(db.Integer, nullable=True)
    total_questions = db.Column(db.Integer, nullable=True)
    best_attempt_id = db.Column(db.BigInteger, db.ForeignKey('practice_attempts.attempt_id', ondelete='SET NULL'), nullable=True)
    best_time_seconds = db.Column(db.Integer, nullable=True)
    attempt_count = db.Column(db.Integer, default=0)
    practice_passed = db.Column(db.Boolean, default=False)
    practice_passed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    status = db.Column(db.Enum(TutorialStatus), default=TutorialStatus.teaching_in_progress)
    last_accessed_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'tutorial_id', name='uq_user_tutorial_progress'),
        db.Index('ix_utp_user_id', 'user_id'),
        db.Index('ix_utp_status', 'status'),
        db.Index('ix_utp_last_accessed', 'last_accessed_at'),
    )

    def __repr__(self):
        return f'<UserTutorialProgress user={self.user_id} tutorial={self.tutorial_id}>'
