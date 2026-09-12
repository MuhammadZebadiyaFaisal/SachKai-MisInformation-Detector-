import time

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from cache import (
    claim_id_from_hash,
    get_cached_verification,
    hash_claim,
    list_recent_verifications,
    save_verification,
)
from media_processing import extract_text_from_image_file, transcribe_audio_file
from reasoning import reason_about_claim
from schemas import AgentLog, FeedItem, Source, VerifyRequest, VerifyResponse
from search import search_claim, deduplicate_and_format

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_claim_text(payload: VerifyRequest) -> str:
    if payload.input_type == "text":
        return payload.content.strip()

    raise HTTPException(
        status_code=501,
        detail=f"{payload.input_type} input is planned but not implemented yet.",
    )


def verify_text_claim(
    claim_text: str,
    input_type: str = "text",
    extracted_text: str | None = None,
    initial_agent_logs: list[AgentLog] | None = None,
):
    start = time.perf_counter()
    if not claim_text:
        raise HTTPException(status_code=400, detail="Claim content is required.")

    claim_hash = hash_claim(claim_text)
    claim_id = claim_id_from_hash(claim_hash)
    agent_logs = list(initial_agent_logs or [])
    agent_logs.append(
        AgentLog(
            agent_name="Claim Agent",
            status="completed",
            message="Claim normalized and hashed",
        )
    )
    cached = get_cached_verification(claim_hash)
    if cached:
        cached["is_cached"] = True
        cached["processing_time_seconds"] = round(time.perf_counter() - start, 2)
        cached["agent_logs"] = [
            log.model_dump() for log in agent_logs
        ] + [
            {
                "agent_name": "Cache Agent",
                "status": "completed",
                "message": "Served duplicate claim from cache",
            }
        ]
        cached["extracted_text"] = extracted_text
        return cached

    warnings: list[str] = []
    try:
        raw_results, optimized_query, search_plan = search_claim(claim_text)
        formatted_sources = deduplicate_and_format(raw_results)
        agent_logs.append(
            AgentLog(
                agent_name="Search Agent",
                status="completed",
                message=f"Found {len(formatted_sources)} relevant sources. {'; '.join(search_plan)}",
            )
        )
    except Exception as exc:
        optimized_query = claim_text
        search_plan = []
        formatted_sources = []
        agent_logs.append(
            AgentLog(
                agent_name="Search Agent",
                status="failed",
                message="Search failed; continuing with fallback estimate",
            )
        )
        warnings.append(f"Search agent failed; response is an estimate. Error: {exc}")

    sources = [Source(**source) for source in formatted_sources]
    reasoning, reasoning_warnings = reason_about_claim(claim_text, sources)
    warnings.extend(reasoning_warnings)
    agent_logs.append(
        AgentLog(
            agent_name="Reasoning Agent",
            status="completed" if not reasoning_warnings else "failed",
            message=(
                "Generated verdict and bilingual summary"
                if not reasoning_warnings
                else "Used fallback reasoning because the LLM pass was unavailable"
            ),
        )
    )
    agent_logs.append(
        AgentLog(
            agent_name="Cache Agent",
            status="completed",
            message="Stored verification for duplicate detection",
        )
    )

    response = {
        "claim_id": claim_id,
        "is_cached": False,
        "verdict": reasoning["verdict"],
        "trust_score": reasoning["trust_score"],
        "summary": reasoning["summary"],
        "key_findings": reasoning["key_findings"],
        "sources": [source.model_dump() for source in sources],
        "agent_logs": [log.model_dump() for log in agent_logs],
        "processing_time_seconds": round(time.perf_counter() - start, 2),
        "warnings": warnings,
        "claim": claim_text,
        "claim_hash": claim_hash,
        "input_type": input_type,
        "optimized_query": optimized_query,
        "search_plan": search_plan,
        "extracted_text": extracted_text,
    }

    save_verification(claim_hash, response)
    return response


@app.post("/api/verify", response_model=VerifyResponse)
def verify_claim(payload: VerifyRequest):
    claim_text = extract_claim_text(payload)
    return verify_text_claim(claim_text, input_type=payload.input_type)


@app.post("/api/verify-file", response_model=VerifyResponse)
def verify_uploaded_file(input_type: str = Form(...), file: UploadFile = File(...)):
    if input_type not in {"audio", "image"}:
        raise HTTPException(status_code=400, detail="input_type must be audio or image.")

    try:
        if input_type == "audio":
            extracted_text = transcribe_audio_file(file)
            media_message = "Audio transcribed with local faster-whisper"
        else:
            extracted_text = extract_text_from_image_file(file)
            media_message = "Image text extracted with local Tesseract OCR"
    except RuntimeError as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc

    media_log = AgentLog(
        agent_name="Media Agent",
        status="completed",
        message=media_message,
    )
    return verify_text_claim(
        extracted_text,
        input_type=input_type,
        extracted_text=extracted_text,
        initial_agent_logs=[media_log],
    )


@app.post("/agent/search")
def search_evidence(payload: VerifyRequest):
    claim_text = payload.content.strip()
    if not claim_text:
        raise HTTPException(status_code=400, detail="Claim content is required.")
    raw_results, optimized_query, search_plan = search_claim(claim_text)
    sources = deduplicate_and_format(raw_results)
    return {"optimized_query": optimized_query, "sources": sources, "search_plan": search_plan}


@app.get("/api/feed", response_model=list[FeedItem])
def verification_feed(limit: int = 20):
    safe_limit = max(1, min(limit, 50))
    return list_recent_verifications(safe_limit)


@app.get("/")
def health_check():
    return {"status": "sachkai verification api running"}
