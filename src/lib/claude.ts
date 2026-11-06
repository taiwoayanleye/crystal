/**
 * Claude API Integration
 * Handles communication with Anthropic API for data insights
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY is not set. Chat features will not work.')
}

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeRequest {
  model: string
  max_tokens: number
  system?: string
  messages: ClaudeMessage[]
}

interface ClaudeResponse {
  content: Array<{
    type: string
    text: string
  }>
}

/**
 * Send a message to Claude and get a response
 */
export async function askClaude(
  userMessage: string,
  datasetContext: {
    name: string
    problemStatement: string
    users: string
    metrics: {
      quality: { freshness: number; completeness: number; accuracy: number }
      usage: { queriesPerDay: number; uniqueUsers: number; adoptionPercent: number }
    }
    sampleRows: Record<string, any>[]
  }
): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    return "I'm not configured yet. Please add ANTHROPIC_API_KEY to .env.local"
  }

  try {
    // Build context for Claude
    const context = `You are a data analyst assistant for the Crystal platform.

Dataset: ${datasetContext.name}
Purpose: ${datasetContext.problemStatement}
Users: ${datasetContext.users}

Data Quality:
- Freshness: ${datasetContext.metrics.quality.freshness}%
- Completeness: ${datasetContext.metrics.quality.completeness}%
- Accuracy: ${datasetContext.metrics.quality.accuracy}%

Usage Metrics:
- Queries/day: ${datasetContext.metrics.usage.queriesPerDay}
- Unique users: ${datasetContext.metrics.usage.uniqueUsers}
- Adoption: ${datasetContext.metrics.usage.adoptionPercent}%

Sample data (first 3 rows):
${JSON.stringify(datasetContext.sampleRows.slice(0, 3), null, 2)}

Provide a concise, actionable insight based on this data. Keep responses to 2-3 sentences max.`

    const request: ClaudeRequest = {
      model: 'claude-opus-5-5',
      max_tokens: 1024,
      system: context,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = (await response.json()) as ClaudeResponse

    const textContent = data.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    return textContent.text
  } catch (error) {
    console.error('Error calling Claude:', error)
    throw error
  }
}

export interface SuggestedMetric {
  name: string
  description: string
}

/**
 * Ask Claude to inspect a dataset's schema + sample and propose specific,
 * measurable success metrics tailored to the actual columns.
 */
export async function suggestSuccessMetrics(input: {
  schema: string[]
  sampleRows: Record<string, any>[]
  problemStatement?: string
}): Promise<SuggestedMetric[]> {
  if (!ANTHROPIC_API_KEY) {
    // Honest fallback when no key is configured.
    return [
      { name: 'Adoption', description: '% of target users actively querying the dataset' },
      { name: 'Query volume', description: 'Queries per week against the dataset' },
      { name: 'Business impact', description: 'Revenue or cost outcome attributed to decisions from this data' },
    ]
  }

  const system = `You are a data-product analyst. Given a dataset's columns, a sample of rows, and the problem it should solve, propose 4 SPECIFIC, measurable success metrics for treating it as a data product.

Rules:
- Be specific to the actual columns present (reference them), not generic.
- Each metric must be measurable and tied to a business or data outcome.
- Return ONLY a JSON array of objects: [{"name": string, "description": string}]. No prose, no markdown.`

  const user = `Problem: ${input.problemStatement || '(not specified)'}

Columns: ${input.schema.join(', ')}

Sample rows (JSON):
${JSON.stringify(input.sampleRows.slice(0, 15), null, 2)}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-5-5',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
  const data = (await response.json()) as ClaudeResponse
  const text = data.content.find((c) => c.type === 'text')?.text ?? '[]'

  // Be forgiving: extract the first JSON array from the response.
  const match = text.match(/\[[\s\S]*\]/)
  try {
    const parsed = JSON.parse(match ? match[0] : text)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((m) => m && typeof m.name === 'string')
        .slice(0, 6)
        .map((m) => ({ name: String(m.name), description: String(m.description ?? '') }))
    }
  } catch {
    /* fall through */
  }
  return []
}

/**
 * Stream a message to Claude (for real-time responses)
 */
export async function* askClaudeStream(
  userMessage: string,
  datasetContext: any
): AsyncGenerator<string> {
  if (!ANTHROPIC_API_KEY) {
    yield "I'm not configured yet. Please add ANTHROPIC_API_KEY to .env.local"
    return
  }

  try {
    const context = `You are a data analyst assistant for the Crystal platform.

Dataset: ${datasetContext.name}
Purpose: ${datasetContext.problemStatement}
Users: ${datasetContext.users}

Data Quality:
- Freshness: ${datasetContext.metrics.quality.freshness}%
- Completeness: ${datasetContext.metrics.quality.completeness}%
- Accuracy: ${datasetContext.metrics.quality.accuracy}%

Usage Metrics:
- Queries/day: ${datasetContext.metrics.usage.queriesPerDay}
- Unique users: ${datasetContext.metrics.usage.uniqueUsers}
- Adoption: ${datasetContext.metrics.usage.adoptionPercent}%

Provide concise, actionable insights. Keep responses brief.`

    const request: ClaudeRequest = {
      model: 'claude-opus-5-5',
      max_tokens: 1024,
      system: context,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = (await response.json()) as ClaudeResponse
    const textContent = data.content.find((c) => c.type === 'text')

    if (textContent && textContent.type === 'text') {
      yield textContent.text
    }
  } catch (error) {
    console.error('Error streaming Claude response:', error)
    yield 'Error getting response. Please try again.'
  }
}
