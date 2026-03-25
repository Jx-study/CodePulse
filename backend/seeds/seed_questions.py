import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database import db
from models.tutorial import Tutorial
from models.question import (
    Question, QuestionTranslation,
    QuestionGroup, QuestionGroupTranslation,
    QuestionType, QuestionCategory,
)
from models.practice import AttemptAnswer

# ── 註冊所有 tutorial 的題庫模組 ─────────────────────────────────────────────
from seeds.questions import array
from seeds.questions import linked_list
from seeds.questions import stack
from seeds.questions import queue
from seeds.questions import binary_tree
from seeds.questions import bst
from seeds.questions import graph
from seeds.questions import binary_search
from seeds.questions import bubble_sort
from seeds.questions import insertion_sort
from seeds.questions import selection_sort
from seeds.questions import prefix_sum
from seeds.questions import sliding_window
from seeds.questions import bfs
from seeds.questions import dfs
from seeds.questions import dijkstra
from seeds.questions import knapsack

ALL_MODULES = [
    array,
    linked_list,
    stack,
    queue,
    binary_tree,
    bst,
    graph,
    binary_search,
    bubble_sort,
    insertion_sort,
    selection_sort,
    prefix_sum,
    sliding_window,
    bfs,
    dfs,
    dijkstra,
    knapsack,
]

# ── 型別對應 ──────────────────────────────────────────────────────────────────
TYPE_MAP = {
    "single-choice": QuestionType.single_choice,
    "multiple-choice": QuestionType.multiple_choice,
    "true-false": QuestionType.true_false,
    "predict-line": QuestionType.predict_line,
    "fill-code": QuestionType.fill_code,
}

CATEGORY_MAP = {
    "basic": QuestionCategory.basic,
    "application": QuestionCategory.application,
    "complexity": QuestionCategory.complexity,
}

# 常数 = 0.16
TUTORIAL_DIFF_MULTIPLIER = {1: 0.92, 2: 0.96, 3: 1.00, 4: 1.04, 5: 1.08}


def calc_difficulty_rating(base_rating: float, tutorial_difficulty: int) -> float:
    m = TUTORIAL_DIFF_MULTIPLIER[tutorial_difficulty]
    return round(base_rating * m, 2)


def _serialize_answer(answer) -> str:
    if isinstance(answer, list):
        return json.dumps(answer, ensure_ascii=False)
    return answer


def seed_tutorial(quiz_data: dict):
    slug = quiz_data["slug"]
    tutorial = Tutorial.query.filter_by(slug=slug).first()
    if not tutorial:
        print(f"  [SKIP] Tutorial '{slug}' not found in DB — skipping.")
        return

    tutorial_id = tutorial.tutorial_id

    # 清空舊資料：先刪 attempt_answers（RESTRICT FK），再刪 questions，最後刪 groups
    question_ids = [q.question_id for q in Question.query.filter_by(tutorial_id=tutorial_id).all()]
    if question_ids:
        AttemptAnswer.query.filter(AttemptAnswer.question_id.in_(question_ids)).delete(synchronize_session=False)
    for q in Question.query.filter_by(tutorial_id=tutorial_id).all():
        db.session.delete(q)
    for g in QuestionGroup.query.filter_by(tutorial_id=tutorial_id).all():
        db.session.delete(g)
    db.session.flush()

    # 建立 group id -> DB group 的對應
    group_map: dict[str, QuestionGroup] = {}
    for i, g_data in enumerate(quiz_data.get("groups", [])):
        group = QuestionGroup(
            tutorial_id=tutorial_id,
            code=g_data.get("code"),
            language=g_data.get("language"),
            display_order=i,
        )
        db.session.add(group)
        db.session.flush()

        # 格式：g_data["translations"] = {"zh-TW": {...}, "en": {...}}
        for lang_code, t in g_data["translations"].items():
            db.session.add(QuestionGroupTranslation(
                group_id=group.group_id,
                language_code=lang_code,
                title=t["title"],
                description=t.get("description"),
            ))
        group_map[g_data["id"]] = group

    # 建立 question + translation
    for order, q_data in enumerate(quiz_data["questions"]):
        group_id = None
        if "groupId" in q_data:
            g = group_map.get(q_data["groupId"])
            if g:
                group_id = g.group_id

        base = float(q_data.get("baseRating", 1200))
        question = Question(
            tutorial_id=tutorial_id,
            group_id=group_id,
            question_type=TYPE_MAP[q_data["type"]],
            category=CATEGORY_MAP[q_data["category"]],
            base_rating=base,
            difficulty_rating=calc_difficulty_rating(base, tutorial.difficulty),
            correct_answer=_serialize_answer(q_data["correctAnswer"]),
            display_order=order,
            code=q_data.get("code"),
            language=q_data.get("language"),
            is_active=True,
        )
        db.session.add(question)
        db.session.flush()

        # 格式：q_data["translations"] = {"zh-TW": {...}, "en": {...}}
        # 每個 translation 需包含 title、options，以及可選的 explanation
        for lang_code, t in q_data["translations"].items():
            db.session.add(QuestionTranslation(
                question_id=question.question_id,
                language_code=lang_code,
                stem=t["title"],
                explanation=t.get("explanation"),
                options=t.get("options", []),
            ))

    db.session.commit()
    print(f"  [OK] '{slug}': {len(quiz_data['questions'])} questions, {len(quiz_data.get('groups', []))} groups seeded.")


def run(target_slugs: list[str] | None = None):
    app = create_app("development")
    with app.app_context():
        print("=== Seeding questions ===")
        for module in ALL_MODULES:
            data = module.DATA
            if target_slugs and data["slug"] not in target_slugs:
                continue
            seed_tutorial(data)
        print("=== Done ===")


if __name__ == "__main__":
    slugs = sys.argv[1:] or None
    run(slugs)
