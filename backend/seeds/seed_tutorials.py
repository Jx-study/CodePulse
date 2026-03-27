"""
seed_tutorials.py
=================
將 algorithm_categories 和 tutorials 匯入 DB。
資料來源需要與 frontend/src/data/levels/levels.json 同步維護。

策略：upsert（slug 已存在則更新，否則插入）。
不會刪除已移除的 tutorial，避免外鍵問題。

執行方式（在 backend/ 目錄下）：
    python seeds/seed_tutorials.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database import db
from models.tutorial import AlgorithmCategory, Tutorial

# levels.json 中有題目的 tutorial（practice_enabled=True）
PRACTICE_ENABLED_SLUGS = {
    "bubble-sort",
    "array",
}

# 與 frontend/src/data/levels/levels.json categories 同步
CATEGORIES = [
    "data-structures",
    "sorting",
    "searching",
    "recursive",
    "technique",
    "graph",
    "dp",
]

# 與 frontend/src/data/levels/levels.json levels 同步
# 欄位：(slug, category, difficulty, is_published)
TUTORIALS = [
    # data-structures
    ("array",               "data-structures", 1, True),
    ("linked-list",         "data-structures", 1, True),
    ("doubly-linked-list",  "data-structures", 2, False),
    ("stack",               "data-structures", 2, True),
    ("queue",               "data-structures", 2, True),
    ("binarytree",          "data-structures", 2, True),
    ("bst",                 "data-structures", 3, True),
    ("heap",                "data-structures", 3, False),
    ("graph",               "data-structures", 2, True),
    ("trie",                "data-structures", 3, False),
    ("portal-to-sorting",   "data-structures", 1, True),
    # sorting
    ("bubble-sort",         "sorting",         1, True),
    ("selection-sort",      "sorting",         1, True),
    ("insertion-sort",      "sorting",         1, True),
    ("merge-sort",          "sorting",         3, False),
    ("quick-sort",          "sorting",         3, False),
    ("portal-to-searching", "sorting",         1, True),
    # searching
    ("linear-search",       "searching",       1, False),
    ("binary-search",       "searching",       2, True),
    ("portal-to-recursive", "searching",       1, True),
    # recursive
    ("factorial",           "recursive",       1, False),
    ("fibonacci-recursive", "recursive",       2, False),
    ("merge-sort-recursive","recursive",       3, False),
    ("hanoi",               "recursive",       3, False),
    ("backtracking-intro",  "recursive",       3, False),
    ("quick-sort-recursive","recursive",       3, False),
    ("n-queens",            "recursive",       4, True),
    ("portal-to-technique", "recursive",       1, True),
    # technique
    ("prefix-sum",          "technique",       2, True),
    ("sliding-window",      "technique",       2, True),
    ("two-pointers",        "technique",       2, False),
    ("bit-mask",            "technique",       3, False),
    ("portal-to-graph",     "technique",       1, True),
    # graph
    ("bfs",                 "graph",           3, True),
    ("dfs",                 "graph",           3, True),
    ("topological-sort",    "graph",           3, False),
    ("union-find",          "graph",           3, False),
    ("dijkstra",            "graph",           4, True),
    ("astar",               "graph",           4, False),
    ("portal-to-dp",        "graph",           1, False),
    # dp
    ("dp-fibonacci",        "dp",              2, False),
    ("knapsack",            "dp",              3, True),
    ("lcs",                 "dp",              3, False),
]


def run():
    app = create_app("development")
    with app.app_context():
        print("=== Seeding categories ===")
        _seed_categories()

        print("=== Seeding tutorials ===")
        _seed_tutorials()

        print("=== Done ===")


def _seed_categories():
    for slug in CATEGORIES:
        cat = AlgorithmCategory.query.filter_by(slug=slug).first()
        if not cat:
            db.session.add(AlgorithmCategory(slug=slug))
            print(f"  [INSERT] category '{slug}'")
        else:
            print(f"  [SKIP]   category '{slug}' already exists")
    db.session.commit()


def _seed_tutorials():
    for slug, category_slug, difficulty, is_published in TUTORIALS:
        cat = AlgorithmCategory.query.filter_by(slug=category_slug).first()
        if not cat:
            print(f"  [SKIP] Tutorial '{slug}': category '{category_slug}' not found")
            continue

        tutorial = Tutorial.query.filter_by(slug=slug).first()
        practice_enabled = slug in PRACTICE_ENABLED_SLUGS

        if not tutorial:
            db.session.add(Tutorial(
                slug=slug,
                category_id=cat.category_id,
                difficulty=difficulty,
                practice_enabled=practice_enabled,
                is_published=is_published,
                xp_teaching=10,
                xp_practice_base=20,
                xp_perfect_bonus=10,
            ))
            print(f"  [INSERT] tutorial '{slug}' (practice_enabled={practice_enabled})")
        else:
            tutorial.difficulty = difficulty
            tutorial.practice_enabled = practice_enabled
            tutorial.is_published = is_published
            print(f"  [UPDATE] tutorial '{slug}'")

    db.session.commit()


if __name__ == "__main__":
    run()