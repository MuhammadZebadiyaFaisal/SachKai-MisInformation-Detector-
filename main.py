from fastapi import FastAPI
from pydantic import BaseModel
from search import search_claim, deduplicate_and_format

app = FastAPI()

class SearchRequest(BaseModel):
    content: str

@app.post("/agent/search")
def search_evidence(request: SearchRequest):
    raw_results, optimized_query = search_claim(request.content)
    sources = deduplicate_and_format(raw_results)
    
    return {
        "optimized_query": optimized_query,
        "sources": sources
    }

@app.get("/")
def health_check():
    return {"status": "search agent running"}
