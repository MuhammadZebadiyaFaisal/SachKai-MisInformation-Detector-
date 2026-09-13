from typing import Literal

from pydantic import BaseModel, Field


InputType = Literal["text", "audio", "image"]
Verdict = Literal["True", "False", "Misleading", "Unverified"]
Credibility = Literal["High", "Medium", "Low"]
AgentStatus = Literal["pending", "active", "completed", "failed"]


class VerifyRequest(BaseModel):
    input_type: InputType = "text"
    content: str = Field(default="", description="Raw claim text or extracted media text")
    media_url: str | None = None


class Source(BaseModel):
    title: str
    url: str
    credibility: Credibility = "Low"
    snippet: str | None = None
    published_date: str | None = None


class Summary(BaseModel):
    english: str
    urdu: str


class AgentLog(BaseModel):
    agent_name: str
    status: AgentStatus
    message: str


class VerifyResponse(BaseModel):
    claim_id: str
    is_cached: bool
    verdict: Verdict
    trust_score: int = Field(ge=0, le=100)
    summary: Summary
    key_findings: list[str]
    sources: list[Source]
    agent_logs: list[AgentLog]
    processing_time_seconds: float
    extracted_text: str | None = None
    warnings: list[str] = []


class FeedItem(BaseModel):
    claim_id: str
    claim_text: str
    input_type: InputType
    verdict: Verdict
    trust_score: int = Field(ge=0, le=100)
    created_at: str | None = None
