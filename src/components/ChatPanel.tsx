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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    <section aria-label="Data assistant" className="fixed inset-x-0 bottom-0 z-40 h-[min(78vh,680px)] bg-white border border-border shadow-lg rounded-t-xl flex flex-col md:static md:inset-auto md:z-auto md:h-auto md:w-[380px] md:flex-shrink-0 md:rounded-none md:border-y-0 md:border-r-0 md:border-l md:shadow-none">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <div className="min-w-0">
          <h2 className="text-section-title text-navy font-semibold">Data Assistant</h2>
          {datasetName && (
            <p className="text-small text-text-light truncate" title={datasetName}>
              {datasetName}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close assistant"
          className="text-text-light hover:text-text-dark transition-smooth text-xl leading-none px-1"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2 rounded-lg text-small whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-bg-subtle text-text-dark rounded-bl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-bg-subtle px-4 py-2 rounded-lg rounded-bl-none">
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
                className="block w-full text-left text-small text-primary border border-border hover:border-primary rounded-md px-3 py-2 transition-smooth"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            aria-label="Ask about this dataset"
            placeholder="Ask about this dataset…"
            className="flex-1 px-3 py-2 border border-border rounded-md text-small focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="px-3 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-smooth"
          >
            →
          </button>
        </div>
      </div>
    </section>
  )
}
