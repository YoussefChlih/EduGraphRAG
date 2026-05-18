"""LLM client using LangChain with Groq (primary) and OpenAI (fallback)."""

from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel

from app.config import settings

DEFAULT_GROQ_MODEL = "llama-3.1-70b-versatile"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"


def get_llm(
    temperature: float = 0.1,
    max_tokens: int = 2048,
    model: str | None = None,
) -> BaseChatModel:
    """Get an LLM client. Defaults to Groq, falls back to OpenAI."""
    if settings.groq_api_key:
        return ChatGroq(
            api_key=settings.groq_api_key,
            model=model or DEFAULT_GROQ_MODEL,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    if settings.openai_api_key:
        return ChatOpenAI(
            api_key=settings.openai_api_key,
            model=model or DEFAULT_OPENAI_MODEL,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    raise RuntimeError("No LLM API key configured. Set GROQ_API_KEY or OPENAI_API_KEY.")


def get_extraction_llm() -> BaseChatModel:
    """Get a smaller/faster LLM for entity extraction."""
    return get_llm(temperature=0, max_tokens=4096, model="llama-3.1-8b-instant")
