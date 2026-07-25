import time
from dotenv import load_dotenv
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from tools import web_search, scrape_url

load_dotenv()

# =========================
# LLM Setup (Groq — free tier, fast, generous limits)
# =========================

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    max_retries=3,
)

# =========================
# Rate-limit safe invoker
# =========================

class RateLimitError(Exception):
    pass

def _is_rate_limit(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "429" in msg or "rate limit" in msg or "rate_limited" in msg

@retry(
    retry=retry_if_exception_type(RateLimitError),
    wait=wait_exponential(multiplier=2, min=5, max=30),  # 5s -> 10s -> 20s -> 30s
    stop=stop_after_attempt(3),  # fail faster instead of hanging for minutes
    reraise=True,
)
def safe_invoke(agent_or_chain, payload: dict):
    try:
        return agent_or_chain.invoke(payload)
    except Exception as e:
        if _is_rate_limit(e):
            print(f"\n⚠  Rate limit hit — retrying after back-off… ({e})")
            raise RateLimitError(str(e))
        raise

# =========================
# Search Agent
# =========================

def build_search_agent():
    return create_react_agent(model=llm, tools=[web_search])

# =========================
# Reader Agent
# =========================

def build_reader_agent():
    return create_react_agent(model=llm, tools=[scrape_url])

# =========================
# Writer Chain
# =========================

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research writer. Write clear, structured and insightful reports."),
    ("human", """
Write a detailed research report on the topic below.

Topic:
{topic}

Research Gathered:
{research}

Structure the report as:

1. Introduction

2. Key Findings
   - Minimum 3 detailed findings

3. Conclusion

4. Sources
   - List all URLs found in the research

The report should be detailed, factual, professional and easy to understand.
"""),
])

writer_chain = writer_prompt | llm | StrOutputParser()

# =========================
# Critic Chain
# =========================

critic_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """
Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
...
"""),
])

critic_chain = critic_prompt | llm | StrOutputParser()