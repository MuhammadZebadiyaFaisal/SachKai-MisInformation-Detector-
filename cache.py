import hashlib
import json
import os
from copy import deepcopy
from datetime import UTC, datetime
from typing import Any
from urllib import error, request
from urllib.parse import urlencode


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
    cache_payload = deepcopy(payload)
    cache_payload.setdefault("created_at", datetime.now(UTC).isoformat())
    _MEMORY_CACHE[claim_hash] = cache_payload
    _supabase_save(claim_hash, cache_payload)


def list_recent_verifications(limit: int = 20) -> list[dict[str, Any]]:
    supabase_rows = _supabase_list(limit)
    if supabase_rows is not None:
        return supabase_rows

    rows = []
    for claim_hash, payload in reversed(_MEMORY_CACHE.items()):
        rows.append(_feed_item_from_payload(claim_hash, payload))
        if len(rows) >= limit:
            break
    return rows


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


def _supabase_list(limit: int) -> list[dict[str, Any]] | None:
    headers = _supabase_headers()
    base_url = _supabase_url("verifications")
    if not headers or not base_url:
        return None

    params = urlencode(
        {
            "select": "claim_hash,claim_text,input_type,verdict,trust_score,response_payload,created_at",
            "order": "created_at.desc",
            "limit": str(limit),
        },
        safe=",.",
    )

    try:
        req = request.Request(f"{base_url}?{params}", headers=headers, method="GET")
        with request.urlopen(req, timeout=4) as res:
            rows = json.loads(res.read().decode("utf-8"))
            return [_feed_item_from_row(row) for row in rows]
    except (error.URLError, TimeoutError, json.JSONDecodeError, KeyError):
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


def _feed_item_from_row(row: dict[str, Any]) -> dict[str, Any]:
    response_payload = row.get("response_payload") or {}
    claim_hash = row.get("claim_hash") or response_payload.get("claim_hash", "")
    return {
        "claim_id": response_payload.get("claim_id") or claim_id_from_hash(claim_hash),
        "claim_text": row.get("claim_text") or response_payload.get("claim", ""),
        "input_type": row.get("input_type") or response_payload.get("input_type", "text"),
        "verdict": row.get("verdict") or response_payload.get("verdict", "Unverified"),
        "trust_score": row.get("trust_score") or response_payload.get("trust_score", 0),
        "created_at": row.get("created_at") or response_payload.get("created_at"),
    }


def _feed_item_from_payload(claim_hash: str, payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "claim_id": payload.get("claim_id") or claim_id_from_hash(claim_hash),
        "claim_text": payload.get("claim", ""),
        "input_type": payload.get("input_type", "text"),
        "verdict": payload.get("verdict", "Unverified"),
        "trust_score": payload.get("trust_score", 0),
        "created_at": payload.get("created_at"),
    }
