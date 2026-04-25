# algo_identification

MiniLM-based algorithm identification service.

## Usage

```python
from services.algo_identification import identify, warmup

# At app startup (non-blocking background load):
warmup()

# In request handler:
result = identify(user_code)
# result.algo_name  — identified algorithm, or None if confidence < 0.45
# result.score      — cosine similarity score
# result.top_raw    — raw top-1 label before threshold filtering
```

## Supported Algorithms

`bubble_sort`, `selection_sort`, `insertion_sort`, `linear_search`, `binary_search`, `merge_sort`, `quick_sort`

## Threshold

Default: **0.45** — set in `similarity.py::THRESHOLD`. Below this, `algo_name` is `None`.

## Rebuilding the Embeddings

If you add a new algorithm or variant, update `scripts/build_embeddings.py`, then:

```bash
cd backend
python scripts/build_embeddings.py
git add services/algo_identification/embeddings/
git commit -m "Chore: rebuild MiniLM reference embeddings"
```

## Adding a New Algorithm

1. Add variants to `REFERENCE_IMPLEMENTATIONS` in `scripts/build_embeddings.py`
2. Rebuild embeddings (see above)
3. Add the algorithm to `EXPECTED_STRUCTURE` in `routes/analyze.py` if it has a Level 1 template

---

# algo_identification（中文說明）

基於 MiniLM 的演算法辨識服務。

## 使用方式

```python
from services.algo_identification import identify, warmup

# 應用程式啟動時（非阻塞背景載入）：
warmup()

# 在請求處理器中：
result = identify(user_code)
# result.algo_name  — 識別出的演算法名稱，若相似度低於 0.45 則為 None
# result.score      — 餘弦相似度分數
# result.top_raw    — 套用閾值篩選前的原始最高分標籤
```

## 支援的演算法

`bubble_sort`（泡沫排序）、`selection_sort`（選擇排序）、`insertion_sort`（插入排序）、`linear_search`（線性搜尋）、`binary_search`（二分搜尋）、`merge_sort`（合併排序）、`quick_sort`（快速排序）

## 辨識閾值

預設值：**0.45**，定義於 `similarity.py::THRESHOLD`。低於此值時，`algo_name` 回傳 `None`。

## 重建嵌入向量

若新增演算法或變體，請更新 `scripts/build_embeddings.py`，再執行：

```bash
cd backend
python scripts/build_embeddings.py
git add services/algo_identification/embeddings/
git commit -m "Chore: rebuild MiniLM reference embeddings"
```

## 新增演算法步驟

1. 在 `scripts/build_embeddings.py` 的 `REFERENCE_IMPLEMENTATIONS` 中加入新的變體程式碼
2. 重建嵌入向量（見上方步驟）
3. 若該演算法有 Level 1 模板，同步更新 `routes/analyze.py` 的 `EXPECTED_STRUCTURE`
