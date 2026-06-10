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
from services.visual_validator import validate_visual

# ── 註冊所有 tutorial 的題庫模組 ─────────────────────────────────────────────
from seeds.questions import array
from seeds.questions import linked_list
from seeds.questions import stack
from seeds.questions import queue
from seeds.questions import binary_tree
from seeds.questions import bst
from seeds.questions import heap
from seeds.questions import graph
from seeds.questions import trie
from seeds.questions import bubble_sort
from seeds.questions import selection_sort
from seeds.questions import insertion_sort
from seeds.questions import quick_sort
from seeds.questions import merge_sort
from seeds.questions import binary_search
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
    heap,
    graph,
    trie,
    bubble_sort,
    selection_sort,
    insertion_sort,
    merge_sort,
    quick_sort,
    binary_search,
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

def derive_category(base_rating: float) -> str:
    if base_rating < 1000:
        return CATEGORY_MAP['basic']
    elif base_rating < 1400:
        return CATEGORY_MAP['application']
    return CATEGORY_MAP['complexity']

def seed_tutorial(quiz_data: dict):
    slug = quiz_data["slug"]
    tutorial = Tutorial.query.filter_by(slug=slug).first()
    if not tutorial:
        print(f"  [SKIP] Tutorial '{slug}' not found in DB — skipping.")
        return

    tutorial_id = tutorial.tutorial_id

    # 護欄：若 DB 還有 NULL question_key，代表 backfill 尚未執行，禁止 seed
    null_q = Question.query.filter_by(tutorial_id=tutorial_id, question_key=None).count()
    null_g = QuestionGroup.query.filter_by(tutorial_id=tutorial_id, group_key=None).count()
    if null_q > 0 or null_g > 0:
        raise RuntimeError(
            f"[ABORT] '{slug}' 有 {null_q} 題 / {null_g} 組的 question_key 為 NULL。"
            " 請先執行 seeds/migrate_question_keys.py --apply 再跑 seed。"
        )

    # ── 處理 groups（upsert by group_key）──────────────────────────────────
    seeded_group_keys = set()
    group_map: dict[str, QuestionGroup] = {}

    for i, g_data in enumerate(quiz_data.get("groups", [])):
        visual_type = g_data.get("visual_type", "none")
        visual_data = g_data.get("visual_data")
        validate_visual(visual_type, visual_data)

        g_key = g_data["id"]
        seeded_group_keys.add(g_key)

        group = QuestionGroup.query.filter_by(
            tutorial_id=tutorial_id, group_key=g_key
        ).first()

        if group is None:
            group = QuestionGroup(tutorial_id=tutorial_id, group_key=g_key)
            db.session.add(group)

        group.code = g_data.get("code")
        group.language = g_data.get("language")
        group.visual_type = visual_type
        group.visual_data = visual_data
        group.display_order = i
        db.session.flush()

        # upsert translations
        existing_trans = {t.language_code: t for t in group.translations}
        for lang_code, t in g_data["translations"].items():
            if lang_code in existing_trans:
                tr = existing_trans[lang_code]
                tr.title = t["title"]
                tr.description = t.get("description")
                tr.visual_alt = t.get("visual_alt")
            else:
                db.session.add(QuestionGroupTranslation(
                    group_id=group.group_id,
                    language_code=lang_code,
                    title=t["title"],
                    description=t.get("description"),
                    visual_alt=t.get("visual_alt"),
                ))

        group_map[g_key] = group

    # ── 處理 questions（upsert by question_key）────────────────────────────
    seeded_question_keys = set()

    for order, q_data in enumerate(quiz_data["questions"]):
        q_key = q_data["id"]
        seeded_question_keys.add(q_key)

        group_id = None
        if "groupId" in q_data:
            g = group_map.get(q_data["groupId"])
            if g:
                group_id = g.group_id

        base = float(q_data.get("baseRating", 1200))
        q_visual_type = q_data.get("visual_type", "none")
        q_visual_data = q_data.get("visual_data")
        validate_visual(q_visual_type, q_visual_data)

        question = Question.query.filter_by(
            tutorial_id=tutorial_id, question_key=q_key
        ).first()

        if question is None:
            question = Question(tutorial_id=tutorial_id, question_key=q_key)
            db.session.add(question)

        question.group_id = group_id
        question.question_type = TYPE_MAP[q_data["type"]]
        question.category = derive_category(base)
        question.base_rating = base
        question.difficulty_rating = calc_difficulty_rating(base, tutorial.difficulty)
        question.correct_answer = _serialize_answer(q_data["correctAnswer"])
        question.display_order = order
        question.code = q_data.get("code")
        question.language = q_data.get("language")
        question.visual_type = q_visual_type
        question.visual_data = q_visual_data
        question.is_active = True
        db.session.flush()

        # upsert translations
        existing_trans = {t.language_code: t for t in question.translations}
        for lang_code, t in q_data["translations"].items():
            if lang_code in existing_trans:
                tr = existing_trans[lang_code]
                tr.stem = t["title"]
                tr.explanation = t.get("explanation")
                tr.options = t.get("options", [])
                tr.visual_alt = t.get("visual_alt")
            else:
                db.session.add(QuestionTranslation(
                    question_id=question.question_id,
                    language_code=lang_code,
                    stem=t["title"],
                    explanation=t.get("explanation"),
                    options=t.get("options", []),
                    visual_alt=t.get("visual_alt"),
                ))

    # ── 將 seed 中消失的題目標為 inactive（不刪除，保護 attempt_answers FK）
    for q in Question.query.filter_by(tutorial_id=tutorial_id).all():
        if q.question_key and q.question_key not in seeded_question_keys:
            q.is_active = False

    db.session.commit()
    new_count = len(seeded_question_keys)
    grp_count = len(seeded_group_keys)
    print(f"  [OK] '{slug}': {new_count} questions, {grp_count} groups upserted.")


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
