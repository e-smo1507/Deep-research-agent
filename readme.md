# 🔬 Multi-Agent Research Pipeline

> A fully autonomous AI research system powered by **LangGraph**, **Mistral AI**, **Tavily**, and **BeautifulSoup** — with a sleek **Streamlit** UI.

---

## 🧠 How It Works

The pipeline chains **4 specialized AI agents** in sequence, each with a single responsibility:

```
You give a Research Topic
         │
         ▼
┌─────────────────────────┐        ┌──────────────────────────────┐
│   Agent 1: Search Agent  │───────▶│  Tool 1: Tavily API          │
│   (create_react_agent)   │◀───────│  Live web search results     │
└─────────────────────────┘        └──────────────────────────────┘
         │
         │  state['search_results'] saved
         ▼
┌─────────────────────────┐        ┌──────────────────────────────┐
│   Agent 2: Reader Agent  │───────▶│  Tool 2: BeautifulSoup       │
│   (create_react_agent)   │◀───────│  Scrapes & cleans page text  │
└─────────────────────────┘        └──────────────────────────────┘
         │
         │  state['scraped_content'] saved
         ▼
┌─────────────────────────┐
│   Chain 3: Writer Chain  │  Drafts a structured research report
│   (LCEL prompt | llm)   │
└─────────────────────────┘
         │
         │  state['report'] saved
         ▼
┌─────────────────────────┐
│   Chain 4: Critic Chain  │  Scores and critiques the report
│   (LCEL prompt | llm)   │
└─────────────────────────┘
         │
         ▼
    ✅ Final Output
```

---

## 🗂️ Project Structure

```
research-agent/
│
├── app.py              # Streamlit UI
├── pipeline.py         # Supervisor — orchestrates all 4 agents/chains
├── agents.py           # Agent & chain definitions + rate-limit retry logic
├── tools.py            # web_search (Tavily) + scrape_url (BeautifulSoup)
├── requirements.txt    # All dependencies
└── .env                # API keys (not committed)
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **LLM** | Mistral AI (`mistral-large-latest`) |
| **Agent Framework** | LangGraph `create_react_agent` |
| **Chain Syntax** | LangChain LCEL (`prompt \| llm \| StrOutputParser`) |
| **Web Search** | Tavily API |
| **Web Scraping** | BeautifulSoup 4 + Requests |
| **UI** | Streamlit |
| **Retry Logic** | Tenacity (exponential back-off) |
| **Env Management** | python-dotenv |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/research-agent.git
cd research-agent
```

### 2. Create a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up your `.env` file

```env
MISTRAL_API_KEY=your_mistral_api_key
TAVILY_API_KEY=your_tavily_api_key
```

> Get your keys from:
> - Mistral: https://console.mistral.ai/
> - Tavily: https://app.tavily.com/

### 5. Run the Streamlit UI

```bash
streamlit run app.py
```

### 5b. Or run in terminal only

```bash
python pipeline.py
```

---

## 🧩 Agent Breakdown

### 🔍 Search Agent — `build_search_agent()`
Uses **Tavily API** to fetch live, reliable web search results for the given topic. Results are stored in `state['search_results']`.

### 🕷️ Reader Agent — `build_reader_agent()`
Picks the most relevant URL from the search results and uses **BeautifulSoup** to scrape and extract clean readable text. Stored in `state['scraped_content']`.

### ✍️ Writer Chain — `writer_chain`
An LCEL chain (`prompt | llm | StrOutputParser`) that synthesises the search results and scraped content into a structured report with Introduction, Key Findings, Conclusion, and Sources.

### 🧐 Critic Chain — `critic_chain`
Reviews the generated report and returns a structured critique: a score out of 10, strengths, areas to improve, and a one-line verdict.

---

## 🛡️ Rate Limit Handling

All agent and chain calls are wrapped in a `safe_invoke()` function using **Tenacity**:

- Detects HTTP 429 / `rate_limited` errors automatically
- Retries up to **5 times** with exponential back-off: `5s → 10s → 20s → 40s → 60s`
- The Mistral client also has `max_retries=6` at the HTTP level

---

## 📸 UI Preview

The Streamlit UI (`app.py`) features:

- A **4-step pipeline indicator** (Search → Scrape → Write → Critique) that updates live
- Result cards with **colour-coded accents** per agent
- Raw search and scraped content in **collapsed expanders**
- A **Download as Markdown** button for the final report

---

## 📋 Requirements

```
langchain
langchain-community
langchain-mistralai
langchain-core
langgraph
langsmith
mistralai
tavily-python
beautifulsoup4
requests
streamlit
tenacity
python-dotenv
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with LangGraph · Mistral AI · Tavily · BeautifulSoup · Streamlit</p>
