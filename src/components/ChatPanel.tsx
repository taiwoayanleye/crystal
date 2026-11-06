'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatPanelProps {
  datasetId: string
  datasetName?: string
  onClose?: () => void
}

const SUGGESTIONS = [
  'What is this data good for?',
  'Any quality risks I should know?',
  'How can we drive more adoption?',
]

export function ChatPanel({ datasetId, datasetName, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: datasetName
        ? `Hi! Ask me anything about "${datasetName}" — quality, usage, or business outcomes.`
        : "Hi! I'm Crystal, your data insights assistant. Ask me anything about this dataset.",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages, loading])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, datasetId }),
      })
      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: data.timestamp,
        },
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const showSuggestions = messages.length === 1 && !loading

  return (
    <section aria-label="Data assistant" className={`fixed inset-x-0 bottom-0 z-40 ${minimized ? 'h-auto' : 'h-[min(78vh,680px)]'} rounded-t-xl border border-border-subtle bg-bg-base shadow-lg md:static md:inset-auto md:z-auto md:w-[360px] md:flex-shrink-0 md:rounded-none md:border-y-0 md:border-r-0 md:border-l md:shadow-none ${minimized ? 'md:h-auto' : 'md:h-auto'}`}>
      <div className="flex items-center justify-between border-b border-border-subtle bg-bg-elevated px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-semibold text-text-primary">Data Assistant</h2>
          {datasetName && (
            <p className="truncate text-[11px] text-text-secondary" title={datasetName}>
              {datasetName}
            </p>
          )}
        </div>
        <div className="ml-3 flex items-center gap-1">
          <button type="button" onClick={() => setMinimized((value) => !value)} aria-label={minimized ? 'Expand assistant' : 'Minimize assistant'} className="rounded p-1.5 text-text-secondary hover:bg-bg-hover">{minimized ? '□' : '−'}</button>
          <button type="button" onClick={onClose} aria-label="Close assistant" className="rounded p-1.5 text-text-secondary hover:bg-bg-hover">×</button>
        </div>
      </div>

      {!minimized && <>
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && <span aria-hidden="true" className="mr-2 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] text-white">✦</span>}
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-xs leading-5 ${message.role === 'user' ? 'rounded-br-sm bg-accent text-white' : 'rounded-bl-sm bg-bg-elevated text-text-primary'}`}>
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg rounded-bl-sm bg-bg-elevated px-4 py-2">
              <span className="inline-flex gap-1">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </span>
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="space-y-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full rounded-md bg-bg-elevated px-3 py-2 text-left text-xs text-text-primary transition-smooth hover:bg-bg-hover"
              >
                {s}
              </button>
            ))}
          </div>
        )}

      </div>

      <div className="border-t border-border-subtle bg-surface p-3.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            aria-label="Ask about this dataset"
            placeholder="Ask about this dataset…"
            className="min-w-0 flex-1 rounded-md bg-bg-elevated px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="rounded-md bg-accent px-3 py-2 text-white transition-smooth hover:bg-accent-light disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>
      </>}
    </section>
  )
}
