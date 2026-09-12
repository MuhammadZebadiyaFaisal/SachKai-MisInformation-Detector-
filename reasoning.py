import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from groq import Groq

from schemas import Source


load_dotenv()


def reason_about_claim(claim: str, sources: list[Source]) -> tuple[dict[str, Any], list[str]]:
    warnings: list[str] = []

    if not os.getenv("GROQ_API_KEY"):
        warnings.append("GROQ_API_KEY is missing; returned heuristic fallback reasoning.")
        return _fallback_reasoning(claim, sources), warnings

    source_context = "\n".join(
        f"- {s.title} ({s.credibility}) {s.url}: {s.snippet or ''}" for s in sources
    )
    prompt = f"""You are SachKai, a Pakistan-focused misinformation verification agent.
Evaluate the claim using only the provided source snippets. Return strict JSON only.

JSON schema:
{{
  "verdict": "True" | "False" | "Misleading" | "Unverified",
  "trust_score": 0-100,
  "summary": {{"english": "...", "urdu": "..."}},
  "key_findings": ["...", "..."]
}}

Scoring guide:
- 80-100: reliable sources clearly support the claim
- 50-79: partly supported, missing context, or minor uncertainty
- 20-49: major context problem or credible contradiction
- 0-19: credible sources clearly reject it
- Use "Unverified" when sources are weak or insufficient.

Claim: {claim}

Sources:
{source_context or "No sources found."}
"""

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_completion_tokens=900,
        )
        content = response.choices[0].message.content or ""
        return _parse_reasoning_json(content), warnings
    except Exception as exc:
        warnings.append(f"Reasoning agent failed; returned fallback reasoning. Error: {exc}")
        return _fallback_reasoning(claim, sources), warnings


def _parse_reasoning_json(content: str) -> dict[str, Any]:
    match = re.search(r"\{.*\}", content, re.DOTALL)
    raw_json = match.group(0) if match else content
    parsed = json.loads(raw_json)

    verdict = parsed.get("verdict", "Unverified")
    if verdict not in {"True", "False", "Misleading", "Unverified"}:
        verdict = "Unverified"

    score = int(parsed.get("trust_score", 40))
    score = max(0, min(100, score))
    summary = parsed.get("summary") or {}

    return {
        "verdict": verdict,
        "trust_score": score,
        "summary": {
            "english": summary.get("english") or "The claim could not be fully verified.",
            "urdu": summary.get("urdu") or "اس دعوے کی مکمل تصدیق نہیں ہو سکی۔",
        },
        "key_findings": list(parsed.get("key_findings") or [])[:5],
    }


def _fallback_reasoning(claim: str, sources: list[Source]) -> dict[str, Any]:
    high_sources = [s for s in sources if s.credibility == "High"]
    medium_sources = [s for s in sources if s.credibility == "Medium"]

    if high_sources:
        score = 62
        finding = "At least one high-credibility source was found, but LLM reasoning is unavailable."
    elif medium_sources:
        score = 48
        finding = "Some media sources were found, but official confirmation is missing."
    else:
        score = 35 if sources else 25
        finding = "Credible source coverage is limited or missing."

    return {
        "verdict": "Unverified",
        "trust_score": score,
        "summary": {
            "english": (
                "SachKai found related sources, but the reasoning agent could not make a "
                "final evidence-based judgment. Treat this claim as unverified for now."
            ),
            "urdu": "SachKai کو متعلقہ ذرائع ملے، مگر حتمی فیصلہ دستیاب نہیں۔ فی الحال اس دعوے کو غیر مصدقہ سمجھیں۔",
        },
        "key_findings": [finding, f"Claim reviewed: {claim[:140]}"],
    }

