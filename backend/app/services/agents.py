import os
import re
from dotenv import load_dotenv
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.prebuilt import create_react_agent

from app.core.config import settings
from app.services.tools import web_search, scrape_url

load_dotenv()

class RateLimitError(Exception):
    pass

def _is_rate_limit(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "429" in msg or "rate limit" in msg or "rate_limited" in msg

@retry(
    retry=retry_if_exception_type(RateLimitError),
    wait=wait_exponential(multiplier=2, min=3, max=20),
    stop=stop_after_attempt(3),
    reraise=True,
)
def safe_invoke(agent_or_chain, payload: dict):
    try:
        return agent_or_chain.invoke(payload)
    except Exception as e:
        if _is_rate_limit(e):
            print(f"Rate limit hit: {e}")
            raise RateLimitError(str(e))
        raise

def get_llm(provider: str = None, model_name: str = None):
    provider = provider or settings.DEFAULT_MODEL_PROVIDER
    
    if provider == "groq" or (not provider and settings.GROQ_API_KEY):
        api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        if api_key:
            from langchain_groq import ChatGroq
            return ChatGroq(
                model=model_name or "llama-3.3-70b-versatile",
                temperature=0.2,
                max_retries=3,
                api_key=api_key
            )
            
    if provider == "mistral" or settings.MISTRAL_API_KEY:
        api_key = settings.MISTRAL_API_KEY or os.getenv("MISTRAL_API_KEY")
        if api_key:
            from langchain_mistralai import ChatMistralAI
            return ChatMistralAI(
                model=model_name or "mistral-large-latest",
                temperature=0.2,
                api_key=api_key
            )
            
    if provider == "openai" or settings.OPENAI_API_KEY:
        api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        if api_key:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=model_name or "gpt-4o-mini",
                temperature=0.2,
                api_key=api_key
            )
            
    from langchain_groq import ChatGroq
    return ChatGroq(
        model=model_name or "llama-3.3-70b-versatile",
        temperature=0.2,
        api_key=settings.GROQ_API_KEY or "dummy_key"
    )

def build_search_agent(llm=None):
    llm = llm or get_llm()
    return create_react_agent(model=llm, tools=[web_search])

def build_reader_agent(llm=None):
    llm = llm or get_llm()
    return create_react_agent(model=llm, tools=[scrape_url])

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a world-class principal research analyst. Write rigorous, authoritative, and well-structured research reports with clear sections, quantitative facts, and citations."),
    ("human", """
Write a comprehensive deep research report on the topic below.

Topic:
{topic}

Research Gathered from Search and Scraping:
{research}

Structure the report cleanly in Markdown format with:
# Title: [Authoritative Title]

## Executive Summary
Concise 2-3 paragraph overview explaining the core context, recent breakthroughs, and why this matters now.

## Key Findings & In-Depth Analysis
Provide at least 3-4 distinct thematic subsections detailing technical mechanisms, market data, comparative benchmarks, and nuances.

## Current Challenges & Future Outlook
Key limitations, risks, ethical or scaling bottlenecks, and upcoming milestones for the next 2-5 years.

## Conclusion & Strategic Takeaways
Final verdict, actionable summary, and key highlights.

## Verified Sources & References
- List all URLs with descriptive titles and short notes on what was gathered from each.

Make the report thorough, accurate, readable, and highly professional.
"""),
])

def get_writer_chain(llm=None):
    llm = llm or get_llm()
    return writer_prompt | llm | StrOutputParser()

critic_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a sharp, unbiased research editor and peer reviewer. Evaluate research reports critically against rigor, depth, clarity, and citations."),
    ("human", """
Review the following research report strictly.

Report:
{report}

Provide your critique in this EXACT structure:

Score: [Number from 1 to 10]/10

Strengths:
- [Strength 1]
- [Strength 2]
- [Strength 3]

Areas to Improve:
- [Specific gap or missing perspective 1]
- [Specific gap or missing perspective 2]

One line verdict:
[One concise concluding sentence on the overall quality of this research]
"""),
])

def get_critic_chain(llm=None):
    llm = llm or get_llm()
    return critic_prompt | llm | StrOutputParser()

chat_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an interactive AI research assistant. You are answering questions from the user regarding the completed research report below.
Be concise, accurate, and cite relevant sections from the research where appropriate.

RESEARCH REPORT:
{report}

SCRAPED CONTEXT:
{context}
"""),
    ("human", "{question}"),
])

def get_chat_chain(llm=None):
    llm = llm or get_llm()
    return chat_prompt | llm | StrOutputParser()

def parse_critic_feedback(raw_text: str) -> dict:
    score = 8.5
    score_match = re.search(r"Score:\s*([\d\.]+)\s*/\s*10", raw_text, re.IGNORECASE)
    if score_match:
        try:
            score = float(score_match.group(1))
        except ValueError:
            pass

    strengths = []
    areas_to_improve = []
    verdict = ""

    current_section = None
    for line in raw_text.splitlines():
        line_clean = line.strip()
        if not line_clean:
            continue
        lower_line = line_clean.lower()
        if "strengths:" in lower_line:
            current_section = "strengths"
            continue
        elif "areas to improve:" in lower_line or "weaknesses:" in lower_line:
            current_section = "areas"
            continue
        elif "one line verdict:" in lower_line or "verdict:" in lower_line:
            current_section = "verdict"
            val = line_clean.split(":", 1)[-1].strip()
            if val:
                verdict = val
            continue

        if current_section == "strengths":
            cleaned_item = line_clean.lstrip("-*•0123456789. ")
            if cleaned_item:
                strengths.append(cleaned_item)
        elif current_section == "areas":
            cleaned_item = line_clean.lstrip("-*•0123456789. ")
            if cleaned_item:
                areas_to_improve.append(cleaned_item)
        elif current_section == "verdict" and not verdict:
            verdict = line_clean

    return {
        "score": score,
        "strengths": strengths if strengths else ["Comprehensive topic coverage", "Structured findings", "Clear synthesis"],
        "areas_to_improve": areas_to_improve if areas_to_improve else ["Add deeper benchmark comparisons"],
        "verdict": verdict if verdict else "High quality structured research report.",
        "raw": raw_text
    }
