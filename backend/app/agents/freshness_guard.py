import json
import re
from datetime import datetime, timedelta
from app.agents.base import BaseAgent

SYSTEM_PROMPT = """
あなたは冷徹なデータ監査官です。
複数のエージェントが収集した情報の「信頼性」と「鮮度」を検証してください。

出力形式（必ずこのJSONのみを返すこと）:
{
  "overall_confidence_score": <0.0-1.0>,
  "data_freshness_level": "<A/B/C/D>",
  "conflicting_data": [
    {
      "issue": "<矛盾の内容>",
      "resolution": "<どう解決したか>"
    }
  ],
  "next_refresh_date": "<YYYY-MM-DD形式の次回再解析推奨日>",
  "audit_notes": "<監査員からの総評（100文字以内）>",
  "final_radar": {
    "strategy": <1-10>,
    "empathy": <1-10>,
    "network": <1-10>,
    "expertise": <1-10>,
    "speed": <1-10>
  }
}

検証基準:
- 公式情報（プレスリリース等）: 重み高
- SNS発言: 重み中
- 2年以上前の情報: 重み低（0.3倍）
- 矛盾がある場合は最新情報を優先
- 信頼スコアA=0.85以上, B=0.7-0.85, C=0.5-0.7, D=0.5未満
"""

class FreshnessGuard(BaseAgent):
    name = "Freshness Guard"
    role = "鮮度・矛盾検知官"

    async def analyze(self, input_data: dict) -> dict:
        name = input_data.get("name", "")
        fact_result = input_data.get("fact_result", {})
        philosophy_result = input_data.get("philosophy_result", {})
        handson_result = input_data.get("handson_result", {})

        self.log(f"Auditing data for: {name}")

        fact_confidence = fact_result.get("confidence", "D")
        philosophy_confidence = philosophy_result.get("confidence", "D")
        handson_confidence = handson_result.get("confidence", "D")

        user_message = f"""
以下の3エージェントの解析結果を統合・検証してください。

対象者: {name}

Fact Investigator の結果:
- 信頼度: {fact_confidence}
- 投資先数: {fact_result.get('total_funded_startups', 0)}社
- 主要領域: {fact_result.get('top_sectors', [])}

Philosophy Profiler の結果:
- 信頼度: {philosophy_confidence}
- 二つ名: {philosophy_result.get('ai_generated_alias', '未生成')}
- 性格: {philosophy_result.get('personality_type', '不明')}

Hands-on Analyst の結果:
- 信頼度: {handson_confidence}
- スタイル: {handson_result.get('intervention_style', '不明')}

これらの情報を統合して、最終的な信頼性スコアと矛盾点を報告してください。
"""

        try:
            response = self.call_claude(SYSTEM_PROMPT, user_message, max_tokens=1000)
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response)
            self.log(f"Audit complete. Score: {result.get('overall_confidence_score', 0)}")
            return result
        except json.JSONDecodeError as e:
            self.log(f"JSON parse error: {e}")
            next_refresh = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
            return {
                "overall_confidence_score": 0.5,
                "data_freshness_level": "C",
                "conflicting_data": [],
                "next_refresh_date": next_refresh,
                "audit_notes": "情報が限定的なため、追加ソースの提供を推奨します。",
                "final_radar": {"strategy": 5, "empathy": 5, "network": 5, "expertise": 5, "speed": 5}
            }
