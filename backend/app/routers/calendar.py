from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import anthropic
import json
import re
from app.core.config import settings

router = APIRouter()
client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

CALENDAR_SYSTEM = """
あなたはVCキャピタリストの行動分析専門家です。
Googleカレンダーの予定タイトルリストから、このキャピタリストが「今どの領域に最もリソースを割いているか」を分析してください。

出力形式（JSONのみ）:
{
  "focus_areas": [
    {"area": "<領域名>", "percentage": <比率0-100>, "event_count": <件数>, "insight": "<20文字以内の洞察>"}
  ],
  "current_top_focus": "<最注力領域を一言で>",
  "sourcing_vs_handson": {"sourcing": <比率>, "handson": <比率>, "operations": <比率>},
  "activity_summary": "<直近30日の行動パターン要約（80文字以内）>",
  "next_move_prediction": "<次に動きそうな領域の予測>"
}
"""

class CalendarAnalysisRequest(BaseModel):
    events: list[dict]  # [{title: str, duration_minutes: int, date: str}]
    vc_name: str

class CalendarAnalysisResponse(BaseModel):
    focus_areas: list[dict]
    current_top_focus: str
    sourcing_vs_handson: dict
    activity_summary: str
    next_move_prediction: str

@router.post("/analyze", response_model=dict)
async def analyze_calendar(request: CalendarAnalysisRequest):
    if len(request.events) > 200:
        raise HTTPException(status_code=400, detail="Too many events (max 200)")

    event_list = "\n".join([
        f"- {e.get('title', '不明')} ({e.get('duration_minutes', 60)}分, {e.get('date', '')})"
        for e in request.events[:100]
    ])

    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        system=CALENDAR_SYSTEM,
        messages=[{
            "role": "user",
            "content": f"キャピタリスト: {request.vc_name}\n\n直近30日の予定:\n{event_list}"
        }]
    )

    text = msg.content[0].text
    m = re.search(r'\{.*\}', text, re.DOTALL)
    if not m:
        raise HTTPException(status_code=500, detail="Failed to parse calendar analysis")

    return json.loads(m.group())

# Demo endpoint with mock data
@router.get("/demo")
async def calendar_demo():
    """Mock calendar analysis for demo purposes"""
    return {
        "focus_areas": [
            {"area": "物流DX面談", "percentage": 35, "event_count": 12, "insight": "新規ソーシング活発"},
            {"area": "AI採用支援", "percentage": 25, "event_count": 8, "insight": "既存投資先を全力支援"},
            {"area": "新規ソーシング", "percentage": 20, "event_count": 7, "insight": "幅広く探索中"},
            {"area": "LP対応", "percentage": 15, "event_count": 5, "insight": "期末報告シーズン"},
            {"area": "その他", "percentage": 5, "event_count": 3, "insight": ""},
        ],
        "current_top_focus": "物流DX × AI",
        "sourcing_vs_handson": {"sourcing": 55, "handson": 30, "operations": 15},
        "activity_summary": "直近30日は物流DX領域の新規面談が急増。既存投資先の採用支援にも積極的に工数を割いている。",
        "next_move_prediction": "素材×AI領域への参入を検討中の可能性が高い"
    }
