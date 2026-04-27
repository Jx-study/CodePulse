"""
Unit tests for call_gemini().
The google-genai SDK is fully mocked — no real network calls.
"""
import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

SCHEMA = {"type": "object"}
PROMPT = "analyze this"


def _mock_response(text: str) -> SimpleNamespace:
    return SimpleNamespace(text=text)


@pytest.fixture(autouse=True)
def set_api_key(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")


def _make_sdk_mocks():
    """Return (genai_mock, types_mock, ClientError, ServerError) tuple."""
    genai_mock = MagicMock()
    types_mock = MagicMock()

    class ClientError(Exception):
        pass

    class ServerError(Exception):
        pass

    return genai_mock, types_mock, ClientError, ServerError


def _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
    return patch.dict(
        "sys.modules",
        {
            "google": MagicMock(genai=genai_mock),
            "google.genai": genai_mock,
            "google.genai.types": types_mock,
            "google.genai.errors": MagicMock(
                ClientError=ClientError, ServerError=ServerError
            ),
        },
    )


class TestSuccessPath:
    def test_returns_parsed_dict_on_success(self):
        genai_mock, types_mock, ClientError, ServerError = _make_sdk_mocks()
        payload = {"detected_algorithm": "bubble_sort", "time_complexity": "O(n²)", "summary": {"purpose": "x", "feedback": "y"}}
        genai_mock.Client.return_value.models.generate_content.return_value = _mock_response(json.dumps(payload))

        with _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
            from importlib import reload
            import services.gemini_analysis.client as mod
            reload(mod)
            result = mod.call_gemini(PROMPT, SCHEMA)

        assert result == payload
        assert genai_mock.Client.return_value.models.generate_content.call_count == 1


class TestRetryBehaviour:
    def test_server_error_first_attempt_then_success(self):
        genai_mock, types_mock, ClientError, ServerError = _make_sdk_mocks()
        payload = {"detected_algorithm": "linear_search", "time_complexity": "O(n)", "summary": {"purpose": "x", "feedback": "y"}}
        genai_mock.Client.return_value.models.generate_content.side_effect = [
            ServerError("500"),
            _mock_response(json.dumps(payload)),
        ]

        with _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
            from importlib import reload
            import services.gemini_analysis.client as mod
            reload(mod)
            with patch.object(mod.time, "sleep"):
                result = mod.call_gemini(PROMPT, SCHEMA)

        assert result == payload
        assert genai_mock.Client.return_value.models.generate_content.call_count == 2

    def test_server_error_both_attempts_returns_api_error(self):
        genai_mock, types_mock, ClientError, ServerError = _make_sdk_mocks()
        genai_mock.Client.return_value.models.generate_content.side_effect = [
            ServerError("500"),
            ServerError("500"),
        ]

        with _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
            from importlib import reload
            import services.gemini_analysis.client as mod
            reload(mod)
            with patch.object(mod.time, "sleep"):
                result = mod.call_gemini(PROMPT, SCHEMA)

        assert result == "api_error"

    def test_timeout_first_attempt_then_success(self):
        genai_mock, types_mock, ClientError, ServerError = _make_sdk_mocks()
        payload = {"detected_algorithm": "binary_search", "time_complexity": "O(log n)", "summary": {"purpose": "x", "feedback": "y"}}
        genai_mock.Client.return_value.models.generate_content.side_effect = [
            TimeoutError("timed out"),
            _mock_response(json.dumps(payload)),
        ]

        with _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
            from importlib import reload
            import services.gemini_analysis.client as mod
            reload(mod)
            with patch.object(mod.time, "sleep"):
                result = mod.call_gemini(PROMPT, SCHEMA)

        assert result == payload

    def test_timeout_both_attempts_returns_api_error(self):
        genai_mock, types_mock, ClientError, ServerError = _make_sdk_mocks()
        genai_mock.Client.return_value.models.generate_content.side_effect = [
            TimeoutError(),
            TimeoutError(),
        ]

        with _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
            from importlib import reload
            import services.gemini_analysis.client as mod
            reload(mod)
            with patch.object(mod.time, "sleep"):
                result = mod.call_gemini(PROMPT, SCHEMA)

        assert result == "api_error"


class TestNoRetryErrors:
    def test_json_decode_error_returns_parse_error_no_retry(self):
        genai_mock, types_mock, ClientError, ServerError = _make_sdk_mocks()
        genai_mock.Client.return_value.models.generate_content.return_value = _mock_response("not json {{{")

        with _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
            from importlib import reload
            import services.gemini_analysis.client as mod
            reload(mod)
            result = mod.call_gemini(PROMPT, SCHEMA)

        assert result == "parse_error"
        assert genai_mock.Client.return_value.models.generate_content.call_count == 1

    def test_client_error_no_retry(self):
        genai_mock, types_mock, ClientError, ServerError = _make_sdk_mocks()
        genai_mock.Client.return_value.models.generate_content.side_effect = ClientError("403")

        with _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
            from importlib import reload
            import services.gemini_analysis.client as mod
            reload(mod)
            result = mod.call_gemini(PROMPT, SCHEMA)

        assert result == "api_error"
        assert genai_mock.Client.return_value.models.generate_content.call_count == 1


class TestMissingApiKey:
    def test_missing_api_key_returns_api_error(self, monkeypatch):
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)
        genai_mock, types_mock, ClientError, ServerError = _make_sdk_mocks()

        with _patch_sdk(genai_mock, types_mock, ClientError, ServerError):
            from importlib import reload
            import services.gemini_analysis.client as mod
            reload(mod)
            result = mod.call_gemini(PROMPT, SCHEMA)

        assert result == "api_error"
        genai_mock.Client.return_value.models.generate_content.assert_not_called()
