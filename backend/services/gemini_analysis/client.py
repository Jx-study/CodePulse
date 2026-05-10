import json
import logging
import os
import time

logger = logging.getLogger(__name__)

CALL_TIMEOUT_SEC = 20
RETRY_INTERVAL_SEC = 1


def call_gemini(prompt: str, schema: dict) -> dict | str:
    """
    Call the Gemini API with JSON mode enabled.

    Returns a parsed dict on success, or a fallback_reason string on failure:
      "api_error"   — transient or unexpected SDK error
      "parse_error" — response was not valid JSON (not retried)
    """
    try:
        import httpx
        from google import genai
        from google.genai import types
        from google.genai.errors import ClientError, ServerError
    except ImportError:
        logger.error("google-genai SDK not installed")
        return "api_error"

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable is not set")
        return "api_error"

    model_name = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite-preview")
    client = genai.Client(api_key=api_key)
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        http_options=types.HttpOptions(timeout=CALL_TIMEOUT_SEC * 1000),
    )

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )
            return json.loads(response.text)
        except json.JSONDecodeError as exc:
            logger.error("Gemini returned invalid JSON: %s", exc)
            return "parse_error"
        except ServerError as exc:
            # 5xx — transient, retry once
            if attempt == 0:
                logger.warning("Gemini server error (attempt 1), retrying: %s", exc)
                time.sleep(RETRY_INTERVAL_SEC)
                continue
            logger.warning("Gemini server error after retry: %s", exc)
            return "api_error"
        except httpx.TimeoutException as exc:
            # httpx does not inherit Python's built-in TimeoutError
            if attempt == 0:
                logger.warning("Gemini timeout (attempt 1), retrying: %s", exc)
                time.sleep(RETRY_INTERVAL_SEC)
                continue
            logger.warning("Gemini timeout after retry: %s", exc)
            return "api_error"
        except ClientError as exc:
            # 4xx (auth, quota already exhausted, etc.) — do not retry
            logger.error("Gemini client error (not retrying): %s", exc)
            return "api_error"
        except Exception as exc:
            logger.error("Unexpected Gemini error: %s", exc)
            return "api_error"

    return "api_error"
