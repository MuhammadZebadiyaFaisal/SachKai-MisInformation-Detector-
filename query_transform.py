import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

def transform_query(raw_claim):
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return " ".join(raw_claim.split())[:180]

    client = Groq(api_key=groq_key)
    prompt = f"""You are a search query optimizer for a Pakistani fact-checking system.
Convert the following claim (which may be in Urdu, Roman Urdu, or English) into an 
optimal English search query for finding fact-check information.

Rules:
- Extract key entities, dates, locations, numbers
- Add relevant site filters when appropriate (site:gov.pk for government claims, 
  site:pid.gov.pk for official notifications)
- Keep it concise (under 15 words)
- Output ONLY the search query, nothing else

Claim: "{raw_claim}"

Search query:"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_completion_tokens=512,
        reasoning_effort="low"
    )
    return response.choices[0].message.content.strip()

if __name__ == "__main__":
    test_claim = "Pakistan petrol price increase"
    result = transform_query(test_claim)
    print("RESULT:", result)
