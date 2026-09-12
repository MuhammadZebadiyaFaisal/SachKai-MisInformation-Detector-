import os
from dotenv import load_dotenv
from tavily import TavilyClient
from query_transform import transform_query

load_dotenv()
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

HIGH_CREDIBILITY = [
    "gov.pk", "pid.gov.pk", "pbs.gov.pk", "nadra.gov.pk", 
    "sbp.org.pk", "pta.gov.pk", "ecp.gov.pk"
]
MEDIUM_CREDIBILITY = [
    "dawn.com", "geo.tv", "app.com.pk", "tribune.com.pk", 
    "brecorder.com", "arynews.tv", "thenews.com.pk", 
    "samaa.tv", "dunyanews.tv", "bbc.com", "reuters.com"
]
BLOCKED_DOMAINS = [
    "facebook.com", "twitter.com", "x.com", "instagram.com", 
    "tiktok.com", "reddit.com", "quora.com", "pinterest.com",
    "youtube.com", "wikipedia.org"
]

def get_credibility(url):
    for domain in HIGH_CREDIBILITY:
        if domain in url:
            return "High"
    for domain in MEDIUM_CREDIBILITY:
        if domain in url:
            return "Medium"
    return "Low"

def is_blocked(url):
    return any(blocked in url for blocked in BLOCKED_DOMAINS)

def search_claim(raw_claim):
    optimized_query = transform_query(raw_claim)
    
    response = tavily_client.search(
        query=optimized_query,
        search_depth="advanced",
        max_results=10,
        include_domains=HIGH_CREDIBILITY + MEDIUM_CREDIBILITY,
        exclude_domains=BLOCKED_DOMAINS
    )
    
    if len(response['results']) < 3:
        response = tavily_client.search(
            query=optimized_query,
            search_depth="advanced",
            max_results=10,
            exclude_domains=BLOCKED_DOMAINS
        )
    
    return response['results'], optimized_query

def deduplicate_and_format(results):
    seen_urls = set()
    formatted = []
    
    for r in results:
        url = r.get('url', '')
        if is_blocked(url):
            continue
        if url in seen_urls:
            continue
        seen_urls.add(url)
        
        formatted.append({
            "title": r.get('title', ''),
            "url": url,
            "credibility": get_credibility(url),
            "snippet": r.get('content', ''),
            "published_date": r.get('published_date', 'unknown')
        })
        
        if len(formatted) >= 5:
            break
    
    return formatted

def get_verified_sources(claim_text):
    raw_results, optimized_query = search_claim(claim_text)
    sources = deduplicate_and_format(raw_results)
    return {
        "optimized_query": optimized_query,
        "sources": sources
    }

if __name__ == "__main__":
    claim = "covid19 is back"
    result = get_verified_sources(claim)
    print(f"Optimized query: {result['optimized_query']}\n")
    for s in result['sources']:
        print(s)
        print("---")