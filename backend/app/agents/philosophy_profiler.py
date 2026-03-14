import json
import re
from app.agents.base import BaseAgent

SYSTEM_PROMPT = """
あなたは行動心理学に精通したベテランライターです。
VCキャピタリストの発言（note, X, インタビュー）を解析し、その「思想のゲノム」を特定してください。

出力形式（必ずこのJSONのみを返すこと）:
{
  "ai_generated_alias": "<二つ名（例：静かなる情熱のデータサイエンティスト）>",
  "core_philosophies": [
    {
      "tag": "<哲学タグ（例：Founder-First）>",
      "evidence_quote": "<発言の引用または要約（60文字以内）>",
      "source_description": "<出典の説明>"
    }
  ],
  "personality_type": "<論理派/情熱派/バランス型/慎重派>",
  "tone_analysis": {
    "authority_ratio": <0-100>,
    "empathy_ratio": <0-100>,
    "logic_ratio": <0-100>
  },
  "radar_estimates": {
    "strategy": <1-10>,
    "empathy": <1-10>,
    "network": <1-10>,
    "expertise": <1-10>,
    "speed": <1-10>
  },
  "keywords": ["<特徴的なキーワード>"],
  "confidence": "<A/B/C/D>"
}

分析のポイント:
- 頻出単語から「人重視 vs 数字重視」を判定
- 文体の感情温度（高温=情熱的、低温=分析的）を測定
- 「どんな起業家を好むか」のシグナルを抽出
- 二つ名はカッコよく、でも的確に
"""

class PhilosophyProfiler(BaseAgent):
    name = "Philosophy Profiler"
    role = "思想・文体解析官"

    async def analyze(self, input_data: dict) -> dict:
        name = input_data.get("name", "")
        affiliation = input_data.get("affiliation", "")
        philosophy_hint = input_data.get("philosophy", "")
        urls = input_data.get("urls", [])
        fact_result = input_data.get("fact_result", {})

        self.log(f"Profiling philosophy for: {name}")

        context_parts = []
        if philosophy_hint:
            context_parts.append(f"本人の自己申告（投資哲学）: {philosophy_hint}")
        if fact_result.get("investment_philosophy_hints"):
            hints = fact_result["investment_philosophy_hints"]
            context_parts.append(f"Fact調査からのヒント: {', '.join(hints)}")

        context = "\n".join(context_parts) if context_parts else "追加情報なし"

        user_message = f"""
以下のキャピタリストの投資哲学と人柄を解析してください。

対象者: {name}
所属: {affiliation}

追加情報:
{context}

投資実績サマリー:
- 投資先数: {fact_result.get('total_funded_startups', '不明')}社
- 主要領域: {', '.join([s.get('sector','') for s in fact_result.get('top_sectors', [])])}
- 得意フェーズ: {fact_result.get('stage_distribution', {})}

上記の情報から、この投資家の思想・人柄・スタイルを深く分析してください。
情報が少ない場合は、名前や所属VCから推測できることを活用してください。
"""

        try:
            response = self.call_claude(SYSTEM_PROMPT, user_message, max_tokens=1500)
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response)
            self.log(f"Philosophy profiled. Alias: {result.get('ai_generated_alias', '?')}")
            return result
        except json.JSONDecodeError as e:
            self.log(f"JSON parse error: {e}")
            return {
                "ai_generated_alias": f"{name}の投資家",
                "core_philosophies": [],
                "personality_type": "バランス型",
                "tone_analysis": {"authority_ratio": 33, "empathy_ratio": 33, "logic_ratio": 34},
                "radar_estimates": {"strategy": 5, "empathy": 5, "network": 5, "expertise": 5, "speed": 5},
                "keywords": [],
                "confidence": "D"
            }
