"""
VC Genome スタンドアロンデモスクリプト
DB・Docker不要。ANTHROPIC_API_KEY だけで動作します。

使い方:
  cd backend
  python scripts/standalone_demo.py --name "田中太郎" --affiliation "ABC Ventures"
  python scripts/standalone_demo.py --batch  # 著名VC10名を一括解析
"""

import asyncio
import json
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

import anthropic

# ─────────────────────────────────────────────
# 設定
# ─────────────────────────────────────────────
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
if not API_KEY:
    # .env から読み込み試行
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("ANTHROPIC_API_KEY="):
                API_KEY = line.split("=", 1)[1].strip().strip('"')
                break

if not API_KEY:
    print("[ERROR] ANTHROPIC_API_KEY ga settei sarete imasen")
    print("   set ANTHROPIC_API_KEY=your_key  mata wa  backend/.env ni kisai shite kudasai")
    sys.exit(1)

client = anthropic.Anthropic(api_key=API_KEY)
OUTPUT_DIR = Path(__file__).parent.parent / "output" / "genomes"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────
# デモ対象: 著名キャピタリスト10名（公開情報ベース）
# ─────────────────────────────────────────────
DEMO_VCS = [
    {"name": "村上太一",     "affiliation": "リクルートキャリア / 元Zホールディングス投資担当"},
    {"name": "孫泰蔵",       "affiliation": "Mistletoe / 創業者"},
    {"name": "小林清剛",     "affiliation": "East Ventures / Partner"},
    {"name": "田島聡一",     "affiliation": "グロービス・キャピタル・パートナーズ"},
    {"name": "安西智宏",     "affiliation": "DNX Ventures / Managing Director"},
    {"name": "堀新一郎",     "affiliation": "YJ Capital / 代表取締役社長"},
    {"name": "赤浦徹",       "affiliation": "インキュベイトファンド / Founding Partner"},
    {"name": "渡辺洋行",     "affiliation": "Coral Capital / 創業パートナー"},
    {"name": "宮田拓弥",     "affiliation": "Scrum Ventures / Founding Partner"},
    {"name": "木下慶彦",     "affiliation": "ANRI / General Partner"},
]


# ─────────────────────────────────────────────
# ユーティリティ
# ─────────────────────────────────────────────
def call_claude(system_prompt: str, user_message: str, max_tokens: int = 1500) -> str:
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return msg.content[0].text


def safe_json(text: str) -> dict:
    """Claude の返答から JSON を抽出する"""
    import re
    # コードブロックを除去
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    # JSON オブジェクトを探す
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    # フォールバック
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return {}


async def fetch_snippets(name: str, affiliation: str) -> str:
    """Web 検索の代わりに Claude に「このVCについて知っていること」を聞く（Search API なし版）"""
    prompt = f"""
あなたはVC業界の専門家です。
以下のキャピタリストについて、公開情報から知っていることをすべて教えてください。
投資実績、投資哲学、伴走スタイル、性格・人柄、得意領域など。

対象: {name}（{affiliation}）

できるだけ具体的に、事実として知られていることを記述してください。
不明な点は「不明」と記載してください。
"""
    return call_claude("あなたはVC業界の詳細な知識を持つアナリストです。", prompt, max_tokens=2000)


# ─────────────────────────────────────────────
# Agent 1: Fact Investigator
# ─────────────────────────────────────────────
FACT_SYSTEM = """
あなたはデューデリジェンス専門調査員です。
提供されたテキストからキャピタリストの投資実績を構造化し、以下のJSONのみを返してください。

{
  "total_funded_startups": <推定数値>,
  "top_sectors": [{"sector": "<業界>", "percentage": <比率>}],
  "stage_distribution": {"Seed": <比率>, "PreA": <比率>, "SeriesA": <比率>, "Other": <比率>},
  "notable_exits": ["<会社名 (IPO/M&A)>"],
  "investment_philosophy_hints": ["<哲学のキーワード>"],
  "confidence": "<A/B/C/D>",
  "sources_used": ["<情報源の説明>"]
}

不明な値は 0 または [] にする。JSONのみ返す。
"""


async def run_fact_agent(name: str, affiliation: str, context: str) -> dict:
    print(f"  🔍 Fact Investigator 稼働中...")
    user_msg = f"対象: {name}（{affiliation}）\n\n参考情報:\n{context[:6000]}"
    result = safe_json(call_claude(FACT_SYSTEM, user_msg))
    print(f"     → 投資先推定: {result.get('total_funded_startups', '?')}社 / 信頼度: {result.get('confidence', '?')}")
    return result


# ─────────────────────────────────────────────
# Agent 2: Philosophy Profiler
# ─────────────────────────────────────────────
PHILOSOPHY_SYSTEM = """
あなたは行動心理学の専門家です。
キャピタリストの発言・行動から「思想のゲノム」を抽出し、以下のJSONのみを返してください。

{
  "ai_generated_alias": "<二つ名（例: 静かなる情熱のDeepTech番人）>",
  "core_philosophies": [
    {"tag": "<タグ>", "evidence_quote": "<発言引用60文字以内>", "source_description": "<出典>"}
  ],
  "personality_type": "<論理派/情熱派/バランス型/慎重派>",
  "tone_analysis": {"authority_ratio": <0-100>, "empathy_ratio": <0-100>, "logic_ratio": <0-100>},
  "radar_estimates": {"strategy": <1-10>, "empathy": <1-10>, "network": <1-10>, "expertise": <1-10>, "speed": <1-10>},
  "keywords": ["<特徴的キーワード>"],
  "preferred_founder_type": "<好む起業家のタイプ>",
  "confidence": "<A/B/C/D>"
}

JSONのみ返す。
"""


async def run_philosophy_agent(name: str, affiliation: str, context: str, fact: dict) -> dict:
    print(f"  🧠 Philosophy Profiler 稼働中...")
    user_msg = f"""
対象: {name}（{affiliation}）

参考情報:
{context[:5000]}

投資実績サマリー:
- 推定投資先: {fact.get('total_funded_startups', '?')}社
- 主要領域: {[s.get('sector') for s in fact.get('top_sectors', [])]}
- 哲学ヒント: {fact.get('investment_philosophy_hints', [])}
"""
    result = safe_json(call_claude(PHILOSOPHY_SYSTEM, user_msg))
    print(f"     → 二つ名: 「{result.get('ai_generated_alias', '?')}」/ タイプ: {result.get('personality_type', '?')}")
    return result


# ─────────────────────────────────────────────
# Agent 3: Hands-on Analyst
# ─────────────────────────────────────────────
HANDSON_SYSTEM = """
あなたはスタートアップ創業経験を持つ専門家です。
キャピタリストの伴走スタイルを分析し、以下のJSONのみを返してください。

{
  "intervention_style": "<Proactive/Supportive/Observer>",
  "specific_supports": [
    {"type": "<Recruiting/Sales_Intro/Mental/Finance/PR>", "score": <1-10>, "description": "<30文字以内>", "evidence_count": <件数>}
  ],
  "reputation_vibe": "<起業家視点の印象を2フレーズで>",
  "crisis_behavior": "<危機時（ダウンラウンド等）の対応スタイル>",
  "weekly_interaction_simulation": "<月曜日のコミュニケーション想定を100文字で>",
  "confidence": "<A/B/C/D>"
}

JSONのみ返す。
"""


async def run_handson_agent(name: str, affiliation: str, context: str, philosophy: dict) -> dict:
    print(f"  🤝 Hands-on Analyst 稼働中...")
    user_msg = f"""
対象: {name}（{affiliation} / {philosophy.get('ai_generated_alias', '')}）
性格: {philosophy.get('personality_type', '?')}
キーワード: {philosophy.get('keywords', [])}

参考情報:
{context[:4000]}
"""
    result = safe_json(call_claude(HANDSON_SYSTEM, user_msg))
    print(f"     → スタイル: {result.get('intervention_style', '?')}")
    return result


# ─────────────────────────────────────────────
# Agent 4: Freshness Guard
# ─────────────────────────────────────────────
FRESHNESS_SYSTEM = """
あなたは冷徹なデータ監査官です。
3つのエージェント結果を統合・検証し、以下のJSONのみを返してください。

{
  "overall_confidence_score": <0.0-1.0>,
  "data_freshness_level": "<A/B/C/D>",
  "conflicting_data": [{"issue": "<矛盾>", "resolution": "<解決策>"}],
  "next_refresh_date": "<YYYY-MM-DD>",
  "audit_notes": "<総評100文字以内>",
  "final_radar": {"strategy": <1-10>, "empathy": <1-10>, "network": <1-10>, "expertise": <1-10>, "speed": <1-10>},
  "source_count": <情報源推定数>
}

JSONのみ返す。
"""


async def run_freshness_agent(name: str, fact: dict, philosophy: dict, handson: dict) -> dict:
    print(f"  ⚖️  Freshness Guard 稼働中...")
    user_msg = f"""
対象: {name}

Fact結果: 信頼度={fact.get('confidence','?')}, 投資先={fact.get('total_funded_startups','?')}社
Philosophy結果: 信頼度={philosophy.get('confidence','?')}, 二つ名={philosophy.get('ai_generated_alias','?')}
Handson結果: 信頼度={handson.get('confidence','?')}, スタイル={handson.get('intervention_style','?')}

これらを統合して最終的な信頼性スコアを算出してください。
"""
    result = safe_json(call_claude(FRESHNESS_SYSTEM, user_msg))
    print(f"     → 信頼スコア: {result.get('data_freshness_level', '?')} ({result.get('overall_confidence_score', 0):.2f})")
    return result


# ─────────────────────────────────────────────
# Orchestrator
# ─────────────────────────────────────────────
async def generate_genome(name: str, affiliation: str, philosophy_hint: str = "") -> dict:
    print(f"\n{'='*60}")
    print(f"🧬 ゲノム解析開始: {name}（{affiliation}）")
    print(f"{'='*60}")
    started_at = datetime.now()

    # 情報収集
    print(f"\n📡 情報収集フェーズ...")
    context = await fetch_snippets(name, affiliation)
    if philosophy_hint:
        context += f"\n\n本人の自己申告: {philosophy_hint}"
    print(f"   収集完了: {len(context)}文字")

    # Phase 1: Fact + Philosophy を並列実行
    print(f"\n🤖 エージェント並列稼働フェーズ...")
    fact_task = run_fact_agent(name, affiliation, context)
    philosophy_task = run_philosophy_agent(name, affiliation, context, {})

    fact_result, philosophy_base = await asyncio.gather(fact_task, philosophy_task)

    # Phase 2: Hands-on（Phase1の結果を使う）
    handson_result = await run_handson_agent(name, affiliation, context, philosophy_base)

    # Phase 3: Freshness Guard（全結果を統合）
    freshness_result = await run_freshness_agent(name, fact_result, philosophy_base, handson_result)

    # ─── 最終ゲノムJSON を組み立て ───
    radar = freshness_result.get("final_radar", philosophy_base.get("radar_estimates", {}))

    genome = {
        "vc_genome_id": f"demo_{name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "last_updated": datetime.now().isoformat(),
        "basic_info": {
            "name": name,
            "current_affiliation": affiliation,
            "ai_generated_alias": philosophy_base.get("ai_generated_alias", ""),
            "preferred_founder_type": philosophy_base.get("preferred_founder_type", ""),
        },
        "metadata": {
            "overall_confidence_score": freshness_result.get("overall_confidence_score", 0.5),
            "data_freshness_level": freshness_result.get("data_freshness_level", "C"),
            "source_count": freshness_result.get("source_count", 3),
            "analysis_version": "v1.0-standalone",
            "next_refresh_date": freshness_result.get("next_refresh_date", ""),
            "audit_notes": freshness_result.get("audit_notes", ""),
            "generated_at": datetime.now().isoformat(),
        },
        "genome_stats": {
            "radar_chart": radar,
            "core_philosophies": philosophy_base.get("core_philosophies", []),
            "keywords": philosophy_base.get("keywords", []),
            "personality_type": philosophy_base.get("personality_type", ""),
            "tone_analysis": philosophy_base.get("tone_analysis", {}),
        },
        "investment_footprint": {
            "total_funded_startups": fact_result.get("total_funded_startups", 0),
            "top_sectors": fact_result.get("top_sectors", []),
            "stage_distribution": fact_result.get("stage_distribution", {}),
            "notable_exits": fact_result.get("notable_exits", []),
            "investment_philosophy_hints": fact_result.get("investment_philosophy_hints", []),
        },
        "hands_on_dna": {
            "intervention_style": handson_result.get("intervention_style", "Supportive"),
            "specific_supports": handson_result.get("specific_supports", []),
            "reputation_vibe": handson_result.get("reputation_vibe", ""),
            "crisis_behavior": handson_result.get("crisis_behavior", ""),
            "weekly_interaction_simulation": handson_result.get("weekly_interaction_simulation", ""),
        },
        "audit_log": {
            "conflicting_data": freshness_result.get("conflicting_data", []),
        },
    }

    elapsed = (datetime.now() - started_at).total_seconds()
    print(f"\n✅ ゲノム生成完了！ ({elapsed:.1f}秒)")
    print(f"   二つ名: 「{genome['basic_info']['ai_generated_alias']}」")
    print(f"   信頼度: {genome['metadata']['data_freshness_level']} ({genome['metadata']['overall_confidence_score']:.2f})")

    return genome


def save_genome(genome: dict, name: str):
    filename = f"{name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    path = OUTPUT_DIR / filename
    path.write_text(json.dumps(genome, ensure_ascii=False, indent=2))
    print(f"   💾 保存: {path}")
    return path


def print_summary(genome: dict):
    """ターミナルにサマリーを表示"""
    info = genome["basic_info"]
    stats = genome["genome_stats"]
    footprint = genome["investment_footprint"]
    handson = genome["hands_on_dna"]
    meta = genome["metadata"]

    print(f"\n{'─'*60}")
    print(f"📊 ゲノムサマリー: {info['name']}")
    print(f"{'─'*60}")
    print(f"  所属    : {info['current_affiliation']}")
    print(f"  二つ名  : ✦ {info['ai_generated_alias']}")
    print(f"  性格    : {stats.get('personality_type', '?')}")
    print(f"  信頼度  : {meta['data_freshness_level']} ({meta['overall_confidence_score']:.2f})")
    print()

    # レーダー
    radar = stats.get("radar_chart", {})
    print("  ◆ ゲノム・レーダー")
    for key, label in [("strategy","戦略性"), ("empathy","共感力"), ("network","ネットワーク"), ("expertise","専門性"), ("speed","スピード")]:
        val = radar.get(key, 0)
        bar = "█" * val + "░" * (10 - val)
        print(f"    {label:8s} {bar} {val}/10")

    # 投資実績
    print(f"\n  ◆ 投資実績")
    print(f"    推定投資先: {footprint['total_funded_startups']}社")
    for s in footprint.get("top_sectors", [])[:3]:
        print(f"    {s.get('sector','?'):15s} {s.get('percentage',0)}%")

    # 伴走スタイル
    print(f"\n  ◆ 伴走スタイル: {handson['intervention_style']}")
    for sup in handson.get("specific_supports", [])[:3]:
        stars = "★" * sup.get("score", 0) // 2 + "☆" * (5 - sup.get("score", 0) // 2)
        print(f"    {sup.get('type','?'):12s} {stars}  {sup.get('description','')}")

    # 哲学
    print(f"\n  ◆ 投資哲学")
    for p in stats.get("core_philosophies", [])[:2]:
        print(f"    [{p.get('tag','')}] ❝{p.get('evidence_quote','')}❞")

    print(f"\n  監査メモ: {meta.get('audit_notes', '')}")
    print(f"{'─'*60}\n")


# ─────────────────────────────────────────────
# メインエントリーポイント
# ─────────────────────────────────────────────
async def main():
    parser = argparse.ArgumentParser(description="VC Genome スタンドアロンデモ")
    parser.add_argument("--name", type=str, help="キャピタリスト名")
    parser.add_argument("--affiliation", type=str, help="所属VC / 役職")
    parser.add_argument("--philosophy", type=str, default="", help="投資哲学（任意）")
    parser.add_argument("--batch", action="store_true", help="著名VC10名を一括解析")
    parser.add_argument("--batch-limit", type=int, default=3, help="バッチ解析の上限数 (default: 3)")
    args = parser.parse_args()

    if args.batch:
        targets = DEMO_VCS[:args.batch_limit]
        print(f"\n🚀 バッチ解析開始: {len(targets)}名")
        results = []
        for vc in targets:
            genome = await generate_genome(vc["name"], vc["affiliation"])
            save_genome(genome, vc["name"])
            print_summary(genome)
            results.append(genome)

        # バッチサマリー
        print(f"\n{'='*60}")
        print(f"📈 バッチ解析完了: {len(results)}名")
        print(f"{'='*60}")
        for g in results:
            info = g["basic_info"]
            meta = g["metadata"]
            print(f"  {info['name']:15s} ✦ {info['ai_generated_alias']:30s} [{meta['data_freshness_level']}]")

        # 全結果をまとめたファイルも出力
        batch_path = OUTPUT_DIR / f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        batch_path.write_text(json.dumps(results, ensure_ascii=False, indent=2))
        print(f"\n💾 バッチ結果: {batch_path}")

    elif args.name and args.affiliation:
        genome = await generate_genome(args.name, args.affiliation, philosophy_hint=args.philosophy)
        save_genome(genome, args.name)
        print_summary(genome)

    else:
        print("使い方:")
        print("  # 単体解析")
        print('  python scripts/standalone_demo.py --name "山田太郎" --affiliation "ABC Ventures / GP"')
        print()
        print("  # バッチ解析（著名VC 3名）")
        print("  python scripts/standalone_demo.py --batch --batch-limit 3")
        print()
        print("  # バッチ解析（著名VC 10名全員）")
        print("  python scripts/standalone_demo.py --batch --batch-limit 10")


if __name__ == "__main__":
    asyncio.run(main())
