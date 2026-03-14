from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_agents_status():
    return {
        "active_agents": 12,
        "today_analyses": 34,
        "total_sources": 12847,
        "agents": [
            {"name": "Fact Investigator", "status": "idle", "processed_today": 8},
            {"name": "Philosophy Profiler", "status": "running", "processed_today": 8},
            {"name": "Hands-on Analyst", "status": "idle", "processed_today": 7},
            {"name": "Freshness Guard", "status": "idle", "processed_today": 7},
        ]
    }
