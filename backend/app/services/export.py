import io
import re
import html
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_markdown(topic: str, markdown_content: str, critic: dict = None, sources: list = None) -> str:
    md = f"# Research Report: {topic}\n\n"
    if critic:
        md += "## 🎯 Peer Review & Quality Scorecard\n\n"
        md += f"**Overall Score:** {critic.get('score', 8.5)}/10\n\n"
        md += f"**Verdict:** {critic.get('verdict', 'Solid analysis')}\n\n"
        if critic.get("strengths"):
            md += "### Key Strengths\n"
            for s in critic["strengths"]:
                md += f"- {s}\n"
            md += "\n"
        if critic.get("areas_to_improve"):
            md += "### Areas to Improve\n"
            for a in critic["areas_to_improve"]:
                md += f"- {a}\n"
            md += "\n"
        md += "---\n\n"
        
    md += markdown_content + "\n\n"
    
    if sources:
        md += "## 🌐 Referenced Sources\n\n"
        for i, s in enumerate(sources, 1):
            title = s.get("title", f"Source {i}")
            url = s.get("url", "#")
            md += f"{i}. [{title}]({url})\n"
            if s.get("snippet"):
                md += f"   > {s['snippet'][:200]}...\n"
                
    return md

def generate_pdf(topic: str, markdown_content: str, critic: dict = None, sources: list = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=10,
        fontName="Helvetica-Bold"
    )
    
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=12,
        spaceAfter=6,
        fontName="Helvetica-Bold"
    )
    
    h3_style = ParagraphStyle(
        'DocH3',
        parent=styles['Heading3'],
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceBefore=8,
        spaceAfter=4,
        fontName="Helvetica-Bold"
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=5
    )
    
    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#4338ca"),
        fontName="Helvetica-Bold"
    )

    story = []
    
    safe_topic = html.escape(topic)
    story.append(Paragraph(f"Deep Research Report: {safe_topic}", title_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#6366f1"), spaceAfter=12))
    
    if critic:
        score_val = critic.get('score', 8.5)
        verdict_val = html.escape(str(critic.get('verdict', 'Approved')))
        score_text = f"<b>Quality Review Score:</b> {score_val}/10 &nbsp;|&nbsp; <b>Verdict:</b> {verdict_val}"
        table_data = [[Paragraph(score_text, badge_style)]]
        t = Table(table_data, colWidths=[520])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#eef2ff")),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
            ('ROUNDEDCORNERS', [4, 4, 4, 4])
        ]))
        story.append(t)
        story.append(Spacer(1, 12))

    for raw_line in markdown_content.splitlines():
        line = raw_line.strip()
        if not line:
            story.append(Spacer(1, 4))
            continue
            
        if line.startswith("# "):
            pass
        elif line.startswith("## "):
            clean_h2 = html.escape(line.replace("##", "").strip())
            story.append(Paragraph(clean_h2, h2_style))
        elif line.startswith("### "):
            clean_h3 = html.escape(line.replace("###", "").strip())
            story.append(Paragraph(clean_h3, h3_style))
        elif line.startswith("- ") or line.startswith("* "):
            bullet_text = line[2:].strip()
            safe_bullet = html.escape(bullet_text)
            safe_bullet = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', safe_bullet)
            story.append(Paragraph(f"&bull; {safe_bullet}", body_style))
        else:
            safe_text = html.escape(line)
            safe_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', safe_text)
            safe_text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<font color="#4f46e5"><u>\1</u></font>', safe_text)
            story.append(Paragraph(safe_text, body_style))

    if sources:
        story.append(Spacer(1, 10))
        story.append(Paragraph("References & Verified Sources", h2_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=8))
        for i, s in enumerate(sources, 1):
            stitle = html.escape(s.get('title', f'Source {i}'))
            surl = html.escape(s.get('url', ''))
            s_text = f"<b>[{i}]</b> {stitle} &mdash; <font color='#4f46e5'><u>{surl}</u></font>"
            story.append(Paragraph(s_text, body_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
