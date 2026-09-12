import hashlib
import json
import os
from copy import deepcopy
from typing import Any
from urllib import error, request


_MEMORY_CACHE: dict[str, dict[str, Any]] = {}


def normalize_claim(content: str) -> str:
    return " ".join(content.strip().lower().split())


def hash_claim(content: str) -> str:
    return hashlib.sha256(normalize_claim(content).encode("utf-8")).hexdigest()


def claim_id_from_hash(claim_hash: str) -> str:
    return f"claim-{claim_hash[:8]}-2026"


def get_cached_verification(claim_hash: str) -> dict[str, Any] | None:
    supabase_result = _supabase_get(claim_hash)
    if supabase_result:
        return supabase_result
    cached = _MEMORY_CACHE.get(claim_hash)
    return deepcopy(cached) if cached else None


def save_verification(claim_hash: str, payload: dict[str, Any]) -> None:
    _MEMORY_CACHE[claim_hash] = deepcopy(payload)
    _supabase_save(claim_hash, payload)


def _supabase_headers() -> dict[str, str] | None:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        return None
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _supabase_url(path: str) -> str | None:
    base = os.getenv("SUPABASE_URL")
    if not base:
        return None
    return f"{base.rstrip('/')}/rest/v1/{path}"


def _supabase_get(claim_hash: str) -> dict[str, Any] | None:
    headers = _supabase_headers()
    url = _supabase_url(
        f"verifications?claim_hash=eq.{claim_hash}&select=response_payload&limit=1"
    )
    if not headers or not url:
        return None

    try:
        req = request.Request(url, headers=headers, method="GET")
        with request.urlopen(req, timeout=4) as res:
            rows = json.loads(res.read().decode("utf-8"))
            if rows:
                return rows[0].get("response_payload")
    except (error.URLError, TimeoutError, json.JSONDecodeError, KeyError):
        return None
    return None


def _supabase_save(claim_hash: str, payload: dict[str, Any]) -> None:
    headers = _supabase_headers()
    url = _supabase_url("verifications")
    if not headers or not url:
        return

    row = {
        "claim_hash": claim_hash,
        "claim_text": payload.get("claim", ""),
        "input_type": payload.get("input_type", "text"),
        "verdict": payload.get("verdict"),
        "trust_score": payload.get("trust_score"),
        "response_payload": payload,
    }

    try:
        data = json.dumps(row).encode("utf-8")
        req = request.Request(url, data=data, headers=headers, method="POST")
        request.urlopen(req, timeout=4).close()
    except (error.URLError, TimeoutError):
        return
