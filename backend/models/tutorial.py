from database import db
from datetime import datetime
import enum

class TutorialStatus(enum.Enum):
    teaching_in_progress = 'teaching_in_progress'
    teaching_done = 'teaching_done'
    practicing = 'practicing'
    completed = 'completed'

class Tutorial(db.Model):
    __tablename__ = 'tutorials'

    tutorial_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    category_id = db.Column(db.BigInteger, nullable=False)  # No FK in Phase 1
    slug = db.Column(db.String(100), unique=True, nullable=False)
    title_en = db.Column(db.String(200), nullable=False)
    title_zh = db.Column(db.String(200), nullable=False)
    description_en = db.Column(db.Text, nullable=True)
    description_zh = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.Integer, nullable=False, default=1)
    is_published = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, nullable=False, default=0)

    xp_teaching = db.Column(db.Integer, nullable=False, default=10)
    xp_practice_base = db.Column(db.Integer, nullable=False, default=20)
    xp_perfect_bonus = db.Column(db.Integer, nullable=False, default=10)

    graph_layer = db.Column(db.Integer, nullable=False, default=0)
    graph_branch = db.Column(db.String(50), nullable=False, default='main')
    graph_horizontal_index = db.Column(db.Integer, nullable=False, default=0)

    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    progress = db.relationship('UserTutorialProgress', backref='tutorial', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('ix_tutorials_category_order', 'category_id', 'display_order'),
        db.Index('ix_tutorials_published', 'is_published'),
    )

    def __repr__(self):
        return f'<Tutorial {self.slug}>'


class UserTutorialProgress(db.Model):
    __tablename__ = 'user_tutorial_progress'

    progress_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)

    teaching_completed = db.Column(db.Boolean, default=False)
    teaching_completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    best_score = db.Column(db.Integer, nullable=True)
    best_correct_count = db.Column(db.Integer, nullable=True)
    total_questions = db.Column(db.Integer, nullable=True)
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
    )

    def __repr__(self):
        return f'<UserTutorialProgress user={self.user_id} tutorial={self.tutorial_id}>'
