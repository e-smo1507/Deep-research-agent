# 🔬 Deep Research Agent — Full-Stack AI Research Platform

> An enterprise-grade, autonomous **Deep Research Platform** powered by **FastAPI**, **React (Vite + Tailwind CSS)**, **LangGraph**, **Groq / Mistral / OpenAI**, **Tavily**, and **ReportLab**.

---

## 🌟 Key Features

- ⚡ **Multi-Agent Research Pipeline**:
  - 🔍 **Search Agent**: Intelligent query routing & live web index retrieval with Tavily.
  - 🕷️ **Reader Agent**: Automatic page scraping, HTML sanitization, and structured extraction.
  - ✍️ **Writer Chain**: Rigorous executive synthesis with findings, future outlook, and citations.
  - 🧐 **Critic Review Chain**: Automated peer-review scoring ($X/10$), identifying strengths and actionable improvements.
- 📡 **Real-Time SSE Streaming**: Live step-by-step visibility into agent reasoning, active searches, and scraping progress.
- 💾 **Persistent Session Library**: SQLite / PostgreSQL database to save, search, filter, and revisit past research reports.
- 💬 **Follow-Up Interactive Q&A ("Chat with this Report")**: Conversational sidebar grounded strictly in the report's gathered sources.
- 📄 **Multi-Format Export Engine**: One-click download as publication-ready **Styled PDF**, clean **Markdown (`.md`)**, or clipboard copy.
- 🎛️ **Multi-Model Provider Support**: Instant toggle between Groq (Llama 3.3 70B), Mistral AI, and OpenAI (GPT-4o).

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React + Vite + Tailwind        │
│  - Research Dashboard & Live Timeline Visualizer       │
│  - Rich Markdown Report Viewer with Critic Scorecard   │
│  - Research History Sidebar (Persistent Sessions)      │
│  - Follow-up Q&A Chat with Report Context              │
│  - One-Click PDF & Markdown Exporters                  │
└───────────────────────────┬────────────────────────────┘
                            │ REST API + SSE Stream
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend: FastAPI (Python)                │
│  - /api/research/stream (Real-Time SSE Event Stream)   │
│  - /api/history (Session CRUD & Search)                │
│  - /api/chat (Follow-up RAG conversation)              │
│  - /api/export (Formatted PDF & Markdown Generator)    │
│  - SQLite Database with SQLAlchemy Async ORM           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            Multi-Agent LangGraph Engine                │
│  1. Search Agent (Tavily API)                          │
│  2. Reader Agent (BeautifulSoup4 Scraper & Parser)     │
│  3. Writer Chain (Structured Research Synthesis)       │
│  4. Critic Chain (Scorecard & Evaluation)              │
│  5. Follow-up Q&A Chain (Grounded Context Answering)   │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root and fill in your API keys:
```env
GROQ_API_KEY=gsk_your_groq_key
TAVILY_API_KEY=tvly_your_tavily_key
```

### 2. Launch the Application

#### Option A: One-Click Start (Windows)
Double-click `start.bat` or run:
```bash
start.bat
```

#### Option B: Manual Start

**Backend:**
```bash
pip install -r backend/requirements.txt
python backend/run.py
```
*Backend runs on `http://127.0.0.1:8000` (API Docs at `/docs`).*

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/research/create` | Create a new research session |
| `GET` | `/api/research/{id}/stream` | SSE real-time agent execution stream |
| `GET` | `/api/research/{id}` | Retrieve report, scores, and logs |
| `GET` | `/api/history` | List and search research history |
| `DELETE` | `/api/history/{id}` | Delete a specific session |
| `POST` | `/api/chat/{id}` | Ask follow-up questions about a report |
| `GET` | `/api/export/{id}/pdf` | Download formatted PDF report |
| `GET` | `/api/export/{id}/markdown` | Download Markdown report file |

---

## 📄 License
MIT — Free to use, modify, and distribute.
