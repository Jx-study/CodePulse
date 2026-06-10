"""
一次性開發工具：把 seed 題庫的 id 統一順號化。

規則：
    - questions：按 display_order（DATA["questions"] 陣列順序）→ {slug}-q{N}
    - groups   ：按陣列順序                              → {slug}-group-{N}
    - 所有 question 的 groupId 引用同步換成新的 group id

做法：用每個模組的 DATA 結構建「舊 id → 新 id」mapping，再對 .py 源碼做
精準的字串替換（只動 "id": "..." / "groupId": "..." 這種 dict key 寫法，
不會碰到 options 裡的 {"id": "A"} 行內寫法）。

執行：
    python scripts/renumber_seed_ids.py            # 預覽（dry run，印 mapping，不寫檔）
    python scripts/renumber_seed_ids.py --apply    # 實際寫回 .py 檔
"""
import os
import re
import sys

os.environ.setdefault("SKIP_ML_WARMUP", "1")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from seeds import seed_questions as sq

DRY_RUN = "--apply" not in sys.argv
SEEDS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "seeds", "questions")


def build_mapping(data: dict) -> dict[str, str]:
    """回傳 {舊 id: 新 id}，涵蓋 groups 與 questions。"""
    slug = data["slug"]
    mapping: dict[str, str] = {}
    for i, g in enumerate(data.get("groups", []), start=1):
        mapping[g["id"]] = f"{slug}-group-{i}"
    for i, q in enumerate(data["questions"], start=1):
        mapping[q["id"]] = f"{slug}-q{i}"
    return mapping


def rewrite_source(src: str, mapping: dict[str, str]) -> tuple[str, int]:
    """把源碼裡的 "id": "舊" 和 "groupId": "舊" 換成新值。回傳 (新源碼, 替換次數)。"""
    count = 0

    def repl(m: re.Match) -> str:
        nonlocal count
        prefix, key, old = m.group(1), m.group(2), m.group(3)
        if old in mapping:
            count += 1
            return f'{prefix}"{key}": "{mapping[old]}"'
        return m.group(0)

    # 只匹配「行首縮排 + "id"/"groupId": "值"」，排除 options 裡的 {"id": "A"} 行內寫法
    pattern = re.compile(r'^(\s*)"(id|groupId)":\s*"([^"]+)"', re.M)
    new_src = pattern.sub(repl, src)
    return new_src, count


def process_module(module) -> bool:
    data = module.DATA
    slug = data["slug"]
    mapping = build_mapping(data)

    # 模組檔名：module.__name__ 形如 seeds.questions.array
    fname = module.__name__.split(".")[-1] + ".py"
    path = os.path.join(SEEDS_DIR, fname)
    if not os.path.exists(path):
        print(f"  [SKIP] {slug}: 找不到源碼 {path}")
        return True

    src = open(path, encoding="utf-8").read()
    new_src, count = rewrite_source(src, mapping)

    changed = [(old, new) for old, new in mapping.items() if old != new]
    print(f"\n=== {slug} ({fname}) ===  {len(changed)} 個 id 變更，源碼替換 {count} 處")
    for old, new in list(mapping.items())[:6]:
        flag = "" if old != new else "  (no change)"
        print(f"    {old:28} → {new}{flag}")
    if len(mapping) > 6:
        print(f"    ... 共 {len(mapping)} 個")

    # 替換次數應 >= 變更的 id 數（groupId 引用會讓次數更多）
    if not DRY_RUN:
        open(path, "w", encoding="utf-8").write(new_src)
        print(f"  [WRITTEN] {path}")
    return True


def main():
    mode = "DRY RUN" if DRY_RUN else "APPLY"
    print(f"=== Renumber seed ids ({mode}) ===")
    for module in sq.ALL_MODULES:
        process_module(module)
    if DRY_RUN:
        print("\n預覽完成 — 加上 --apply 才實際寫回檔案。")
    print("=== Done ===")


if __name__ == "__main__":
    main()
