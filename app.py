import streamlit as st
import time
from pipeline import run_research_pipeline

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Research Pipeline",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* Reset & base */
*, *::before, *::after { box-sizing: border-box; }

html, body, [data-testid="stAppViewContainer"] {
    background: #0a0a0f;
    color: #e8e6f0;
    font-family: 'Space Grotesk', sans-serif;
}

[data-testid="stAppViewContainer"] {
    background: #0a0a0f;
}

[data-testid="stHeader"] { background: transparent; }

/* Hide default streamlit chrome */
#MainMenu, footer, [data-testid="stToolbar"] { visibility: hidden; }

/* ── Hero ── */
.hero {
    text-align: center;
    padding: 3.5rem 1rem 2rem;
    position: relative;
}

.hero-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    color: #7c6af7;
    text-transform: uppercase;
    margin-bottom: 1rem;
}

.hero-title {
    font-size: clamp(2.4rem, 5vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
    color: #f0eeff;
    margin: 0 0 0.75rem;
    letter-spacing: -0.02em;
}

.hero-title span {
    color: #7c6af7;
}

.hero-sub {
    font-size: 1.05rem;
    color: #8b88a0;
    font-weight: 300;
    max-width: 520px;
    margin: 0 auto 2.5rem;
    line-height: 1.6;
}

/* ── Pipeline steps indicator ── */
.steps-row {
    display: flex;
    justify-content: center;
    gap: 0;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
}

.step-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 500;
    color: #4a4860;
    border-top: 1px solid #1e1c2e;
    border-bottom: 1px solid #1e1c2e;
    background: #0f0e1a;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.step-pill:first-child {
    border-left: 1px solid #1e1c2e;
    border-radius: 6px 0 0 6px;
}

.step-pill:last-child {
    border-right: 1px solid #1e1c2e;
    border-radius: 0 6px 6px 0;
}

.step-pill.active {
    color: #7c6af7;
    background: #16132a;
    border-color: #3d2fa0;
}

.step-pill.done {
    color: #4ecb71;
    background: #0b1a12;
    border-color: #1a4a2a;
}

.step-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
}

/* ── Search input area ── */
.search-container {
    max-width: 680px;
    margin: 0 auto 3rem;
}

/* Override Streamlit text input */
[data-testid="stTextInput"] input {
    background: #13111f !important;
    border: 1px solid #2a2640 !important;
    border-radius: 10px !important;
    color: #f0eeff !important;
    font-family: 'Space Grotesk', sans-serif !important;
    font-size: 1rem !important;
    padding: 0.9rem 1.2rem !important;
    transition: border-color 0.2s !important;
}

[data-testid="stTextInput"] input:focus {
    border-color: #7c6af7 !important;
    box-shadow: 0 0 0 3px rgba(124, 106, 247, 0.15) !important;
    outline: none !important;
}

[data-testid="stTextInput"] input::placeholder { color: #4a4860 !important; }

[data-testid="stTextInput"] label {
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.7rem !important;
    letter-spacing: 0.15em !important;
    color: #5a5575 !important;
    text-transform: uppercase !important;
    margin-bottom: 0.4rem !important;
}

/* Override Streamlit button */
[data-testid="stButton"] button {
    background: #7c6af7 !important;
    color: #fff !important;
    border: none !important;
    border-radius: 8px !important;
    font-family: 'Space Grotesk', sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
    padding: 0.75rem 2rem !important;
    width: 100% !important;
    cursor: pointer !important;
    transition: background 0.2s, transform 0.1s !important;
    letter-spacing: 0.01em !important;
}

[data-testid="stButton"] button:hover {
    background: #6857e0 !important;
}

[data-testid="stButton"] button:active {
    transform: scale(0.99) !important;
}

/* ── Result cards ── */
.result-card {
    background: #0f0e1a;
    border: 1px solid #1e1c2e;
    border-radius: 12px;
    padding: 1.5rem 1.75rem;
    margin-bottom: 1.25rem;
    position: relative;
    overflow: hidden;
}

.result-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: var(--accent, #7c6af7);
    border-radius: 3px 0 0 3px;
}

.result-card.search  { --accent: #7c6af7; }
.result-card.scrape  { --accent: #f76a8f; }
.result-card.report  { --accent: #4ecb71; }
.result-card.critic  { --accent: #f7c16a; }

.card-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
}

.card-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent, #7c6af7);
}

.card-icon {
    font-size: 1rem;
}

.card-content {
    font-size: 0.92rem;
    line-height: 1.75;
    color: #c8c5dc;
    white-space: pre-wrap;
    word-break: break-word;
}

/* ── Progress / status ── */
.status-line {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: #5a5575;
    text-align: center;
    margin: 1rem 0;
}

/* ── Streamlit expander override ── */
[data-testid="stExpander"] {
    background: #0f0e1a !important;
    border: 1px solid #1e1c2e !important;
    border-radius: 10px !important;
    margin-bottom: 0.75rem !important;
}

[data-testid="stExpander"] summary {
    font-family: 'Space Grotesk', sans-serif !important;
    font-weight: 500 !important;
    color: #c8c5dc !important;
}

/* ── Divider ── */
hr { border-color: #1e1c2e !important; }

/* ── Success / info / error boxes ── */
[data-testid="stAlert"] {
    border-radius: 8px !important;
    font-family: 'Space Grotesk', sans-serif !important;
}

/* ── Example topics chips ── */
.chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.chip {
    background: #13111f;
    border: 1px solid #2a2640;
    border-radius: 999px;
    padding: 0.3rem 0.85rem;
    font-size: 0.78rem;
    color: #8b88a0;
    cursor: default;
    font-family: 'Space Grotesk', sans-serif;
}
</style>
""", unsafe_allow_html=True)


# ── Session state init ─────────────────────────────────────────────────────────
if "results" not in st.session_state:
    st.session_state.results = None
if "running" not in st.session_state:
    st.session_state.running = False
if "current_step" not in st.session_state:
    st.session_state.current_step = -1


# ── Helper: step pills ─────────────────────────────────────────────────────────
def render_steps(current: int):
    steps = ["Search", "Scrape", "Write", "Critique"]
    pills = ""
    for i, s in enumerate(steps):
        if i < current:
            cls = "done"
            dot = "●"
        elif i == current:
            cls = "active"
            dot = "◉"
        else:
            cls = ""
            dot = "○"
        pills += f'<div class="step-pill {cls}"><span class="step-dot"></span>{s}</div>'
    st.markdown(f'<div class="steps-row">{pills}</div>', unsafe_allow_html=True)


# ── Hero ───────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero">
    <div class="hero-label">Multi-Agent System</div>
    <h1 class="hero-title">Deep <span>Research</span> Pipeline</h1>
    <p class="hero-sub">Four specialized AI agents — Search, Scrape, Write, Critique — working in sequence to produce a verified research report.</p>
</div>
""", unsafe_allow_html=True)

# Example chips (cosmetic)
st.markdown("""
<div class="chip-row">
  <span class="chip">Quantum computing</span>
  <span class="chip">CRISPR gene editing</span>
  <span class="chip">Agentic AI systems</span>
  <span class="chip">Dark matter theories</span>
  <span class="chip">Fusion energy</span>
</div>
""", unsafe_allow_html=True)


# ── Input ──────────────────────────────────────────────────────────────────────
col_gap1, col_main, col_gap2 = st.columns([1, 3, 1])
with col_main:
    topic = st.text_input(
        "Research topic",
        placeholder="e.g. Recent advances in large language models...",
        label_visibility="visible",
    )
    run_btn = st.button("Run Research Pipeline →", use_container_width=True)


# ── Run ────────────────────────────────────────────────────────────────────────
if run_btn:
    if not topic.strip():
        st.warning("Please enter a research topic first.")
    else:
        st.session_state.results = None
        st.session_state.running = True

        col_gap1, col_main, col_gap2 = st.columns([1, 3, 1])
        with col_main:
            st.markdown("<hr>", unsafe_allow_html=True)

            # Live step feedback placeholders
            step_placeholder = st.empty()
            status_placeholder = st.empty()
            progress_bar = st.progress(0)

            STEPS = [
                ("Search agent is scanning the web…", 0.10),
                ("Reader agent is scraping top sources…", 0.45),
                ("Writer is drafting the report…", 0.70),
                ("Critic is reviewing the report…", 0.90),
            ]

            results_container = st.container()

            try:
                # We monkey-patch the pipeline to capture intermediate state
                # by running it directly and showing steps via progress
                for idx, (msg, _) in enumerate(STEPS):
                    step_placeholder.markdown(
                        f'<div class="steps-row">' +
                        "".join(
                            f'<div class="step-pill {"active" if i == idx else "done" if i < idx else ""}">'
                            f'<span class="step-dot"></span>'
                            f'{"Search" if i == 0 else "Scrape" if i == 1 else "Write" if i == 2 else "Critique"}</div>'
                            for i in range(4)
                        ) +
                        '</div>',
                        unsafe_allow_html=True
                    )
                    status_placeholder.markdown(
                        f'<p class="status-line">// {msg}</p>',
                        unsafe_allow_html=True
                    )
                    progress_bar.progress(STEPS[idx][1])
                    break  # only show first step before actual run

                # Run the full pipeline (blocking)
                state = run_research_pipeline(topic.strip())
                st.session_state.results = state

                # Done
                step_placeholder.markdown(
                    '<div class="steps-row">' +
                    "".join(
                        f'<div class="step-pill done"><span class="step-dot"></span>'
                        f'{"Search" if i == 0 else "Scrape" if i == 1 else "Write" if i == 2 else "Critique"}</div>'
                        for i in range(4)
                    ) + '</div>',
                    unsafe_allow_html=True
                )
                status_placeholder.markdown(
                    '<p class="status-line">// Pipeline complete ✓</p>',
                    unsafe_allow_html=True
                )
                progress_bar.progress(1.0)

            except Exception as e:
                progress_bar.empty()
                step_placeholder.empty()
                status_placeholder.empty()
                st.error(f"Pipeline error: {e}")
                st.session_state.running = False


# ── Results ────────────────────────────────────────────────────────────────────
if st.session_state.results:
    state = st.session_state.results
    st.markdown("<br>", unsafe_allow_html=True)

    # ── Final report (prominent) ──
    st.markdown("""
    <div class="result-card report">
        <div class="card-header">
            <span class="card-icon">📄</span>
            <span class="card-label">Final Report</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    report_text = state.get("report", "")
    if hasattr(report_text, "content"):
        report_text = report_text.content
    st.markdown(
        f"<div class='result-card report' style='margin-top:-1rem;'>"
        f"<div class='card-content'>{report_text}</div></div>",
        unsafe_allow_html=True
    )

    # ── Critic feedback ──
    st.markdown("""
    <div class="result-card critic">
        <div class="card-header">
            <span class="card-icon">🧐</span>
            <span class="card-label">Critic Feedback</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    feedback_text = state.get("feedback", "")
    if hasattr(feedback_text, "content"):
        feedback_text = feedback_text.content
    st.markdown(
        f"<div class='result-card critic' style='margin-top:-1rem;'>"
        f"<div class='card-content'>{feedback_text}</div></div>",
        unsafe_allow_html=True
    )

    # ── Raw sources (collapsed by default) ──
    with st.expander("🔍  Search results (raw)"):
        search_text = state.get("search_results", "")
        if hasattr(search_text, "content"):
            search_text = search_text.content
        st.markdown(
            f"<div class='card-content'>{search_text}</div>",
            unsafe_allow_html=True
        )

    with st.expander("🕷️  Scraped content (raw)"):
        scrape_text = state.get("scraped_content", "")
        if hasattr(scrape_text, "content"):
            scrape_text = scrape_text.content
        st.markdown(
            f"<div class='card-content'>{scrape_text}</div>",
            unsafe_allow_html=True
        )

    # ── Download ──
    st.markdown("<br>", unsafe_allow_html=True)
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        report_str = str(report_text)
        feedback_str = str(feedback_text)
        download_content = (
            f"# Research Report: {topic}\n\n"
            f"## Report\n\n{report_str}\n\n"
            f"---\n\n## Critic Feedback\n\n{feedback_str}\n"
        )
        st.download_button(
            label="⬇  Download report as .md",
            data=download_content,
            file_name=f"research_{topic[:30].replace(' ', '_')}.md",
            mime="text/markdown",
            use_container_width=True,
        )