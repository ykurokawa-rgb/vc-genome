from sqlalchemy import Column, String, Integer, Float, JSON, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class VCGenome(Base):
    __tablename__ = "vc_genomes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    affiliation = Column(String(200))
    ai_generated_alias = Column(String(200))

    # Genome Stats
    radar_strategy = Column(Integer, default=0)
    radar_empathy = Column(Integer, default=0)
    radar_network = Column(Integer, default=0)
    radar_expertise = Column(Integer, default=0)
    radar_speed = Column(Integer, default=0)

    # Investment Data
    total_funded_startups = Column(Integer, default=0)
    top_sectors = Column(JSON, default=[])
    stage_distribution = Column(JSON, default={})
    notable_exits = Column(JSON, default=[])

    # Philosophy
    core_philosophies = Column(JSON, default=[])

    # Hands-on DNA
    hands_on_style = Column(String(100))
    specific_supports = Column(JSON, default=[])
    reputation_vibe = Column(Text)

    # Metadata
    overall_confidence_score = Column(Float, default=0.0)
    data_freshness_level = Column(String(5), default="D")
    source_count = Column(Integer, default=0)
    analysis_version = Column(String(20), default="v1.0")

    # Raw genome JSON
    raw_genome = Column(JSON, default={})

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class GenomeJob(Base):
    __tablename__ = "genome_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vc_genome_id = Column(UUID(as_uuid=True), nullable=True)
    status = Column(String(20), default="running")  # running, completed, failed
    input_data = Column(JSON, default={})
    agent_statuses = Column(JSON, default={})
    keywords = Column(JSON, default=[])
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
