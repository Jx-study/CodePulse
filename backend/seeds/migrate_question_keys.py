"""
一次性遷移腳本：將 seed data 的 question_key / group_key 填入現有 DB 行。

對應方式：按 display_order 位置把 seed 的 "id" 貼到 DB 行，並做「內容比對」——
比對 DB 行的 zh-TW stem/title 是否對得上 seed 的 title，對不上就標 [MISMATCH] + abort。
這道防線用來揪出「seed 改過順序 / 增刪題導致 display_order 錯位」的情形，避免把 key 貼錯行。
注意：若 seed 只是改了題目文字（位置沒錯），也會報 MISMATCH（保守設計，寧可誤報）；
這種情況需人工確認後再決定是否 --apply。

執行方式（在 server 上）：
    cd ~/projects/CodePulse/backend
    source venv/bin/activate
    SKIP_ML_WARMUP=1 FLASK_ENV=production python seeds/migrate_question_keys.py          # 預覽（dry run）
    SKIP_ML_WARMUP=1 FLASK_ENV=production python seeds/migrate_question_keys.py --apply  # 實際寫入
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database import db
from models.tutorial import Tutorial
from models.question import Question, QuestionGroup

from seeds.questions import (
    array, linked_list, stack, queue, binary_tree, bst, heap, graph, trie,
    bubble_sort, selection_sort, insertion_sort, quick_sort, merge_sort,
    binary_search, prefix_sum, sliding_window, bfs, dfs, dijkstra, knapsack,
)

ALL_MODULES = [
    array, linked_list, stack, queue, binary_tree, bst, heap, graph, trie,
    bubble_sort, selection_sort, insertion_sort, merge_sort, quick_sort,
    binary_search, prefix_sum, sliding_window, bfs, dfs, dijkstra, knapsack,
]

DRY_RUN = "--apply" not in sys.argv


def migrate_tutorial(quiz_data: dict) -> bool:
    """回傳 False 代表遇到 WARN，上層應 abort。"""
    slug = quiz_data["slug"]
    tutorial = Tutorial.query.filter_by(slug=slug).first()
    if not tutorial:
        print(f"  [SKIP] '{slug}' not found")
        return True

    tutorial_id = tutorial.tutorial_id
    seed_groups = quiz_data.get("groups", [])
    seed_questions = quiz_data["questions"]
    has_warn = False

    # 內容比對用：取某行 zh-TW 翻譯文字（找不到回傳 None）
    def _zh(translations, field):
        for t in translations:
            if t.language_code == "zh-TW":
                return getattr(t, field, None)
        return None

    # 正規化後比對兩段文字是否「實質相同」（容忍前後空白差異）
    def _matches(db_text, seed_text):
        if db_text is None or seed_text is None:
            return False
        return db_text.strip() == seed_text.strip()

    # ── groups：按 display_order 對應 ──────────────────────────────────────
    db_groups = sorted(
        QuestionGroup.query.filter_by(tutorial_id=tutorial_id).all(),
        key=lambda g: g.display_order,
    )
    for i, g_data in enumerate(seed_groups):
        if i >= len(db_groups):
            print(f"    [WARN] '{slug}' group index {i} ('{g_data['id']}') 無對應 DB 行")
            has_warn = True
            continue
        g = db_groups[i]
        if g.group_key and g.group_key != g_data["id"]:
            print(f"    [WARN] '{slug}' group #{i} key 衝突：DB='{g.group_key}' seed='{g_data['id']}'")
            has_warn = True
            continue

        # 內容比對：DB group 的 title 是否對得上 seed
        db_title = _zh(g.translations, "title")
        seed_title = g_data.get("translations", {}).get("zh-TW", {}).get("title")
        if not _matches(db_title, seed_title):
            print(
                f"    [MISMATCH] '{slug}' group #{i} (id={g.group_id}) 內容對不上 seed='{g_data['id']}'\n"
                f"        DB  : {(db_title or '')[:40]!r}\n"
                f"        seed: {(seed_title or '')[:40]!r}"
            )
            has_warn = True
            continue

        print(f"    group [{i}] {g.group_id} → group_key='{g_data['id']}'  ✓內容相符")
        if not DRY_RUN:
            g.group_key = g_data["id"]

    # ── questions：按 display_order 對應 ──────────────────────────────────
    db_questions = sorted(
        Question.query.filter_by(tutorial_id=tutorial_id).all(),
        key=lambda q: q.display_order,
    )
    for i, q_data in enumerate(seed_questions):
        if i >= len(db_questions):
            print(f"    [WARN] '{slug}' question index {i} ('{q_data['id']}') 無對應 DB 行")
            has_warn = True
            continue
        q = db_questions[i]
        if q.question_key and q.question_key != q_data["id"]:
            print(f"    [WARN] '{slug}' question #{i} key 衝突：DB='{q.question_key}' seed='{q_data['id']}'")
            has_warn = True
            continue

        # 內容比對：DB 行的 stem 是否對得上 seed 的 title（揪出 display_order 錯位）
        db_stem = _zh(q.translations, "stem")
        seed_title = q_data.get("translations", {}).get("zh-TW", {}).get("title")
        if not _matches(db_stem, seed_title):
            print(
                f"    [MISMATCH] '{slug}' question #{i} (id={q.question_id}) 內容對不上 seed='{q_data['id']}'\n"
                f"        DB  : {(db_stem or '')[:40]!r}\n"
                f"        seed: {(seed_title or '')[:40]!r}"
            )
            has_warn = True
            continue

        print(f"    question [{i}] {q.question_id} → question_key='{q_data['id']}'  ✓內容相符")
        if not DRY_RUN:
            q.question_key = q_data["id"]

    if has_warn:
        print(f"  [WARN] '{slug}' 有衝突，{'dry run 繼續但' if DRY_RUN else '已 rollback，'}需人工確認。")
        return False

    if not DRY_RUN:
        db.session.commit()
        print(f"  [OK] '{slug}' committed.")
    else:
        print(f"  [DRY RUN] '{slug}' OK — 加上 --apply 才實際寫入。")
    return True


def run():
    flask_env = os.environ.get("FLASK_ENV", "production")
    app = create_app(flask_env)
    with app.app_context():
        mode = "DRY RUN" if DRY_RUN else "APPLY"
        print(f"=== Migrate question keys ({mode}, env={flask_env}) ===")
        all_ok = True
        for module in ALL_MODULES:
            ok = migrate_tutorial(module.DATA)
            if not ok:
                all_ok = False
                if not DRY_RUN:
                    db.session.rollback()
                    print("=== ABORTED: rollback all changes ===")
                    sys.exit(1)

        if DRY_RUN:
            print(f"\nSAFE_TO_APPLY={'True' if all_ok else 'False'}")
        print("=== Done ===")


if __name__ == "__main__":
    run()
