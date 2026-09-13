import os
from dotenv import load_dotenv
from tavily import TavilyClient
from query_transform import transform_query

load_dotenv()

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


def _run_search(tavily_client, query, max_results, include_domains=None, search_depth="basic"):
    kwargs = {
        "query": query,
        "search_depth": search_depth,
        "max_results": max_results,
        "exclude_domains": BLOCKED_DOMAINS,
    }
    if include_domains:
        kwargs["include_domains"] = include_domains
    return tavily_client.search(**kwargs).get("results", [])


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
    tavily_key = os.getenv("TAVILY_API_KEY")
    if not tavily_key:
        raise RuntimeError("TAVILY_API_KEY is missing")

    tavily_client = TavilyClient(api_key=tavily_key)
    optimized_query = transform_query(raw_claim)
    search_plan = []
    combined_results = []

    official_results = _run_search(
        tavily_client,
        optimized_query,
        max_results=6,
        include_domains=HIGH_CREDIBILITY,
        search_depth="basic",
    )
    combined_results.extend(official_results)
    search_plan.append(f"Official-source pass found {len(official_results)} results")

    if len(deduplicate_and_format(combined_results)) < 3:
        news_results = _run_search(
            tavily_client,
            optimized_query,
            max_results=8,
            include_domains=MEDIUM_CREDIBILITY,
            search_depth="basic",
        )
        combined_results.extend(news_results)
        search_plan.append(f"Trusted-news pass found {len(news_results)} results")

    if len(deduplicate_and_format(combined_results)) < 3:
        wide_results = _run_search(
            tavily_client,
            optimized_query,
            max_results=10,
            search_depth=os.getenv("TAVILY_FALLBACK_SEARCH_DEPTH", "advanced"),
        )
        combined_results.extend(wide_results)
        search_plan.append(f"Wide-web fallback found {len(wide_results)} results")

    return combined_results, optimized_query, search_plan

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
    raw_results, optimized_query, search_plan = search_claim(claim_text)
    sources = deduplicate_and_format(raw_results)
    return {
        "optimized_query": optimized_query,
        "sources": sources,
        "search_plan": search_plan,
    }

if __name__ == "__main__":
    claim = "covid19 is back"
    result = get_verified_sources(claim)
    print(f"Optimized query: {result['optimized_query']}\n")
    for s in result['sources']:
        print(s)
        print("---")
