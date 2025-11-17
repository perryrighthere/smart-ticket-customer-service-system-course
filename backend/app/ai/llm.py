from __future__ import annotations

"""LLM client wrapper for Lesson 5.

Design goals:
- Prefer explicit LLM behaviour: if misconfigured, surface errors instead of silent fallbacks.
- Allow plugging in OpenAI-compatible endpoints (OpenAI / DeepSeek / local proxies).
- Allow per-request overrides from the frontend for teaching demos.
"""

from dataclasses import dataclass
from typing import List, Optional, Sequence, Tuple

import httpx

from app.core.config import get_settings
from app.db.models import Ticket


@dataclass
class LLMConfigOverride:
    """Optional per-request overrides for LLM configuration.

    These are primarily used for frontend demos so that learners can
    experiment with different providers without editing backend env vars.
    """

    provider: str | None = None
    base_url: str | None = None
    model: str | None = None
    api_key: str | None = None


def _build_prompt(ticket: Ticket, category: str, kb_snippets: List[str]) -> str:
    """Construct a concise English prompt for the assistant."""
    lines: List[str] = [
        "You are a helpful support agent.",
        "Draft a concise, polite reply to the user issue.",
        "",
        f"Ticket title: {ticket.title}",
        f"Ticket content: {ticket.content}",
        f"Predicted category: {category}",
    ]
    if kb_snippets:
        lines.append("")
        lines.append("Relevant knowledge base snippets:")
        for idx, snippet in enumerate(kb_snippets, start=1):
            lines.append(f"{idx}. {snippet}")
    lines.append("")
    lines.append("Reply in the same language as the ticket content.")
    return "\n".join(lines)


def _build_chat_prompt(
    query: str,
    kb_snippets: List[str],
    history: Sequence[Tuple[str, str]],
) -> str:
    """Construct a prompt for a short RAG-augmented conversation."""
    lines: List[str] = [
        "You are an expert customer support assistant.",
        "Your task is to answer the user's question based on the provided context.",
        "---",
        "INSTRUCTIONS:",
        "1. First, analyze the [User Question] and the [Knowledge Base Snippets].",
        "2. Determine if the snippets are relevant to the user's question.",
        "3. IF the snippets are relevant:",
        "   - Your answer MUST be based exclusively on the information in the snippets.",
        "   - For each piece of information you use, you MUST cite the source using the format `[Source X]`, where X is the snippet number.",
        "   - If the snippets do not contain enough information, state what you can answer and clarify that other information is not available in the knowledge base.",
        "4. IF the snippets are NOT relevant:",
        "   - State that the knowledge base does not contain relevant information.",
        "   - Then, provide a helpful answer based on your own general knowledge.",
        "   - DO NOT cite any sources in this case.",
        "5. Always reply in the same language as the [User Question].",
        "---",
        "EXAMPLE:",
        "[User Question]: How do I reset my password if the link expired?",
        "[Knowledge Base Snippets]:",
        "Snippet 1: To reset your password, go to the login page and click 'Forgot Password'.",
        "Snippet 2: Password reset links are valid for 24 hours. If a link expires, you must request a new one by repeating the 'Forgot Password' process.",
        "",
        "[Your Answer]:",
        "If your password reset link has expired, you need to request a new one [Source 2]. To do this, please go to the login page and click the 'Forgot Password' link again [Source 1].",
        "---",
    ]

    if history:
        lines.append("CONVERSATION HISTORY:")
        for role, content in history:
            prefix = "User" if role == "user" else "Assistant"
            lines.append(f"- {prefix}: {content}")
        lines.append("---")

    if kb_snippets:
        lines.append("KNOWLEDGE BASE SNIPPETS:")
        for idx, snippet in enumerate(kb_snippets, start=1):
            lines.append(f"Snippet {idx}: {snippet}")
        lines.append("---")

    lines.append(f"USER QUESTION:")
    lines.append(query)

    return "\n".join(lines)


def _call_openai_compatible_api(
    prompt: str,
    override: Optional[LLMConfigOverride] = None,
) -> str:
    """Call an OpenAI-compatible chat completion endpoint.

    If configuration is missing or the request fails, a descriptive exception is raised.
    """
    settings = get_settings()
    provider = (override.provider if override and override.provider else settings.llm_provider) or ""
    provider = provider.lower()

    if not provider:
        raise ValueError(
            "LLM provider not configured. Set LLM_PROVIDER in backend/.env or provide an override."
        )
    if provider == "local":
        raise ValueError(
            "LLM provider 'local' does not use an external model. "
            "Please configure a real provider (e.g. openai/deepseek/qwen) for this call."
        )
    if provider not in {"openai", "deepseek", "qwen"}:
        raise ValueError(f"Unsupported LLM provider '{provider}'.")

    api_key = None
    if override and override.api_key:
        api_key = override.api_key
    else:
        api_key = (
            settings.openai_api_key
            or settings.deepseek_api_key
            or settings.qwen_api_key
        )
    if not api_key:
        raise ValueError(
            f"API key not configured for LLM provider '{provider}'. "
            "Set the appropriate *_API_KEY in backend/.env or pass api_key in the override."
        )

    base_url = override.base_url if override and override.base_url else settings.llm_base_url
    if not base_url:
        base_url = "https://api.openai.com"
    model = override.model if override and override.model else settings.llm_model
    if not model:
        model = "gpt-3.5-turbo"

    try:
        with httpx.Client(base_url=base_url, timeout=10.0) as client:
            response = client.post(
                "/v1/chat/completions",
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful support agent."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                },
                headers={"Authorization": f"Bearer {api_key}"},
            )
        response.raise_for_status()
    except Exception as exc:  # pragma: no cover - network / provider specific
        raise RuntimeError(f"LLM request failed: {exc}") from exc

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("LLM returned no choices in response.")
    message = choices[0].get("message") or {}
    content = message.get("content")
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("LLM returned empty content.")
    return content.strip()


def generate_reply(
    ticket: Ticket,
    category: str,
    kb_snippets: List[str],
    override: Optional[LLMConfigOverride] = None,
) -> str:
    """Generate a draft reply using the configured LLM.

    If the LLM call fails or is misconfigured, an exception is raised.
    """
    prompt = _build_prompt(ticket, category, kb_snippets)
    return _call_openai_compatible_api(prompt, override=override)


def generate_chat_answer(
    query: str,
    kb_snippets: List[str],
    history: Sequence[Tuple[str, str]],
    override: Optional[LLMConfigOverride] = None,
) -> str:
    """Generate an answer for a free-form query using RAG and optional history.

    If the LLM call fails or is misconfigured, an exception is raised.
    """
    prompt = _build_chat_prompt(query, kb_snippets, history)
    return _call_openai_compatible_api(prompt, override=override)
