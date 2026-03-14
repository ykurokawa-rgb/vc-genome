import json
import re
from app.agents.base import BaseAgent

SYSTEM_PROMPT = """
あなたはスタートアップの創業経験を持つシリアルアントレプレナーです。
VCキャピタリストの「投資後の実際の行動」を分析し、伴走スタイルを評価してください。

出力形式（必ずこのJSONのみを返すこと）:
{
  "intervention_style": "<Proactive/Supportive/Observer>",
  "specific_supports": [
    {
      "type": "<Recruiting/Sales_Intro/Mental/Finance/PR>",
      "score": <1-10>,
      "description": "<30文字以内の説明>",
      "evidence_count": <エビデンス件数>
    }
  ],
  "reputation_vibe": "<起業家から見た印象を2つのフレーズで>",
  "weekly_interaction_simulation": "<月曜日にどんなコミュニケーションが起きるか100文字で>",
  "confidence": "<A/B/C/D>"
}

評価のポイント:
- 採用・営業・ファイナンス・メンタルの具体的エビデンスを重視
- 危機時（ダウンラウンド等）の行動を特に評価
- 第三者（起業家）の証言を最重視
- エビデンスがない項目はスコアを低めに設定
"""

class HandsonAnalyst(BaseAgent):
    name = "Hands-on Analyst"
    role = "伴走スタイル特定官"

    async def analyze(self, input_data: dict) -> dict:
        name = input_data.get("name", "")
        affiliation = input_data.get("affiliation", "")
        fact_result = input_data.get("fact_result", {})
        philosophy_result = input_data.get("philosophy_result", {})

        self.log(f"Analyzing hands-on style for: {name}")

        personality_type = philosophy_result.get("personality_type", "バランス型")
        alias = philosophy_result.get("ai_generated_alias", name)

        user_message = f"""
以下のキャピタリストの伴走スタイルを分析してください。

対象者: {name}（{alias}）
所属: {affiliation}
性格タイプ: {personality_type}

投資領域: {', '.join([s.get('sector','') for s in fact_result.get('top_sectors', [])])}
得意フェーズ: Seed {fact_result.get('stage_distribution', {}).get('Seed', 0)}%

この情報から、このキャピタリストが投資後にどのような伴走を行うかを
具体的かつリアルに分析してください。
"""

        try:
            response = self.call_claude(SYSTEM_PROMPT, user_message, max_tokens=1200)
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response)
            self.log(f"Hands-on style: {result.get('intervention_style', '?')}")
            return result
        except json.JSONDecodeError as e:
            self.log(f"JSON parse error: {e}")
            return {
                "intervention_style": "Supportive",
                "specific_supports": [
                    {"type": "Recruiting", "score": 5, "description": "採用支援実績あり", "evidence_count": 0},
                    {"type": "Sales_Intro", "score": 5, "description": "営業導入可能", "evidence_count": 0},
                ],
                "reputation_vibe": "誠実・丁寧",
                "weekly_interaction_simulation": "週次での状況確認とアドバイスが中心。",
                "confidence": "D"
            }
