import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic = Column(String(512), nullable=False)
    depth = Column(String(32), default="standard")  # fast, standard, deep
    status = Column(String(64), default="pending")  # pending, running, completed, failed
    model_provider = Column(String(64), default="groq")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    report = relationship("ResearchReport", back_populates="session", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    logs = relationship("AgentStepLog", back_populates="session", cascade="all, delete-orphan", order_by="AgentStepLog.timestamp", lazy="selectin")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.timestamp", lazy="selectin")
    
    # Studio & Analytics relationships
    metrics = relationship("ResearchMetric", back_populates="session", cascade="all, delete-orphan", lazy="selectin")
    charts = relationship("ResearchChart", back_populates="session", cascade="all, delete-orphan", lazy="selectin")
    media_items = relationship("ResearchMedia", back_populates="session", cascade="all, delete-orphan", order_by="ResearchMedia.uploaded_at", lazy="selectin")
    notes = relationship("ResearcherNote", back_populates="session", cascade="all, delete-orphan", order_by="ResearcherNote.updated_at", lazy="selectin")

class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False, unique=True)
    markdown_content = Column(Text, nullable=False)
    critic_score = Column(Float, nullable=True)
    critic_strengths = Column(JSON, nullable=True)
    critic_areas_to_improve = Column(JSON, nullable=True)
    critic_verdict = Column(Text, nullable=True)
    sources = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="report")

class AgentStepLog(Base):
    __tablename__ = "agent_step_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False)
    step = Column(String(64), nullable=False)  # search, scrape, write, critic, analytics, chat
    status = Column(String(64), nullable=False)  # start, progress, complete, error
    message = Column(Text, nullable=True)
    data = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="logs")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False)
    role = Column(String(32), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="messages")

# Import studio models so SQLAlchemy registers them with Base.metadata
from app.models.studio import ResearchMetric, ResearchChart, ResearchMedia, ResearcherNote
