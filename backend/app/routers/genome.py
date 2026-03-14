from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import uuid
import json
from app.core.database import get_db
from app.models.genome import VCGenome, GenomeJob
from app.agents.orchestrator import GenomeOrchestrator

router = APIRouter()

class CreateGenomeRequest(BaseModel):
    name: str
    affiliation: str
    urls: list[str] = []
    philosophy: str = ""

async def run_genome_analysis(job_id: str, input_data: dict):
    """Background task for genome analysis"""
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        job = await db.get(GenomeJob, uuid.UUID(job_id))
        if not job:
            return

        async def progress_callback(agent: str, status: str, progress: int, log: str):
            agent_map = {
                "fact": 0, "philosophy": 1, "handson": 2, "freshness": 3
            }
            idx = agent_map.get(agent, 0)

            statuses = json.loads(json.dumps(job.agent_statuses))
            if str(idx) not in statuses:
                statuses[str(idx)] = {"status": "pending", "progress": 0, "logs": []}

            statuses[str(idx)]["status"] = status
            statuses[str(idx)]["progress"] = progress
            statuses[str(idx)]["logs"].append(log)

            job.agent_statuses = statuses
            await db.commit()

        try:
            orchestrator = GenomeOrchestrator(progress_callback=progress_callback)
            genome_data = await orchestrator.run(input_data)

            # Save genome to DB
            vc_genome = VCGenome(
                name=input_data["name"],
                affiliation=input_data["affiliation"],
                ai_generated_alias=genome_data["basic_info"].get("ai_generated_alias", ""),
                radar_strategy=genome_data["genome_stats"]["radar_chart"].get("strategy", 0),
                radar_empathy=genome_data["genome_stats"]["radar_chart"].get("empathy", 0),
                radar_network=genome_data["genome_stats"]["radar_chart"].get("network", 0),
                radar_expertise=genome_data["genome_stats"]["radar_chart"].get("expertise", 0),
                radar_speed=genome_data["genome_stats"]["radar_chart"].get("speed", 0),
                total_funded_startups=genome_data["investment_footprint"].get("total_funded_startups", 0),
                top_sectors=genome_data["investment_footprint"].get("top_sectors", []),
                stage_distribution=genome_data["investment_footprint"].get("stage_distribution", {}),
                notable_exits=genome_data["investment_footprint"].get("notable_exits", []),
                core_philosophies=genome_data["genome_stats"].get("core_philosophies", []),
                hands_on_style=genome_data["hands_on_dna"].get("intervention_style", ""),
                specific_supports=genome_data["hands_on_dna"].get("specific_supports", []),
                reputation_vibe=genome_data["hands_on_dna"].get("reputation_vibe", ""),
                overall_confidence_score=genome_data["metadata"].get("overall_confidence_score", 0.5),
                data_freshness_level=genome_data["metadata"].get("data_freshness_level", "C"),
                source_count=genome_data["metadata"].get("source_count", 0),
                raw_genome=genome_data,
            )
            db.add(vc_genome)
            await db.flush()

            job.status = "completed"
            job.vc_genome_id = vc_genome.id
            job.keywords = genome_data["genome_stats"].get("keywords", [])
            await db.commit()

        except Exception as e:
            print(f"[Error] Genome analysis failed: {e}")
            job.status = "failed"
            job.error_message = str(e)
            await db.commit()

@router.post("/create")
async def create_genome(
    request: CreateGenomeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Initialize agent statuses
    initial_agent_statuses = {
        "0": {"name": "Fact Investigator", "status": "pending", "progress": 0, "logs": []},
        "1": {"name": "Philosophy Profiler", "status": "pending", "progress": 0, "logs": []},
        "2": {"name": "Hands-on Analyst", "status": "pending", "progress": 0, "logs": []},
        "3": {"name": "Freshness Guard", "status": "pending", "progress": 0, "logs": []},
    }

    job = GenomeJob(
        status="running",
        input_data=request.model_dump(),
        agent_statuses=initial_agent_statuses,
        keywords=[],
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(
        run_genome_analysis,
        str(job.id),
        request.model_dump()
    )

    return {"jobId": str(job.id), "status": "running"}

@router.get("/status/{job_id}")
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    try:
        job = await db.get(GenomeJob, uuid.UUID(job_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    agent_configs = [
        {"name": "Fact Investigator", "role": "実績・経歴の番人", "icon": "🔍"},
        {"name": "Philosophy Profiler", "role": "思想・文体解析官", "icon": "🧠"},
        {"name": "Hands-on Analyst", "role": "伴走スタイル特定官", "icon": "🤝"},
        {"name": "Freshness Guard", "role": "鮮度・矛盾検知官", "icon": "⚖️"},
    ]

    agents = []
    for i, config in enumerate(agent_configs):
        agent_status = job.agent_statuses.get(str(i), {})
        agents.append({
            **config,
            "status": agent_status.get("status", "pending"),
            "progress": agent_status.get("progress", 0),
            "logs": agent_status.get("logs", [])[-3:],
        })

    response = {
        "status": job.status,
        "agents": agents,
        "keywords": job.keywords or [],
    }

    if job.status == "completed" and job.vc_genome_id:
        response["vcId"] = str(job.vc_genome_id)

    return response

@router.get("/{vc_id}")
async def get_genome(vc_id: str, db: AsyncSession = Depends(get_db)):
    try:
        genome = await db.get(VCGenome, uuid.UUID(vc_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid genome ID")

    if not genome:
        raise HTTPException(status_code=404, detail="Genome not found")

    return genome.raw_genome

@router.get("/")
async def list_genomes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VCGenome).order_by(VCGenome.created_at.desc()).limit(20))
    genomes = result.scalars().all()
    return [
        {
            "id": str(g.id),
            "name": g.name,
            "affiliation": g.affiliation,
            "ai_generated_alias": g.ai_generated_alias,
            "confidence": g.data_freshness_level,
            "created_at": g.created_at.isoformat() if g.created_at else None,
        }
        for g in genomes
    ]
