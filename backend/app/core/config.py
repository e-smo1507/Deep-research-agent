import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

# Check if running on Vercel (read-only filesystem, /tmp is writable)
is_vercel = os.getenv("VERCEL") == "1" or "VERCEL" in os.environ
default_db_url = "sqlite+aiosqlite:////tmp/research.db" if is_vercel else "sqlite+aiosqlite:///./research.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Deep Research Agent Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", default_db_url)
    
    # API Keys
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    DEFAULT_MODEL_PROVIDER: str = os.getenv("DEFAULT_MODEL_PROVIDER", "groq")
    DEFAULT_MODEL_NAME: str = os.getenv("DEFAULT_MODEL_NAME", "llama-3.3-70b-versatile")
    
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
