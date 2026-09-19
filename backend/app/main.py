from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.research import router as research_router
from app.api.history import router as history_router
from app.api.chat import router as chat_router
from app.api.export import router as export_router
from app.api.media import router as media_router
from app.api.studio import router as studio_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Lifespan DB init warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(research_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(export_router, prefix=settings.API_V1_STR)
app.include_router(media_router, prefix=settings.API_V1_STR)
app.include_router(studio_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Deep Research Agent Platform & Studio API is running",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy", "platform": "Deep Research Agent Platform"}
