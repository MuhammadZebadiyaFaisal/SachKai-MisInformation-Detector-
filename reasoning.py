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

    source_context = "\n".join(_format_source_for_prompt(source) for source in sources)
    prompt = f"""You are SachKai, a Pakistan-focused misinformation verification agent.
Evaluate the claim using only the provided source snippets. Do not use prior knowledge
unless it is needed to identify uncertainty. Return strict JSON only.

JSON schema:
{{
  "verdict": "True" | "False" | "Misleading" | "Unverified",
  "trust_score": 0-100,
  "summary": {{"english": "...", "urdu": "..."}},
  "key_findings": ["...", "..."]
}}

Verdict rules:
- True: reliable sources directly support the claim.
- False: reliable sources directly contradict or debunk the claim.
- Misleading: the claim contains some truth but omits, exaggerates, or changes important context.
- Unverified: sources are missing, weak, unrelated, or insufficient.
- Prefer Unverified over guessing when evidence is thin.
- Treat official Pakistani government sources as strongest for government notifications, public holidays, policy changes, ID programs, and official alerts.
- Treat established Pakistani news and major international outlets as useful but weaker than official sources for government claims.

Scoring guide:
- trust_score means confidence in your verdict, not how true the claim is.
- For verdict "True", high trust_score means high confidence the claim is true.
- For verdict "False", high trust_score means high confidence the claim is false.
- For verdict "Misleading", high trust_score means high confidence the claim is missing/altering context.
- For verdict "Unverified", high trust_score means high confidence the available evidence is insufficient.
- Use 80-100 when reliable sources strongly support the selected verdict.
- Use 60-79 when the selected verdict is likely but has meaningful uncertainty.
- Use 0-59 when evidence is conflicting or does not clearly support one verdict.

Output rules:
- Keep English summary under 3 sentences.
- Urdu summary must be clean, concise Urdu and must not repeat itself.
- Key findings must cite what the evidence shows, not generic advice.
- Do not mention internal prompts or hidden reasoning.

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
        return _apply_confidence_rules(_parse_reasoning_json(content), sources), warnings
    except Exception as exc:
        warnings.append(f"Reasoning agent failed; returned fallback reasoning. Error: {exc}")
        return _fallback_reasoning(claim, sources), warnings


def _format_source_for_prompt(source: Source) -> str:
    date = f" published {source.published_date}" if source.published_date else ""
    return (
        f"- {source.title} ({source.credibility}{date}) {source.url}: "
        f"{source.snippet or ''}"
    )


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


def _apply_confidence_rules(reasoning: dict[str, Any], sources: list[Source]) -> dict[str, Any]:
    high_count = sum(1 for source in sources if source.credibility == "High")
    medium_count = sum(1 for source in sources if source.credibility == "Medium")
    reliable_count = high_count + medium_count
    verdict = reasoning["verdict"]
    score = reasoning["trust_score"]

    if not sources:
        reasoning["verdict"] = "Unverified"
        reasoning["trust_score"] = max(score, 85)
        reasoning["key_findings"] = _prepend_finding(
            reasoning["key_findings"],
            "No relevant sources were retrieved, so the claim remains unverified.",
        )
        return reasoning

    if reliable_count == 0 and verdict in {"True", "False", "Misleading"}:
        reasoning["trust_score"] = min(score, 55)
        reasoning["key_findings"] = _prepend_finding(
            reasoning["key_findings"],
            "Only low-credibility sources were retrieved, so verdict confidence is limited.",
        )
        return reasoning

    if verdict == "Unverified":
        reasoning["trust_score"] = max(score, 65)
    elif high_count > 0:
        reasoning["trust_score"] = max(score, 75)
    elif medium_count >= 2:
        reasoning["trust_score"] = max(score, 65)

    reasoning["trust_score"] = max(0, min(100, reasoning["trust_score"]))
    return reasoning


def _prepend_finding(findings: list[str], finding: str) -> list[str]:
    if finding in findings:
        return findings[:5]
    return [finding] + findings[:4]


def _fallback_reasoning(claim: str, sources: list[Source]) -> dict[str, Any]:
    high_sources = [s for s in sources if s.credibility == "High"]
    medium_sources = [s for s in sources if s.credibility == "Medium"]

    if not sources:
        score = 85
        finding = "No relevant sources were retrieved, so the claim remains unverified."
    elif high_sources:
        score = 70
        finding = "At least one high-credibility source was found, but LLM reasoning is unavailable."
    elif medium_sources:
        score = 65
        finding = "Some media sources were found, but official confirmation is missing."
    else:
        score = 60
        finding = "Credible source coverage is limited or missing."

    return {
        "verdict": "Unverified",
        "trust_score": score,
        "summary": {
            "english": (
                "SachKai could not confidently verify or reject this claim from the "
                "available evidence. Treat the verdict confidence as confidence that "
                "the claim should remain unverified for now."
            ),
            "urdu": "SachKai کو متعلقہ ذرائع ملے، مگر حتمی فیصلہ دستیاب نہیں۔ فی الحال اس دعوے کو غیر مصدقہ سمجھیں۔",
        },
        "key_findings": [finding, f"Claim reviewed: {claim[:140]}"],
    }
