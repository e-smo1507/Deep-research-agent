import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.research import ResearchSession
from app.models.studio import ResearchMedia

router = APIRouter(prefix="/media", tags=["media"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/{session_id}")
async def upload_research_media(
    session_id: str,
    file: UploadFile = File(...),
    caption: str = Form(""),
    figure_num: str = Form(""),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    ext = os.path.splitext(file.filename)[-1].lower() or ".png"
    unique_filename = f"{session_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"/api/media/files/{unique_filename}"

    media_record = ResearchMedia(
        id=str(uuid.uuid4()),
        session_id=session_id,
        filename=file.filename,
        file_url=file_url,
        caption=caption.strip() or f"Figure attached to {session.topic}",
        figure_num=figure_num.strip() or "Figure 1",
        media_type="image"
    )
    db.add(media_record)
    await db.commit()

    return {
        "id": media_record.id,
        "filename": media_record.filename,
        "file_url": media_record.file_url,
        "caption": media_record.caption,
        "figure_num": media_record.figure_num,
        "uploaded_at": media_record.uploaded_at.isoformat()
    }

@router.get("/files/{filename}")
async def get_uploaded_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.get("/{session_id}")
async def get_session_media(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchMedia).where(ResearchMedia.session_id == session_id))
    items = result.scalars().all()
    return [
        {
            "id": m.id,
            "filename": m.filename,
            "file_url": m.file_url,
            "caption": m.caption,
            "figure_num": m.figure_num,
            "uploaded_at": m.uploaded_at.isoformat()
        }
        for m in items
    ]

@router.delete("/item/{media_id}")
async def delete_media_item(media_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResearchMedia).where(ResearchMedia.id == media_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Media item not found")
    await db.delete(item)
    await db.commit()
    return {"message": "Media item deleted successfully"}
