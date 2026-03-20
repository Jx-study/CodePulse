from flask import Blueprint, jsonify, g, request
from datetime import datetime, timezone

from auth_utils import login_required
from database import db
from models.tutorial import Tutorial, UserTutorialProgress, TutorialStatus
from models.practice import LearningSession, PracticeAttempt, AttemptAnswer, SessionMode
from models.question import Question, QuestionTranslation, QuestionGroup, QuestionGroupTranslation
from models.xp import XpEvent, XpSourceType
from models.user import User

tutorials_bp = Blueprint('tutorials', __name__)


@tutorials_bp.route('/<slug>/questions', methods=['GET'])
@login_required
def get_tutorial_questions(slug):
    # Stub – full implementation in a later task
    return jsonify({'success': True, 'questions': []}), 200
