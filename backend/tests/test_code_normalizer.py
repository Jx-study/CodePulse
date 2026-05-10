import pytest
from services.code_normalizer import normalize_code


def test_removes_inline_comments():
    code = "x = 1  # this is a comment\ny = 2\n"
    result = normalize_code(code)
    assert "#" not in result
    assert "x = 1" in result
    assert "y = 2" in result


def test_removes_comment_only_lines():
    code = "# header comment\nx = 1\n# another comment\ny = 2\n"
    result = normalize_code(code)
    lines = [l for l in result.splitlines() if l.strip()]
    assert all(not l.strip().startswith("#") for l in lines)


def test_removes_docstrings_triple_double_quote():
    code = '"""This is a docstring."""\ndef foo():\n    """Another."""\n    return 1\n'
    result = normalize_code(code)
    assert '"""' not in result


def test_removes_docstrings_triple_single_quote():
    code = "'''Module docstring'''\nx = 1\n"
    result = normalize_code(code)
    assert "'''" not in result


def test_collapses_blank_lines():
    code = "x = 1\n\n\n\ny = 2\n"
    result = normalize_code(code)
    assert "\n\n\n" not in result


def test_strips_leading_trailing_whitespace():
    code = "   \n\nx = 1\n\n   "
    result = normalize_code(code)
    assert result == result.strip()


def test_same_code_different_comments_same_hash():
    import hashlib
    code_a = "def foo(x):\n    # sum\n    return x + 1\n"
    code_b = "def foo(x):\n    return x + 1\n"
    hash_a = hashlib.sha256(normalize_code(code_a).encode()).hexdigest()
    hash_b = hashlib.sha256(normalize_code(code_b).encode()).hexdigest()
    assert hash_a == hash_b


def test_same_code_extra_blank_lines_same_hash():
    import hashlib
    code_a = "def foo(x):\n    return x + 1\n"
    code_b = "def foo(x):\n\n\n    return x + 1\n\n"
    hash_a = hashlib.sha256(normalize_code(code_a).encode()).hexdigest()
    hash_b = hashlib.sha256(normalize_code(code_b).encode()).hexdigest()
    assert hash_a == hash_b


def test_different_logic_different_hash():
    import hashlib
    code_a = "x = 1\n"
    code_b = "x = 2\n"
    hash_a = hashlib.sha256(normalize_code(code_a).encode()).hexdigest()
    hash_b = hashlib.sha256(normalize_code(code_b).encode()).hexdigest()
    assert hash_a != hash_b


def test_string_literal_hash_not_removed():
    """字串裡的 # 不應被誤刪"""
    code = 'x = "hello # world"\n'
    result = normalize_code(code)
    assert '"hello # world"' in result


def test_empty_code_returns_empty():
    assert normalize_code("") == ""
    assert normalize_code("   \n  ") == ""
