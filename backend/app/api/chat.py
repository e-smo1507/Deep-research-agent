from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.research import ResearchSession, ChatMessage
from app.services.agents import get_chat_chain, safe_invoke

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/{session_id}")
async def send_chat_message(session_id: str, req: ChatRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=req.message.strip()
    )
    db.add(user_msg)
    await db.commit()

    # Context from report & sources
    report_text = session.report.markdown_content if session.report else "No report generated yet."
    sources_summary = "\n".join([f"- {s.get('title')}: {s.get('snippet', '')}" for s in (session.report.sources or [])]) if session.report else ""

    chat_chain = get_chat_chain()
    try:
        reply_text = safe_invoke(chat_chain, {
            "report": report_text,
            "context": sources_summary,
            "question": req.message
        })
    except Exception as e:
        reply_text = f"Based on the research report for '{session.topic}', here is the key context: {report_text[:300]}..."

    assistant_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=reply_text
    )
    db.add(assistant_msg)
    await db.commit()

    return {
        "reply": reply_text,
        "timestamp": assistant_msg.timestamp.isoformat()
    }

@router.get("/{session_id}")
async def get_chat_history(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "timestamp": m.timestamp.isoformat()
        } for m in session.messages
    ]
