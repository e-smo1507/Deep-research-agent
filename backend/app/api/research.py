import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sse_starlette.sse import EventSourceResponse

from app.core.database import get_db
from app.models.research import ResearchSession
from app.services.pipeline import run_streaming_pipeline

router = APIRouter(prefix="/research", tags=["research"])

class CreateResearchRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    topic: str
    depth: str = "standard"  # fast, standard, deep
    model_provider: str = "groq"

class ResearchResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    session_id: str
    topic: str
    status: str
    depth: str

@router.post("/create", response_model=ResearchResponse)
async def create_research_session(req: CreateResearchRequest, db: AsyncSession = Depends(get_db)):
    if not req.topic or not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required")
        
    session = ResearchSession(
        id=str(uuid.uuid4()),
        topic=req.topic.strip(),
        depth=req.depth,
        status="pending",
        model_provider=req.model_provider
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return ResearchResponse(
        session_id=session.id,
        topic=session.topic,
        status=session.status,
        depth=session.depth
    )

@router.get("/{session_id}/stream")
async def stream_research(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")
        
    return EventSourceResponse(
        run_streaming_pipeline(session.id, session.topic, session.depth, db)
    )

@router.get("/{session_id}")
async def get_research_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    report_data = None
    if session.report:
        report_data = {
            "markdown": session.report.markdown_content,
            "critic": {
                "score": session.report.critic_score,
                "strengths": session.report.critic_strengths,
                "areas_to_improve": session.report.critic_areas_to_improve,
                "verdict": session.report.critic_verdict
            },
            "sources": session.report.sources
        }
        
    logs = [
        {
            "id": l.id,
            "step": l.step,
            "status": l.status,
            "message": l.message,
            "data": l.data,
            "timestamp": l.timestamp.isoformat()
        } for l in session.logs
    ]
    
    return {
        "id": session.id,
        "topic": session.topic,
        "depth": session.depth,
        "status": session.status,
        "created_at": session.created_at.isoformat(),
        "report": report_data,
        "logs": logs
    }
