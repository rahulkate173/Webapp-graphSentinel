"""
Explainer module — uses Groq LLM to generate explainable fraud-ring analysis.
"""

import json
import os
import httpx

from app.schemas import (
    PredictExplainableRequest,
    PredictExplainableResponse,
)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def _build_system_prompt() -> str:
    return (
        "You are a financial fraud analysis expert. "
        "You will receive structured data about a suspected fraud ring, "
        "including account details, transactions, and context. "
        "Your job is to analyse the data and return a JSON object with your assessment.\n\n"
        "RULES:\n"
        "1. Respond ONLY with valid JSON — no markdown fences, no commentary.\n"
        "2. The JSON must have exactly these top-level keys:\n"
        '   "ring_id", "risk_level", "confidence", "summary", '
        '   "key_factors", "key_accounts", "suspicious_patterns", "recommendations"\n'
        "3. risk_level must be one of: LOW, MEDIUM, HIGH, CRITICAL\n"
        "4. confidence must be a float between 0 and 1\n"
        "5. key_factors is a list of objects with keys: factor, impact, importance (float 0-1)\n"
        "6. key_accounts is a list of objects with keys: account_id, role, reason\n"
        "7. suspicious_patterns is a list of short pattern identifier strings\n"
        "8. recommendations is a list of actionable recommendation strings\n"
        "9. summary should be a concise 1-2 sentence overview of the fraud ring analysis\n"
    )


def _build_user_prompt(request: PredictExplainableRequest) -> str:
    data = request.model_dump()
    return (
        "Analyse the following suspected fraud ring data and provide your "
        "explainable risk assessment as JSON.\n\n"
        f"{json.dumps(data, indent=2)}"
    )


async def generate_explanation(
    request: PredictExplainableRequest,
    groq_api_key: str,
) -> PredictExplainableResponse:
    """
    Call Groq LLM to generate an explainable analysis for the given fraud ring data.

    Args:
        request: The validated explainable-prediction request.
        groq_api_key: Groq API key (read from env at call-time).

    Returns:
        PredictExplainableResponse parsed from the LLM's JSON output.

    Raises:
        ValueError: If the LLM response cannot be parsed into valid JSON.
        httpx.HTTPStatusError: If the Groq API returns an error status.
    """
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": _build_system_prompt()},
            {"role": "user", "content": _build_user_prompt(request)},
        ],
        "temperature": 0.3,
        "max_tokens": 1024,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(GROQ_API_URL, headers=headers, json=payload)
        response.raise_for_status()

    result = response.json()
    content = result["choices"][0]["message"]["content"]

    # Parse LLM output
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Groq returned invalid JSON: {e}\nRaw content: {content}")

    # Ensure ring_id matches the request
    parsed["ring_id"] = request.ring_id

    return PredictExplainableResponse(**parsed)
