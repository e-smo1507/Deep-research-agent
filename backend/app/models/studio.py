import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class ResearchMetric(Base):
    __tablename__ = "research_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False)
    title = Column(String(256), nullable=False)
    value = Column(String(64), nullable=False)
    unit = Column(String(32), nullable=True)
    change = Column(String(32), nullable=True)  # e.g., "+18.4%"
    trend = Column(String(16), default="up")   # up, down, neutral
    category = Column(String(64), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="metrics")

class ResearchChart(Base):
    __tablename__ = "research_charts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False)
    title = Column(String(256), nullable=False)
    chart_type = Column(String(32), default="bar")  # bar, line, donut, radar
    subtitle = Column(String(256), nullable=True)
    labels = Column(JSON, nullable=False)           # ["2023", "2024", "2025", "2026"]
    series = Column(JSON, nullable=False)           # [{"name": "Market Size ($B)", "data": [12, 18, 25, 34]}]
    insights = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="charts")

class ResearchMedia(Base):
    __tablename__ = "research_media"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False)
    filename = Column(String(256), nullable=False)
    file_url = Column(String(512), nullable=False)
    caption = Column(Text, nullable=True)
    figure_num = Column(String(32), nullable=True) # e.g. "Figure 1.1"
    media_type = Column(String(64), default="image")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="media_items")

class ResearcherNote(Base):
    __tablename__ = "researcher_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False)
    title = Column(String(256), default="Research Observation")
    content = Column(Text, nullable=False)
    tag = Column(String(64), default="hypothesis") # hypothesis, methodology, limitation, key_finding
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="notes")
