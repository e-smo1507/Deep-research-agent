from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
import io
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.research import ResearchSession
from app.services.export import generate_pdf, generate_markdown

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/{session_id}/pdf")
async def export_pdf(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session or not session.report:
        raise HTTPException(status_code=404, detail="Research report not ready or not found")
        
    critic = {
        "score": session.report.critic_score,
        "strengths": session.report.critic_strengths,
        "areas_to_improve": session.report.critic_areas_to_improve,
        "verdict": session.report.critic_verdict
    }
    
    pdf_bytes = generate_pdf(
        topic=session.topic,
        markdown_content=session.report.markdown_content,
        critic=critic,
        sources=session.report.sources
    )
    
    filename = f"Research_Report_{session.topic[:30].replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{session_id}/markdown")
async def export_markdown(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session or not session.report:
        raise HTTPException(status_code=404, detail="Research report not ready or not found")
        
    critic = {
        "score": session.report.critic_score,
        "strengths": session.report.critic_strengths,
        "areas_to_improve": session.report.critic_areas_to_improve,
        "verdict": session.report.critic_verdict
    }
    
    md_content = generate_markdown(
        topic=session.topic,
        markdown_content=session.report.markdown_content,
        critic=critic,
        sources=session.report.sources
    )
    
    filename = f"Research_Report_{session.topic[:30].replace(' ', '_')}.md"
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
