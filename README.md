# VC Genome — 投資DNAを可視化する

StartPass が開発する、AIエージェントがVCキャピタリストを自動解析して美しいプロフィールを生成するプロダクトです。

## プロダクト概要

名前と所属を入力するだけで、4体のAIエージェントがWeb上の公開情報を横断収集・分析し、以下を自動生成します：

- **ゲノム・レーダーチャート** — 戦略性・共感力・ネットワーク・専門性・スピードを数値化
- **投資コアフィロソフィー** — 発言・記事から投資思想を抽出・言語化
- **伴走スタイルDNA** — 採用・営業・メンタル・ファイナンス支援の実態スコア
- **AI二つ名** — 「静かなる情熱のデータサイエンティスト」のような個性的な称号
- **信頼スコア** — 情報の鮮度・ソース数・矛盾の有無を統合評価

## アーキテクチャ

```
StartPass-project1/
├── frontend/          # Next.js 15 (App Router) + TypeScript
│   └── src/
│       ├── app/       # ページ・APIルート
│       └── components/genome/  # UIコンポーネント
├── backend/           # Python FastAPI
│   └── app/
│       ├── agents/    # 4体のAIエージェント
│       ├── core/      # DB・設定
│       ├── models/    # SQLAlchemyモデル
│       └── routers/   # APIエンドポイント
├── docker-compose.yml
└── .env.example
```

### 4体のAIエージェント

| エージェント | 役割 | 担当 |
|---|---|---|
| Fact Investigator | 実績・経歴の番人 | 投資実績のWeb収集・検証 |
| Philosophy Profiler | 思想・文体解析官 | note/X/記事から投資哲学を抽出 |
| Hands-on Analyst | 伴走スタイル特定官 | 投資後の支援行動を分析 |
| Freshness Guard | 鮮度・矛盾検知官 | 情報の整合性検証・信頼スコア算出 |

### 技術スタック

- **Frontend**: Next.js 15 (App Router) / TypeScript / Tailwind CSS / Recharts
- **Backend**: Python FastAPI / SQLAlchemy (async) / Alembic
- **AI**: Claude claude-sonnet-4-6 (Anthropic SDK)
- **DB**: PostgreSQL 16 + pgvector
- **Cache**: Redis 7
- **Scraping**: Playwright / BeautifulSoup4 / httpx
- **Auth**: NextAuth.js (Google OAuth) ※Phase 1実装予定

## セットアップ

### 前提条件

- Docker & Docker Compose
- Node.js 20+（ローカル開発の場合）
- Python 3.12+（ローカル開発の場合）

### 1. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集して以下を設定します：

```env
ANTHROPIC_API_KEY=sk-ant-...        # 必須
GOOGLE_SEARCH_API_KEY=...           # 任意（Web検索精度向上）
GOOGLE_SEARCH_ENGINE_ID=...        # 任意（Google Custom Search）
```

### 2. Docker Compose で起動（推奨）

```bash
docker-compose up -d
```

起動後にアクセス：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

### 3. ローカル開発（個別起動）

**バックエンド:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium

cp .env.example .env
# .env を編集

uvicorn main:app --reload --port 8000
```

**フロントエンド:**

```bash
cd frontend
npm install
npm run dev
```

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ○ | Claude API キー |
| `GOOGLE_SEARCH_API_KEY` | △ | Google Custom Search API キー |
| `GOOGLE_SEARCH_ENGINE_ID` | △ | Google Custom Search エンジンID |
| `DATABASE_URL` | ○ | PostgreSQL接続URL |
| `REDIS_URL` | ○ | Redis接続URL |
| `NEXT_PUBLIC_API_URL` | ○ | フロントエンドからAPIへのURL |
| `BACKEND_URL` | ○ | Next.js サーバーからバックエンドへのURL |

## APIエンドポイント

```
POST /api/genome/create          # ゲノム解析ジョブ作成
GET  /api/genome/status/{job_id} # ジョブステータス取得
GET  /api/genome/{vc_id}         # ゲノムプロフィール取得
GET  /api/genome/                # ゲノム一覧取得
GET  /api/agents/status          # エージェントステータス
GET  /health                     # ヘルスチェック
```

## フロントエンドページ構成

```
/                          # ランディングページ
/genome/entry              # ゲノム解析入力フォーム（STEP 1）
/genome/scanning/[jobId]   # 解析進捗リアルタイム表示（STEP 2）
/genome/[vcId]             # ゲノムプロフィール表示（STEP 3）
```

## 開発ガイド

### 新しいエージェントを追加する

1. `backend/app/agents/` に `your_agent.py` を作成
2. `BaseAgent` を継承して `analyze()` メソッドを実装
3. `orchestrator.py` に組み込む

### DBマイグレーション

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### フロントエンドのカラーパレット

Tailwind クラスで `genome-*` プレフィックスを使用：

```
genome-dark       #0A0A0F  背景
genome-card       #12121A  カード背景
genome-border     #1E1E2E  ボーダー
genome-accent     #6C63FF  アクセント（紫）
genome-gold       #F0C040  ゴールド
genome-green      #00D48A  成功・完了
genome-red        #FF4D6A  エラー・削除
genome-text       #E8E8F0  本文テキスト
genome-muted      #6B6B80  サブテキスト
```

## ライセンス

© 2026 StartPass, Inc. All rights reserved.
