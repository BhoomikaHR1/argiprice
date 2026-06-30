import { useState, useRef, useEffect } from 'react'
import { chatApi } from '../utils/api'

const WELCOME = {
  role: 'assistant',
  content:
    "Namaskara! 🌾 I'm AgriBot. Ask me about crop prices, MSP, government schemes, APMC markets, or weather.",
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const history = next.slice(1, -1).map(({ role, content }) => ({ role, content }))
      const { data } = await chatApi.send(text, history)
      setMessages((m) => [...m, { role: 'assistant', content: data.answer }])
    } catch (err) {
      const msg =
        err?.response?.status === 503
          ? 'Chatbot is not configured yet. Please add the Groq API key.'
          : 'Sorry, something broke. Please try again.'
      setMessages((m) => [...m, { role: 'assistant', content: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AgriBot chat assistant"
        className="fixed bottom-6 right-6 z-50 h-20 w-20 rounded-full bg-field-gradient text-white shadow-card-hover flex flex-col items-center justify-center gap-0.5 hover:scale-110 transition-transform"
        title="AgriBot Chat Assistant"
      >
        <span className="text-4xl">{open ? '✕' : '🌾'}</span>
        <span className="text-xs font-semibold">AgriBot</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-28 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col rounded-2xl bg-white shadow-card-hover border border-forest-100 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-field-gradient text-white px-4 py-3">
            <p className="font-semibold leading-tight">AgriBot Assistant</p>
            <p className="text-xs text-forest-100">Crop prices • Schemes • MSP • Weather</p>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-cream">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-forest-900 text-white rounded-br-sm'
                      : 'bg-white text-charcoal border border-forest-100 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-forest-100 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-charcoal/60">
                  AgriBot is typing…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-forest-100 p-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about prices, schemes, MSP…"
              className="flex-1 rounded-full border border-forest-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-full bg-forest-900 text-white flex items-center justify-center disabled:opacity-40"
              aria-label="Send"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}
