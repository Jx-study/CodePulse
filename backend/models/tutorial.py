from database import db
from datetime import datetime
import enum


class TutorialStatus(enum.Enum):
    teaching_in_progress = 'teaching_in_progress'
    teaching_done = 'teaching_done'
    practicing = 'practicing'
    completed = 'completed'


class AlgorithmCategory(db.Model):
    __tablename__ = 'algorithm_categories'

    category_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    slug = db.Column(db.String(50), unique=True, nullable=False)
    icon = db.Column(db.String(50), nullable=True)
    color_theme = db.Column(db.String(20), nullable=True)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    translations = db.relationship('AlgorithmCategoryTranslation', backref='category', cascade='all, delete-orphan')
    tutorials = db.relationship('Tutorial', foreign_keys='Tutorial.category_id', backref='category')

    def __repr__(self):
        return f'<AlgorithmCategory {self.slug}>'


class AlgorithmCategoryTranslation(db.Model):
    __tablename__ = 'algorithm_category_translations'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    category_id = db.Column(db.BigInteger, db.ForeignKey('algorithm_categories.category_id', ondelete='CASCADE'), nullable=False)
    language_code = db.Column(db.String(10), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('category_id', 'language_code', name='uq_category_translation'),
        db.Index('ix_algo_cat_trans_category_id', 'category_id'),
    )

    def __repr__(self):
        return f'<AlgorithmCategoryTranslation {self.category_id}:{self.language_code}>'


class Tutorial(db.Model):
    __tablename__ = 'tutorials'

    tutorial_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    category_id = db.Column(db.BigInteger, db.ForeignKey('algorithm_categories.category_id', ondelete='RESTRICT'), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    difficulty = db.Column(db.Integer, nullable=False, default=1)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    time_complexity = db.Column(db.String(50), nullable=True)
    space_complexity = db.Column(db.String(50), nullable=True)
    implementation_key = db.Column(db.String(100), nullable=True)
    practice_enabled = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, nullable=False, default=0)

    xp_teaching = db.Column(db.Integer, nullable=False, default=10)
    xp_practice_base = db.Column(db.Integer, nullable=False, default=20)
    xp_perfect_bonus = db.Column(db.Integer, nullable=False, default=10)

    graph_layer = db.Column(db.Integer, nullable=False, default=0)
    graph_branch = db.Column(db.String(50), nullable=False, default='main')
    graph_horizontal_index = db.Column(db.Integer, nullable=False, default=0)

    path_type = db.Column(db.String(20), nullable=False, default='main')
    branch_label = db.Column(db.String(50), nullable=True)
    path_color_theme = db.Column(db.String(20), nullable=True)
    portal_target_category_id = db.Column(db.BigInteger, db.ForeignKey('algorithm_categories.category_id', ondelete='SET NULL'), nullable=True)

    prerequisite_type = db.Column(db.String(10), nullable=False, default='NONE')

    homepage_image = db.Column(db.String(200), nullable=True)
    homepage_translation_key = db.Column(db.String(100), nullable=True)
    show_on_homepage = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    translations = db.relationship('TutorialTranslation', backref='tutorial', cascade='all, delete-orphan')
    prerequisites = db.relationship('TutorialPrerequisite', foreign_keys='TutorialPrerequisite.tutorial_id', backref='tutorial', cascade='all, delete-orphan')
    suggestions = db.relationship('TutorialSuggestion', foreign_keys='TutorialSuggestion.tutorial_id', backref='tutorial', cascade='all, delete-orphan')
    progress = db.relationship('UserTutorialProgress', backref='tutorial', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('ix_tutorials_category_id', 'category_id'),
        db.Index('ix_tutorials_slug', 'slug'),
        db.Index('ix_tutorials_category_order', 'category_id', 'display_order'),
        db.Index('ix_tutorials_category_graph', 'category_id', 'graph_layer', 'graph_branch'),
        db.Index('ix_tutorials_published', 'is_published'),
    )

    def __repr__(self):
        return f'<Tutorial {self.slug}>'


class TutorialTranslation(db.Model):
    __tablename__ = 'tutorial_translations'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)
    language_code = db.Column(db.String(10), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    learning_objectives = db.Column(db.JSON, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('tutorial_id', 'language_code', name='uq_tutorial_translation'),
        db.Index('ix_tutorial_translations_tutorial_id', 'tutorial_id'),
    )

    def __repr__(self):
        return f'<TutorialTranslation {self.tutorial_id}:{self.language_code}>'


class TutorialPrerequisite(db.Model):
    __tablename__ = 'tutorial_prerequisites'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)
    prerequisite_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('tutorial_id', 'prerequisite_id', name='uq_tutorial_prerequisite'),
        db.Index('ix_tutorial_prerequisites_tutorial_id', 'tutorial_id'),
        db.Index('ix_tutorial_prerequisites_prereq_id', 'prerequisite_id'),
    )

    def __repr__(self):
        return f'<TutorialPrerequisite {self.tutorial_id} requires {self.prerequisite_id}>'


class TutorialSuggestion(db.Model):
    __tablename__ = 'tutorial_suggestions'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)
    suggested_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('tutorial_id', 'suggested_id', name='uq_tutorial_suggestion'),
        db.Index('ix_tutorial_suggestions_tutorial_id', 'tutorial_id'),
    )

    def __repr__(self):
        return f'<TutorialSuggestion {self.tutorial_id} suggests {self.suggested_id}>'


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
