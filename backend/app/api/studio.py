import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.research import ResearchSession
from app.models.studio import ResearchMetric, ResearchChart, ResearcherNote

router = APIRouter(prefix="/studio", tags=["studio"])

class NoteCreateRequest(BaseModel):
    title: str = "Key Observation"
    content: str
    tag: str = "hypothesis"

@router.get("/{session_id}/analytics")
async def get_analytics_hub(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    metrics_list = [
        {
            "id": m.id,
            "title": m.title,
            "value": m.value,
            "unit": m.unit,
            "change": m.change,
            "trend": m.trend,
            "category": m.category,
            "description": m.description
        } for m in (session.metrics or [])
    ]

    charts_list = [
        {
            "id": c.id,
            "title": c.title,
            "chart_type": c.chart_type,
            "subtitle": c.subtitle,
            "labels": c.labels,
            "series": c.series,
            "insights": c.insights
        } for c in (session.charts or [])
    ]

    return {
        "session_id": session_id,
        "metrics": metrics_list,
        "charts": charts_list
    }

@router.get("/{session_id}/notes")
async def get_researcher_notes(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearcherNote).where(ResearcherNote.session_id == session_id))
    notes = result.scalars().all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "tag": n.tag,
            "updated_at": n.updated_at.isoformat()
        } for n in notes
    ]

@router.post("/{session_id}/notes")
async def create_researcher_note(session_id: str, req: NoteCreateRequest, db: AsyncSession = Depends(get_db)):
    note = ResearcherNote(
        id=str(uuid.uuid4()),
        session_id=session_id,
        title=req.title,
        content=req.content,
        tag=req.tag
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "tag": note.tag,
        "updated_at": note.updated_at.isoformat()
    }

@router.delete("/notes/{note_id}")
async def delete_researcher_note(note_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearcherNote).where(ResearcherNote.id == note_id))
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()
    return {"message": "Note deleted successfully"}
