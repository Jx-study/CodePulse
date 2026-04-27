RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "detected_algorithm": {
            "type": "string",
            "description": (
                "Algorithm name in snake_case, e.g., 'bubble_sort', 'binary_search'. "
                "Use 'unknown' if cannot determine."
            ),
        },
        "time_complexity": {
            "type": "string",
            "description": (
                "Big-O notation, e.g., 'O(n)', 'O(n log n)', 'O(n²)'. "
                "Use 'unknown' if cannot determine."
            ),
        },
        "summary": {
            "type": "object",
            "properties": {
                "purpose": {
                    "type": "string",
                    "description": (
                        "Concise Traditional Chinese (繁體中文) explanation of what this code does. "
                        "1-2 sentences."
                    ),
                },
                "feedback": {
                    "type": "string",
                    "description": (
                        "Traditional Chinese (繁體中文) feedback. "
                        "If code has issues or can be optimized, point them out kindly. "
                        "If code is well-written, praise it."
                    ),
                },
            },
            "required": ["purpose", "feedback"],
        },
    },
    "required": ["detected_algorithm", "time_complexity", "summary"],
}

_PROMPT_TEMPLATE = """\
You are a programming tutor analyzing a student's Python code.

Analyze the following code and respond in JSON format with three fields:
1. `detected_algorithm`: identify the algorithm if it matches a known pattern (snake_case name); otherwise use "unknown"
2. `time_complexity`: estimate the worst-case time complexity in Big-O notation; use "unknown" if you cannot determine
3. `summary`:
   - `purpose`: explain what this code does in Traditional Chinese (繁體中文), 1-2 sentences
   - `feedback`: in Traditional Chinese (繁體中文), provide friendly tutor-style feedback. If there are issues or optimization opportunities, point them out kindly. If the code is well-written, praise the student's good work.

Code:
```python
{code}
```
"""


def build_prompt(code: str) -> str:
    return _PROMPT_TEMPLATE.format(code=code)
