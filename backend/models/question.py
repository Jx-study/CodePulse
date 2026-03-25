from database import db, BigIntPK
from datetime import datetime, timezone
import enum


class QuestionType(enum.Enum):
    single_choice = 'single-choice'
    multiple_choice = 'multiple-choice'
    true_false = 'true-false'
    predict_line = 'predict-line'
    fill_code = 'fill-code'


class QuestionCategory(enum.Enum):
    basic = 'basic'
    application = 'application'
    complexity = 'complexity'


class QuestionGroup(db.Model):
    __tablename__ = 'question_groups'

    group_id = db.Column(BigIntPK, primary_key=True, autoincrement=True)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)
    code = db.Column(db.Text, nullable=True)
    language = db.Column(db.String(50), nullable=True)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    translations = db.relationship('QuestionGroupTranslation', backref='group', cascade='all, delete-orphan')
    questions = db.relationship('Question', backref='group', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('ix_question_groups_tutorial_id', 'tutorial_id'),
        db.Index('ix_question_groups_tutorial_order', 'tutorial_id', 'display_order'),
    )

    def __repr__(self):
        return f'<QuestionGroup {self.group_id} tutorial={self.tutorial_id}>'


class QuestionGroupTranslation(db.Model):
    __tablename__ = 'question_group_translations'

    id = db.Column(BigIntPK, primary_key=True, autoincrement=True)
    group_id = db.Column(db.BigInteger, db.ForeignKey('question_groups.group_id', ondelete='CASCADE'), nullable=False)
    language_code = db.Column(db.String(10), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('group_id', 'language_code', name='uq_question_group_translation'),
        db.Index('ix_qgt_group_id', 'group_id'),
    )

    def __repr__(self):
        return f'<QuestionGroupTranslation {self.group_id}:{self.language_code}>'


class Question(db.Model):
    __tablename__ = 'questions'

    question_id = db.Column(BigIntPK, primary_key=True, autoincrement=True)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)
    group_id = db.Column(db.BigInteger, db.ForeignKey('question_groups.group_id', ondelete='SET NULL'), nullable=True)
    question_type = db.Column(db.Enum(QuestionType), nullable=False)
    category = db.Column(db.Enum(QuestionCategory), nullable=False, default=QuestionCategory.basic)

    code = db.Column(db.Text, nullable=True)
    language = db.Column(db.String(50), nullable=True)

    base_rating = db.Column(db.Float, nullable=False, default=1200.0)
    difficulty_rating = db.Column(db.Float, nullable=False, default=1200.0)
    times_answered = db.Column(db.Integer, nullable=False, default=0)
    times_correct = db.Column(db.Integer, nullable=False, default=0)

    display_order = db.Column(db.Integer, nullable=False, default=0)
    correct_answer = db.Column(db.String(500), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    translations = db.relationship('QuestionTranslation', backref='question', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('ix_questions_tutorial_id', 'tutorial_id'),
        db.Index('ix_questions_group_id', 'group_id'),
        db.Index('ix_questions_tutorial_order', 'tutorial_id', 'display_order'),
        db.Index('ix_questions_type', 'question_type'),
        db.Index('ix_questions_difficulty', 'difficulty_rating'),
    )

    def to_dict(self, include_answer=False):
        data = {
            'question_id': self.question_id,
            'question_type': self.question_type.value,
            'category': self.category.value,
            'code': self.code,
            'language': self.language,
            'base_rating': self.base_rating,
            'group_id': self.group_id,
        }
        if include_answer:
            data['correct_answer'] = self.correct_answer
        return data

    def __repr__(self):
        return f'<Question {self.question_id} type={self.question_type}>'


class QuestionTranslation(db.Model):
    __tablename__ = 'question_translations'

    id = db.Column(BigIntPK, primary_key=True, autoincrement=True)
    question_id = db.Column(db.BigInteger, db.ForeignKey('questions.question_id', ondelete='CASCADE'), nullable=False)
    language_code = db.Column(db.String(10), nullable=False)
    stem = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    options = db.Column(db.JSON, nullable=True)
    # format: [{"key": "A", "text": "..."}, ...]

    __table_args__ = (
        db.UniqueConstraint('question_id', 'language_code', name='uq_question_translation'),
        db.Index('ix_question_translations_question_id', 'question_id'),
    )

    def __repr__(self):
        return f'<QuestionTranslation {self.question_id}:{self.language_code}>'
