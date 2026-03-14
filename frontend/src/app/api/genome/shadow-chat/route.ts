import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  const { messages, genomeSummary, vcName } = await request.json()

  const systemPrompt = `あなたは${vcName}のAIシミュレーションです。
以下のゲノムデータに基づいて、${vcName}として起業家の相談に答えてください。

ゲノムサマリー:
${genomeSummary}

重要なルール:
- ${vcName}の投資哲学・スタイルに基づいて回答する
- 一人称は「私」を使う
- 具体的で実践的なアドバイスをする
- 100〜200文字程度の簡潔な回答を心がける
- 必ず最後に「（AIシミュレーション）」と付記する`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.map((m: Message) => ({
      role: m.role,
      content: m.content,
    })),
  })

  return NextResponse.json({
    content:
      response.content[0].type === 'text' ? response.content[0].text : '',
  })
}
