import asyncio
from typing import Callable
from app.agents.fact_investigator import FactInvestigator
from app.agents.philosophy_profiler import PhilosophyProfiler
from app.agents.handson_analyst import HandsonAnalyst
from app.agents.freshness_guard import FreshnessGuard

class GenomeOrchestrator:
    def __init__(self, progress_callback: Callable | None = None):
        self.fact = FactInvestigator()
        self.philosophy = PhilosophyProfiler()
        self.handson = HandsonAnalyst()
        self.freshness = FreshnessGuard()
        self.progress_callback = progress_callback

    async def run(self, input_data: dict) -> dict:
        print(f"[Orchestrator] Starting genome generation for: {input_data.get('name')}")

        # Phase 1: Fact and Philosophy run in parallel
        if self.progress_callback:
            await self.progress_callback("fact", "running", 10, "Web検索を開始しています...")
            await self.progress_callback("philosophy", "running", 10, "哲学解析を準備中...")

        fact_task = self.fact.analyze(input_data)
        philosophy_base_task = self.philosophy.analyze(input_data)

        fact_result, philosophy_base_result = await asyncio.gather(
            fact_task, philosophy_base_task
        )

        if self.progress_callback:
            await self.progress_callback("fact", "done", 100, "投資実績の抽出完了")
            await self.progress_callback("philosophy", "done", 100, "投資哲学の解析完了")

        # Phase 2: Hands-on uses results from Phase 1
        if self.progress_callback:
            await self.progress_callback("handson", "running", 10, "伴走スタイルを分析中...")

        handson_input = {**input_data, "fact_result": fact_result, "philosophy_result": philosophy_base_result}
        handson_result = await self.handson.analyze(handson_input)

        if self.progress_callback:
            await self.progress_callback("handson", "done", 100, "伴走スタイルの特定完了")

        # Phase 3: Freshness Guard validates everything
        if self.progress_callback:
            await self.progress_callback("freshness", "running", 10, "データ整合性を検証中...")

        audit_input = {
            **input_data,
            "fact_result": fact_result,
            "philosophy_result": philosophy_base_result,
            "handson_result": handson_result,
        }
        freshness_result = await self.freshness.analyze(audit_input)

        if self.progress_callback:
            await self.progress_callback("freshness", "done", 100, "信頼性スコアの算出完了")

        # Build final genome JSON
        radar = freshness_result.get("final_radar", philosophy_base_result.get("radar_estimates", {}))

        genome = {
            "basic_info": {
                "name": input_data.get("name"),
                "current_affiliation": input_data.get("affiliation"),
                "ai_generated_alias": philosophy_base_result.get("ai_generated_alias", ""),
                "sns_links": {},
            },
            "metadata": {
                "overall_confidence_score": freshness_result.get("overall_confidence_score", 0.5),
                "data_freshness_level": freshness_result.get("data_freshness_level", "C"),
                "analysis_version": "v1.0-multi-agent",
                "source_count": len(input_data.get("urls", [])) + 6,
                "next_refresh_date": freshness_result.get("next_refresh_date"),
            },
            "genome_stats": {
                "radar_chart": radar,
                "core_philosophies": philosophy_base_result.get("core_philosophies", []),
                "keywords": philosophy_base_result.get("keywords", []),
            },
            "investment_footprint": {
                "total_funded_startups": fact_result.get("total_funded_startups", 0),
                "top_sectors": fact_result.get("top_sectors", []),
                "stage_distribution": fact_result.get("stage_distribution", {}),
                "notable_exits": fact_result.get("notable_exits", []),
            },
            "hands_on_dna": {
                "intervention_style": handson_result.get("intervention_style", "Supportive"),
                "specific_supports": handson_result.get("specific_supports", []),
                "reputation_vibe": handson_result.get("reputation_vibe", ""),
                "weekly_interaction_simulation": handson_result.get("weekly_interaction_simulation", ""),
            },
            "audit_log": {
                "conflicting_data": freshness_result.get("conflicting_data", []),
                "audit_notes": freshness_result.get("audit_notes", ""),
            },
        }

        print(f"[Orchestrator] Genome generation complete!")
        return genome
