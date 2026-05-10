"""
test_runner.py — runner.py 邊界情況、例外處理、安全測試

測試策略：
- 把 runner.py 當成 subprocess 執行（模擬 Docker 環境）
- 通過 CODE 環境變數傳 base64 編碼的用戶程式碼
- 讀取 stdout 解析 JSON，驗證行為

測試類別：
1. 輸入驗證（缺少 CODE、無效 base64、空/空白/純註解、非 Python 語法）
2. 用戶程式碼例外（SyntaxError、RuntimeError、RecursionError 等）
3. 安全沙箱限制（import、open、eval 等）
4. stdout 污染防護（用戶 print 不污染 JSON）
5. cfg_builder 失敗降級
6. 輸出格式完整性
"""

import base64
import json
import os
import subprocess
import sys

import pytest

RUNNER_PATH = os.path.join(os.path.dirname(__file__), "..", "docker", "runner.py")
SERVICES_PATH = os.path.join(os.path.dirname(__file__), "..", "services")


def run_runner(code: str | None, *, extra_env: dict | None = None) -> tuple[dict, int]:
    """
    執行 runner.py，傳入 code（自動 base64 編碼），回傳 (parsed_json, returncode)。
    code=None 表示不設 CODE 環境變數。
    """
    env = os.environ.copy()
    env["PYTHONPATH"] = SERVICES_PATH

    if code is not None:
        env["CODE"] = base64.b64encode(code.encode()).decode()
    else:
        env.pop("CODE", None)

    if extra_env:
        env.update(extra_env)

    result = subprocess.run(
        [sys.executable, RUNNER_PATH],
        capture_output=True,
        text=True,
        env=env,
        timeout=15,
    )

    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        data = {"_raw": result.stdout, "_stderr": result.stderr}

    return data, result.returncode


SIMPLE_CODE = """
def add(a, b):
    return a + b

result = add(1, 2)
"""


# ---------------------------------------------------------------------------
# 1. 輸入驗證
# ---------------------------------------------------------------------------

class TestInputValidation:
    def test_missing_code_env_returns_error(self):
        """CODE 環境變數缺失 → error JSON + exit 1"""
        data, rc = run_runner(None)
        assert "error" in data
        assert rc == 1

    def test_invalid_base64_returns_error(self):
        """CODE 是無效 base64 → error JSON + exit 1"""
        env = os.environ.copy()
        env["PYTHONPATH"] = SERVICES_PATH
        env["CODE"] = "!!!not-valid-base64!!!"
        result = subprocess.run(
            [sys.executable, RUNNER_PATH],
            capture_output=True, text=True, env=env, timeout=15,
        )
        data = json.loads(result.stdout)
        assert "error" in data
        assert result.returncode == 1

    def test_empty_string_returns_error(self):
        """空字串 → error JSON（無可執行程式碼）"""
        data, rc = run_runner("")
        assert "error" in data
        assert rc == 1

    def test_whitespace_only_returns_error(self):
        """只有空白 → error JSON"""
        data, rc = run_runner("   \n\t\n  ")
        assert "error" in data
        assert rc == 1

    def test_newlines_only_returns_error(self):
        """只有換行 → error JSON"""
        data, rc = run_runner("\n\n\n")
        assert "error" in data
        assert rc == 1

    def test_comment_only_returns_error(self):
        """只有 # 註解 → error JSON"""
        data, rc = run_runner("# this is a comment\n# another comment")
        assert "error" in data
        assert rc == 1

    def test_comment_with_whitespace_returns_error(self):
        """空白 + 純註解 → error JSON"""
        data, rc = run_runner("\n  # comment\n\n  # another\n")
        assert "error" in data
        assert rc == 1

    def test_javascript_syntax_returns_error(self):
        """JavaScript 語法 → SyntaxError → error JSON"""
        data, rc = run_runner("const x = 1;\nconsole.log(x);")
        assert "error" in data
        assert rc == 1

    def test_sql_syntax_returns_error(self):
        """SQL 語法 → SyntaxError → error JSON"""
        data, rc = run_runner("SELECT * FROM users WHERE id = 1;")
        assert "error" in data
        assert rc == 1

    def test_plain_text_returns_error(self):
        """純文字（非程式語言）→ SyntaxError → error JSON"""
        data, rc = run_runner("hello world this is not code")
        assert "error" in data
        assert rc == 1


# ---------------------------------------------------------------------------
# 2. 用戶程式碼例外
# ---------------------------------------------------------------------------

class TestUserCodeExceptions:
    def test_syntax_error_returns_error(self):
        """Python SyntaxError → error JSON + exit 1，不 crash"""
        data, rc = run_runner("def foo(:\n    pass")
        assert "error" in data
        assert rc == 1

    def test_zero_division_returns_error(self):
        """ZeroDivisionError → error JSON + exit 1"""
        data, rc = run_runner("x = 1 / 0")
        assert "error" in data
        assert rc == 1

    def test_name_error_returns_error(self):
        """NameError（未定義變數）→ error JSON + exit 1"""
        data, rc = run_runner("print(undefined_variable)")
        assert "error" in data
        assert rc == 1

    def test_type_error_returns_error(self):
        """TypeError → error JSON + exit 1"""
        data, rc = run_runner("x = 1 + 'string'")
        assert "error" in data
        assert rc == 1

    def test_recursion_error_returns_error(self):
        """無限遞迴 → RecursionError → error JSON，不 crash"""
        code = """
def infinite():
    return infinite()

infinite()
"""
        data, rc = run_runner(code)
        assert "error" in data
        assert rc == 1

    def test_runtime_error_returns_error(self):
        """一般 RuntimeError → error JSON + exit 1"""
        data, rc = run_runner("raise RuntimeError('boom')")
        assert "error" in data
        assert rc == 1

    def test_index_error_returns_error(self):
        """IndexError → error JSON + exit 1"""
        data, rc = run_runner("x = [][999]")
        assert "error" in data
        assert rc == 1


# ---------------------------------------------------------------------------
# 3. 安全沙箱限制
# ---------------------------------------------------------------------------

class TestSandboxSecurity:
    def test_import_os_is_blocked(self):
        """import os → 沙箱無 __import__ → error JSON"""
        data, rc = run_runner("import os\nos.listdir('/')")
        assert "error" in data
        assert rc == 1

    def test_import_subprocess_is_blocked(self):
        """import subprocess → error JSON"""
        data, rc = run_runner("import subprocess\nsubprocess.run(['ls'])")
        assert "error" in data
        assert rc == 1

    def test_import_sys_is_blocked(self):
        """import sys → error JSON"""
        data, rc = run_runner("import sys\nsys.exit(0)")
        assert "error" in data
        assert rc == 1

    def test_dunder_import_is_blocked(self):
        """__import__('os') → error JSON"""
        data, rc = run_runner("__import__('os').system('echo pwned')")
        assert "error" in data
        assert rc == 1

    def test_open_is_blocked(self):
        """open() → 沙箱無 open → error JSON"""
        data, rc = run_runner("f = open('/etc/passwd', 'r')")
        assert "error" in data
        assert rc == 1

    def test_eval_is_blocked(self):
        """eval() → 沙箱無 eval → error JSON"""
        data, rc = run_runner("eval('__import__(\"os\")')")
        assert "error" in data
        assert rc == 1

    def test_exec_is_blocked(self):
        """exec() → 沙箱無 exec → error JSON"""
        data, rc = run_runner("exec('import os')")
        assert "error" in data
        assert rc == 1

    def test_globals_escape_attempt_is_blocked(self):
        """嘗試透過 globals() 取得 __builtins__ → error 或無效"""
        code = """
g = globals()
builtins = g.get('__builtins__', {})
imp = builtins.get('__import__') if isinstance(builtins, dict) else getattr(builtins, '__import__', None)
if imp:
    imp('os').system('echo pwned')
"""
        data, rc = run_runner(code)
        # 應該 error 或至少不執行系統指令
        assert "error" in data or rc == 1


# ---------------------------------------------------------------------------
# 4. stdout 污染防護
# ---------------------------------------------------------------------------

class TestStdoutProtection:
    def test_user_print_does_not_corrupt_json(self):
        """用戶 print() 不污染 stdout，輸出仍是合法 JSON"""
        code = """
print("hello world")
print("another line")
x = 42
"""
        data, rc = run_runner(code)
        # stdout 必須是合法 JSON（run_runner 能成功 parse）
        assert "_raw" not in data
        assert rc == 0

    def test_user_print_appears_in_stdout_events(self):
        """用戶 print() 的內容出現在 stdout_events，而非直接 stdout"""
        code = 'print("captured")'
        data, rc = run_runner(code)
        assert rc == 0
        assert "stdout_events" in data
        texts = [ev["text"] for ev in data["stdout_events"]]
        assert any("captured" in t for t in texts)

    def test_multiple_prints_all_captured(self):
        """多個 print() 全部都在 stdout_events"""
        code = """
print("first")
print("second")
print("third")
"""
        data, rc = run_runner(code)
        assert rc == 0
        assert len(data["stdout_events"]) == 3


# ---------------------------------------------------------------------------
# 5. cfg_builder 失敗降級
# ---------------------------------------------------------------------------

class TestCfgFallback:
    def test_cfg_failure_still_returns_trace(self):
        """即使 cfg_builder 失敗，trace 仍然正常輸出"""
        # 用合法但 cfg_builder 可能難以處理的 code
        code = """
x = [i**2 for i in range(5)]
"""
        data, rc = run_runner(code)
        assert rc == 0
        assert "trace" in data
        assert "cfg_graph" in data  # 即使是空 {}


# ---------------------------------------------------------------------------
# 6. 輸出格式完整性
# ---------------------------------------------------------------------------

class TestOutputFormat:
    def test_successful_run_has_all_required_keys(self):
        """正常執行時，輸出包含所有必要 key"""
        data, rc = run_runner(SIMPLE_CODE)
        assert rc == 0
        required_keys = {"trace", "call_graph", "cfg_graph", "is_truncated", "step_count", "stdout_events"}
        assert required_keys.issubset(data.keys())

    def test_call_graph_has_required_structure(self):
        """call_graph 包含 nodes、edges、root"""
        data, rc = run_runner(SIMPLE_CODE)
        assert rc == 0
        cg = data["call_graph"]
        assert "nodes" in cg
        assert "edges" in cg
        assert "root" in cg

    def test_trace_events_have_required_fields(self):
        """每個 trace event 包含 tag、local_vars、dataSnapshot、meta"""
        data, rc = run_runner(SIMPLE_CODE)
        assert rc == 0
        for ev in data["trace"]:
            assert "tag" in ev
            assert "local_vars" in ev
            assert "dataSnapshot" in ev
            assert "meta" in ev

    def test_error_output_is_always_valid_json(self):
        """即使發生錯誤，stdout 永遠是合法 JSON"""
        # 各種錯誤情境都測一遍
        cases = [
            None,           # 缺 CODE
            "",             # 空字串
            "1/0",          # RuntimeError
            "import os",    # 沙箱限制
        ]
        for code in cases:
            data, _ = run_runner(code)
            assert "_raw" not in data, f"Invalid JSON for code={code!r}: {data.get('_raw')}"

    def test_is_truncated_false_for_short_code(self):
        """短程式碼不觸發截斷"""
        data, rc = run_runner(SIMPLE_CODE)
        assert rc == 0
        assert data["is_truncated"] is False

    def test_step_count_matches_trace_length(self):
        """step_count 與 trace 陣列長度一致"""
        data, rc = run_runner(SIMPLE_CODE)
        assert rc == 0
        assert data["step_count"] == len(data["trace"])
