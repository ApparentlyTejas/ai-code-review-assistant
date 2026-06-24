import anthropic

from app.core.config import settings
from app.schemas.review import ReviewFindings

MODEL_NAME = "claude-sonnet-4-6"
MAX_DIFF_CHARS = 70_000

SYSTEM_PROMPT = """You are an expert code reviewer. You will be given a unified git diff from a pull \
request. Review it for:
- bugs (logic errors, edge cases, incorrect handling)
- security issues (injection, secrets, auth/authorization flaws, unsafe deserialization, etc.)
- style issues (naming, consistency, readability, dead code)
- suggestions (better patterns, simplifications, missing tests)

For each finding, identify the affected file path, a line number if you can reasonably infer one from \
the diff hunk headers, a clear explanation, and a concrete suggested fix where applicable. Only report \
real, specific issues grounded in the diff content. If the diff is clean, return an empty findings list \
rather than inventing problems. Call the submit_findings tool exactly once with your complete results."""

_TOOLS = [
    {
        "name": "submit_findings",
        "description": "Submit the structured code review findings for the diff.",
        "input_schema": ReviewFindings.model_json_schema(),
    }
]


class LLMReviewError(Exception):
    """Raised when the LLM call fails or returns an unusable response."""


def _truncate_diff(diff_text: str) -> str:
    if len(diff_text) <= MAX_DIFF_CHARS:
        return diff_text

    chunks = diff_text.split("diff --git ")
    truncated = chunks[0]
    for chunk in chunks[1:]:
        candidate = truncated + "diff --git " + chunk
        if len(candidate) > MAX_DIFF_CHARS:
            break
        truncated = candidate
    return truncated.rstrip() + "\n\n[diff truncated for length]"


def review_diff(diff_text: str) -> tuple[ReviewFindings, str]:
    """Run the diff through Claude and return (parsed findings, diff snapshot actually sent)."""
    diff_snapshot = _truncate_diff(diff_text)
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    request_kwargs = dict(
        model=MODEL_NAME,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        tools=_TOOLS,
        tool_choice={"type": "tool", "name": "submit_findings"},
        messages=[{"role": "user", "content": f"Review this diff:\n\n{diff_snapshot}"}],
    )

    try:
        response = client.messages.create(**request_kwargs)
    except (anthropic.RateLimitError, anthropic.APIConnectionError):
        try:
            response = client.messages.create(**request_kwargs)
        except anthropic.APIError as exc:
            raise LLMReviewError(f"Claude API call failed after retry: {exc}") from exc
    except anthropic.APIError as exc:
        raise LLMReviewError(f"Claude API call failed: {exc}") from exc

    tool_use_block = next((block for block in response.content if block.type == "tool_use"), None)
    if tool_use_block is None:
        raise LLMReviewError("Claude response did not include a tool_use block")

    try:
        findings = ReviewFindings.model_validate(tool_use_block.input)
    except Exception as exc:
        raise LLMReviewError(f"Claude response failed schema validation: {exc}") from exc

    return findings, diff_snapshot
