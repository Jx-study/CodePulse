# gemini_analysis

Thin wrapper around the Gemini API that provides structured code analysis.

## What it does

Single call `analyze(code)` returns:
- `detected_algorithm` — snake_case algorithm name, or `None`
- `time_complexity` — Big-O string, or `None`
- `summary.purpose` — Traditional Chinese explanation of the code
- `summary.feedback` — Traditional Chinese tutor-style feedback
- `is_fallback` — `True` when rate-limited or API unavailable
- `fallback_reason` — `"rpm_exhausted"` | `"rpd_exhausted"` | `"api_error"` | `"parse_error"`

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google AI Studio API key |
| `GEMINI_MODEL` | No | `gemini-2.0-flash-lite` | Gemini model name |

Get an API key at https://aistudio.google.com/apikey (free tier: 15 RPM / 1500 RPD).

Add to `backend/.env`:
```
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash-lite
```

## Rate limiting

Built-in in-memory token bucket (single Flask process):

| Limit | Google cap | MVP threshold | Behaviour when exceeded |
|---|---|---|---|
| RPM | 15/min | 14 | Wait up to 30 s, then fallback |
| RPD | 500/day | 460 | Immediate fallback |

## Local smoke test

```bash
cd backend
GEMINI_API_KEY=AIza... python scripts/smoke_test_gemini.py
```

This calls the real API once and prints the raw result. **Not run in CI** — it consumes quota.

## Fallback behaviour (for pipeline integration reference)

When `is_fallback=True`, the calling pipeline should:
- Algorithm: use MiniLM result (if confidence ≥ 0.45), otherwise show "無法辨識"
- Time complexity: use AST == bigO agreed result, otherwise show "無法判斷"
- Summary: show static message "AI 解說暫時無法產生（系統忙碌中），請稍後重新分析以取得完整 AI 評語。"
