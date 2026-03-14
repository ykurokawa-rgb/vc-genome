from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
import anthropic as ant
import json
import uuid
import re
from app.core.config import settings

router = APIRouter()


class SimulateRequest(BaseModel):
    business_domain: str
    phase: str  # Seed/PreA/SeriesA
    summary: str
    needs: list[str]  # ['採用支援', '営業導入', etc]
    founder_logic_ratio: int  # 0-100 (0=感情的, 100=論理的)
    founder_bold_ratio: int   # 0-100 (0=慎重, 100=大胆)


# In-memory job store (replace with Redis in production)
simulation_jobs: dict = {}

MATCH_SYSTEM_PROMPT = """
あなたはVCマッチングの専門AIです。
スタートアップの情報とVCキャピタリストのゲノムデータを比較し、相性スコアと理由を算出してください。

出力形式（JSONのみ）:
{
  "match_score": <0-100>,
  "match_reasons": [
    {"category": "<領域/フェーズ/ニーズ/性格>", "score": <0-100>, "explanation": "<30文字以内>"}
  ],
  "summary": "<なぜ相性が良い/悪いか、50文字以内>",
  "caution": "<注意点があれば、なければnull>"
}
"""


async def run_simulation(job_id: str, request_data: dict):
    """Background task: simulate VC matching"""
    client = ant.Anthropic(api_key=settings.anthropic_api_key)

    simulation_jobs[job_id]["status"] = "running"

    # Mock VC data (in production, fetch from DB)
    mock_vcs = [
        {
            "id": "vc-001",
            "name": "木下慶彦",
            "affiliation": "ANRI",
            "alias": "SaaS成長の番人",
            "sectors": ["SaaS", "AI"],
            "stage": "Seed",
            "hands_on": ["採用支援", "営業導入"],
            "personality": "バランス型",
            "radar": {
                "strategy": 8,
                "empathy": 7,
                "network": 9,
                "expertise": 8,
                "speed": 8,
            },
        },
        {
            "id": "vc-002",
            "name": "赤浦徹",
            "affiliation": "インキュベイトファンド",
            "alias": "シードの父",
            "sectors": ["B2B SaaS", "HR Tech"],
            "stage": "Seed",
            "hands_on": ["メンタルケア", "採用支援"],
            "personality": "情熱派",
            "radar": {
                "strategy": 7,
                "empathy": 9,
                "network": 8,
                "expertise": 7,
                "speed": 9,
            },
        },
        {
            "id": "vc-003",
            "name": "渡辺洋行",
            "affiliation": "Coral Capital",
            "alias": "グローバル視点のブリッジ",
            "sectors": ["SaaS", "AI", "グローバル"],
            "stage": "PreA",
            "hands_on": ["営業導入", "海外展開"],
            "personality": "論理派",
            "radar": {
                "strategy": 9,
                "empathy": 6,
                "network": 9,
                "expertise": 9,
                "speed": 7,
            },
        },
        {
            "id": "vc-004",
            "name": "宮田拓弥",
            "affiliation": "Scrum Ventures",
            "alias": "シリコンバレー直結の橋渡し人",
            "sectors": ["Deep Tech", "AI", "グローバル"],
            "stage": "Seed",
            "hands_on": ["海外展開", "営業導入"],
            "personality": "バランス型",
            "radar": {
                "strategy": 9,
                "empathy": 7,
                "network": 9,
                "expertise": 9,
                "speed": 8,
            },
        },
        {
            "id": "vc-005",
            "name": "孫泰蔵",
            "affiliation": "Mistletoe",
            "alias": "哲学を持つ宇宙人",
            "sectors": ["Deep Tech", "社会課題", "Web3"],
            "stage": "Seed",
            "hands_on": ["メンタルケア", "PR"],
            "personality": "情熱派",
            "radar": {
                "strategy": 10,
                "empathy": 8,
                "network": 9,
                "expertise": 8,
                "speed": 6,
            },
        },
    ]

    results = []
    for vc in mock_vcs:
        simulation_jobs[job_id]["progress"] = len(results) / len(mock_vcs) * 90

        user_msg = f"""
スタートアップ情報:
- 事業ドメイン: {request_data['business_domain']}
- フェーズ: {request_data['phase']}
- 事業概要: {request_data['summary']}
- VCへの期待: {', '.join(request_data.get('needs', []))}
- 経営者タイプ: 論理性{request_data.get('founder_logic_ratio', 50)}% / 大胆性{request_data.get('founder_bold_ratio', 50)}%

VCゲノムデータ:
- 名前: {vc['name']}（{vc['affiliation']}）
- 二つ名: {vc['alias']}
- 得意領域: {', '.join(vc['sectors'])}
- 得意フェーズ: {vc['stage']}
- 伴走スタイル: {', '.join(vc['hands_on'])}
- 性格: {vc['personality']}
"""
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=600,
            system=MATCH_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_msg}],
        )

        text = msg.content[0].text
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                score_data = json.loads(match.group())
                results.append(
                    {
                        "vc_id": vc["id"],
                        "vc_name": vc["name"],
                        "vc_affiliation": vc["affiliation"],
                        "vc_alias": vc["alias"],
                        "vc_radar": vc["radar"],
                        "match_score": score_data.get("match_score", 50),
                        "match_reasons": score_data.get("match_reasons", []),
                        "summary": score_data.get("summary", ""),
                        "caution": score_data.get("caution"),
                    }
                )
            except Exception:
                pass

    results.sort(key=lambda x: x["match_score"], reverse=True)
    simulation_jobs[job_id]["status"] = "completed"
    simulation_jobs[job_id]["progress"] = 100
    simulation_jobs[job_id]["results"] = results


@router.post("/simulate")
async def start_simulation(request: SimulateRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    simulation_jobs[job_id] = {
        "status": "running",
        "progress": 0,
        "results": [],
        "request": request.model_dump(),
    }
    background_tasks.add_task(run_simulation, job_id, request.model_dump())
    return {"jobId": job_id}


@router.get("/simulate/{job_id}")
async def get_simulation_status(job_id: str):
    if job_id not in simulation_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return simulation_jobs[job_id]
