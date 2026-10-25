"""levels.json 的 hasPractice 必須與 seeds/questions 的題庫一致。"""
import importlib
import json
import pathlib

BACKEND = pathlib.Path(__file__).resolve().parent.parent
LEVELS_JSON = BACKEND.parent / "frontend" / "src" / "data" / "levels" / "levels.json"
QUESTIONS_DIR = BACKEND / "seeds" / "questions"
SEED_QUESTIONS = BACKEND / "seeds" / "seed_questions.py"


def _bank_slugs():
    slugs = {}
    for path in QUESTIONS_DIR.glob("*.py"):
        if path.name == "__init__.py":
            continue
        module = importlib.import_module(f"seeds.questions.{path.stem}")
        slugs[module.DATA["slug"]] = path.stem
    return slugs


def _levels():
    return json.loads(LEVELS_JSON.read_text(encoding="utf-8"))["levels"]


def test_levels_with_practice_have_a_question_bank():
    banks = _bank_slugs()
    missing = [
        lv["id"] for lv in _levels()
        if lv["isDeveloped"]
        and lv["pathMetadata"]["pathType"] != "portal"
        and lv.get("hasPractice", True)
        and lv["id"] not in banks
    ]
    assert not missing, f"hasPractice 未關閉但沒有題庫: {missing}"


def test_levels_without_practice_have_no_question_bank():
    banks = _bank_slugs()
    stale = [lv["id"] for lv in _levels() if lv.get("hasPractice", True) is False and lv["id"] in banks]
    assert not stale, f"hasPractice=false 卻仍有題庫: {stale}"


def test_every_question_bank_is_registered_for_seeding():
    text = SEED_QUESTIONS.read_text(encoding="utf-8")
    unregistered = [
        stem for stem in _bank_slugs().values()
        if f"from seeds.questions import {stem}\n" not in text
    ]
    assert not unregistered, f"題庫未登錄到 seed_questions.py: {unregistered}"


def test_every_level_is_seeded_as_a_tutorial_with_matching_category_and_difficulty():
    from seeds.seed_tutorials import CATEGORIES, TUTORIALS

    seeded = {slug: (category, difficulty) for slug, category, difficulty in TUTORIALS}
    categories = json.loads(LEVELS_JSON.read_text(encoding="utf-8"))["categories"]
    problems = []
    for level in _levels():
        expected = seeded.get(level["id"])
        if expected is None:
            problems.append(f"{level['id']}: missing from seed_tutorials.TUTORIALS")
        elif expected != (level["category"], level["difficulty"]):
            problems.append(f"{level['id']}: seed has {expected}, levels.json has {(level['category'], level['difficulty'])}")
    missing_categories = [c for c in categories if c not in CATEGORIES]
    assert not problems, problems
    assert not missing_categories, f"categories missing from seed_tutorials.CATEGORIES: {missing_categories}"
