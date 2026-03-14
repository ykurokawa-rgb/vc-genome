"""
デモ用スクリプト: バックエンドが起動していなくてもAIエージェントを直接テストできます

使い方:
  cd backend
  python scripts/demo_analysis.py --name "山田太郎" --affiliation "ABC Ventures"
"""

import asyncio
import argparse
import json
import sys
import os

# パスを通す
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agents.orchestrator import GenomeOrchestrator


async def main():
    parser = argparse.ArgumentParser(description='VC Genome デモ解析')
    parser.add_argument('--name', required=True, help='キャピタリスト名')
    parser.add_argument('--affiliation', required=True, help='所属VC')
    parser.add_argument('--urls', nargs='*', default=[], help='参照URL（複数可）')
    parser.add_argument('--philosophy', default='', help='投資哲学メモ')
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  VC Genome 解析開始")
    print(f"  対象: {args.name} ({args.affiliation})")
    print(f"{'='*60}\n")

    input_data = {
        'name': args.name,
        'affiliation': args.affiliation,
        'urls': args.urls,
        'philosophy': args.philosophy,
    }

    progress_logs = []

    async def progress_callback(agent: str, status: str, progress: int, log: str):
        icon_map = {'fact': '🔍', 'philosophy': '🧠', 'handson': '🤝', 'freshness': '⚖️'}
        icon = icon_map.get(agent, '•')
        msg = f"{icon} [{agent:12s}] {status:8s} {progress:3d}% | {log}"
        print(msg)
        progress_logs.append(msg)

    orchestrator = GenomeOrchestrator(progress_callback=progress_callback)

    try:
        genome = await orchestrator.run(input_data)

        print(f"\n{'='*60}")
        print(f"  解析完了！")
        print(f"{'='*60}\n")

        # 結果サマリー表示
        bi = genome.get('basic_info', {})
        meta = genome.get('metadata', {})
        gs = genome.get('genome_stats', {})
        inv = genome.get('investment_footprint', {})
        ho = genome.get('hands_on_dna', {})

        print(f"名前: {bi.get('name')}")
        print(f"所属: {bi.get('current_affiliation')}")
        print(f"AI二つ名: ✦ {bi.get('ai_generated_alias', 'N/A')}")
        print(f"信頼レベル: {meta.get('data_freshness_level')} (スコア: {meta.get('overall_confidence_score', 0):.2f})")
        print(f"ソース数: {meta.get('source_count')}件\n")

        print(f"投資先数: {inv.get('total_funded_startups')}社")
        sectors = inv.get('top_sectors', [])
        if sectors:
            print(f"主要領域: {', '.join([s['sector'] for s in sectors[:3]])}")
        print(f"伴走スタイル: {ho.get('intervention_style')}\n")

        radar = gs.get('radar_chart', {})
        if radar:
            print("レーダーチャート:")
            for k, v in radar.items():
                bar = '█' * int(v) + '░' * (10 - int(v))
                print(f"  {k:12s}: {bar} {v}")

        philosophies = gs.get('core_philosophies', [])
        if philosophies:
            print(f"\n投資フィロソフィー ({len(philosophies)}件):")
            for p in philosophies[:2]:
                print(f"  [{p.get('tag')}] {p.get('evidence_quote', '')[:60]}...")

        # JSON出力
        output_file = f"genome_{args.name.replace(' ', '_')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(genome, f, ensure_ascii=False, indent=2)
        print(f"\n完全なゲノムJSONを保存しました: {output_file}")

    except Exception as e:
        print(f"\nエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
