from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc

from app.core.database import get_db
from app.models.research import ResearchSession

router = APIRouter(prefix="/history", tags=["history"])

@router.get("")
async def get_history(
    q: str = Query(None, description="Search query"),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(ResearchSession).order_by(desc(ResearchSession.created_at)).limit(limit)
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    data = []
    for s in sessions:
        if q and q.lower() not in s.topic.lower():
            continue
        data.append({
            "id": s.id,
            "topic": s.topic,
            "depth": s.depth,
            "status": s.status,
            "created_at": s.created_at.isoformat(),
            "score": s.report.critic_score if s.report else None
        })
    return data

@router.delete("/{session_id}")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    await db.delete(session)
    await db.commit()
    return {"message": "Session deleted successfully"}

@router.delete("")
async def clear_all_history(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(ResearchSession))
    await db.commit()
    return {"message": "All history cleared"}
