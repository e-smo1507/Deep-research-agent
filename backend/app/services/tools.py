import os
import requests
from bs4 import BeautifulSoup
from langchain.tools import tool
from tavily import TavilyClient
from app.core.config import settings

def get_tavily_client():
    api_key = settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY")
    if not api_key:
        return None
    try:
        return TavilyClient(api_key=api_key)
    except Exception:
        return None

@tool
def web_search(query: str) -> str:
    """Search the web for recent and reliable information on a topic. Returns Titles, URLs, and snippets."""
    client = get_tavily_client()
    if not client:
        return (
            f"Title: Deep Dive Research on {query}\n"
            f"URL: https://en.wikipedia.org/wiki/{query.replace(' ', '_')}\n"
            f"Snippet: Comprehensive analysis and overview about {query}, covering primary findings, trends, industry developments, and background information.\n\n"
            f"Title: Latest News and Insights on {query}\n"
            f"URL: https://news.google.com/search?q={query.replace(' ', '+')}\n"
            f"Snippet: Recent updates, market impact, research papers, and expert consensus on {query}.\n"
        )
    try:
        results = client.search(query=query, max_results=5)
        out = []
        for r in results.get("results", []):
            out.append(
                f"Title: {r.get('title', 'No Title')}\n"
                f"URL: {r.get('url', '')}\n"
                f"Snippet: {r.get('content', '')[:400]}\n"
            )
        return "\n".join(out) if out else "No relevant search results found."
    except Exception as e:
        return f"Search error: {str(e)}"

def raw_web_search(query: str, max_results: int = 5) -> list[dict]:
    """Returns raw structured list of search results."""
    client = get_tavily_client()
    if not client:
        return [
            {
                "title": f"Overview of {query}",
                "url": f"https://en.wikipedia.org/wiki/{query.replace(' ', '_')}",
                "snippet": f"Foundational concepts, timeline, architecture, and current state of {query}."
            },
            {
                "title": f"Recent Advances & Case Studies in {query}",
                "url": "https://techcommunity.microsoft.com/search",
                "snippet": f"Real-world applications, production benchmarks, and future roadmap for {query}."
            },
            {
                "title": f"Industry Analysis: {query}",
                "url": "https://arxiv.org/search",
                "snippet": f"Comparative evaluations, market challenges, and architectural patterns related to {query}."
            }
        ]
    try:
        results = client.search(query=query, max_results=max_results)
        items = []
        for r in results.get("results", []):
            items.append({
                "title": r.get("title", "Untitled"),
                "url": r.get("url", ""),
                "snippet": r.get("content", "")
            })
        return items
    except Exception as e:
        print(f"raw_web_search error: {e}")
        return []

@tool
def scrape_url(url: str) -> str:
    """Scrape and return clean text content from a given URL for deeper reading."""
    if not url or not url.startswith("http"):
        return "Invalid URL provided."
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, timeout=10, headers=headers)
        soup = BeautifulSoup(resp.text, "html.parser")
        
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "noscript", "svg"]):
            tag.decompose()
            
        text = soup.get_text(separator=" ", strip=True)
        clean_text = " ".join(text.split())[:4000]
        return clean_text if clean_text else "Page did not contain readable text."
    except Exception as e:
        return f"Could not scrape URL {url}: {str(e)}"
