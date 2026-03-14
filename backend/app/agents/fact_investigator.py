import json
import httpx
from app.agents.base import BaseAgent
from app.core.config import settings

SYSTEM_PROMPT = """
あなたは世界最高峰のデューデリジェンス専門調査員です。
提供されたテキストとWebの情報から、VCキャピタリストの投資実績を抽出し、
以下のJSON形式で出力してください。

出力形式（必ずこのJSONのみを返すこと）:
{
  "total_funded_startups": <数値>,
  "top_sectors": [
    {"sector": "<業界名>", "percentage": <比率0-100>}
  ],
  "stage_distribution": {
    "Seed": <比率0-100>,
    "PreA": <比率0-100>,
    "SeriesA": <比率0-100>,
    "Other": <比率0-100>
  },
  "notable_exits": ["<会社名 (IPO/M&A)>"],
  "investment_philosophy_hints": ["<投資哲学のヒント>"],
  "confidence": "<A/B/C/D>",
  "sources_used": ["<使用したソースの説明>"]
}

重要なルール:
- 推測による社名の補完は禁止。不明な場合は "Unknown" と記載
- 信頼度はA（公式情報あり）〜D（推測のみ）で評価
- 複数のソースで確認できた情報のみ high_confidence とする
"""

class FactInvestigator(BaseAgent):
    name = "Fact Investigator"
    role = "実績・経歴の番人"

    async def search_web(self, query: str) -> list[dict]:
        """Google Custom Search API でWeb検索"""
        if not settings.google_search_api_key:
            return []

        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": settings.google_search_api_key,
            "cx": settings.google_search_engine_id,
            "q": query,
            "num": 5,
            "lr": "lang_ja",
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=10)
                data = response.json()
                return data.get("items", [])
            except Exception as e:
                self.log(f"Search error: {e}")
                return []

    async def fetch_page_content(self, url: str) -> str:
        """ページのテキストコンテンツを取得"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=10, follow_redirects=True,
                    headers={"User-Agent": "Mozilla/5.0 (compatible; VCGenomeBot/1.0)"})
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'lxml')
                for tag in soup(["script", "style", "nav", "footer"]):
                    tag.decompose()
                return soup.get_text(separator="\n", strip=True)[:3000]
            except Exception as e:
                self.log(f"Fetch error for {url}: {e}")
                return ""

    async def analyze(self, input_data: dict) -> dict:
        name = input_data.get("name", "")
        affiliation = input_data.get("affiliation", "")
        urls = input_data.get("urls", [])

        self.log(f"Analyzing: {name} ({affiliation})")

        # Collect text from provided URLs
        collected_texts = []
        for url in urls:
            if url:
                content = await self.fetch_page_content(url)
                if content:
                    collected_texts.append(f"[URL: {url}]\n{content}")
                    self.log(f"Fetched: {url}")

        # Web search
        search_results = await self.search_web(f"{name} {affiliation} 投資実績 キャピタリスト")
        for result in search_results[:3]:
            snippet = result.get("snippet", "")
            link = result.get("link", "")
            if snippet:
                collected_texts.append(f"[検索結果: {link}]\n{snippet}")

        search_results2 = await self.search_web(f"{name} VC 出資 スタートアップ")
        for result in search_results2[:3]:
            snippet = result.get("snippet", "")
            link = result.get("link", "")
            if snippet:
                collected_texts.append(f"[検索結果2: {link}]\n{snippet}")

        combined_text = "\n\n".join(collected_texts)

        if not combined_text.strip():
            combined_text = f"{name}（{affiliation}）のVC投資家情報。公開情報が限定的です。"

        user_message = f"""
以下のキャピタリストの情報を解析してください。

対象者: {name}
所属: {affiliation}

収集情報:
{combined_text[:8000]}
"""

        try:
            response = self.call_claude(SYSTEM_PROMPT, user_message, max_tokens=1500)
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response)
            self.log(f"Analysis complete. Confidence: {result.get('confidence', 'D')}")
            return result
        except json.JSONDecodeError as e:
            self.log(f"JSON parse error: {e}")
            return {
                "total_funded_startups": 0,
                "top_sectors": [],
                "stage_distribution": {},
                "notable_exits": [],
                "investment_philosophy_hints": [],
                "confidence": "D",
                "sources_used": []
            }
