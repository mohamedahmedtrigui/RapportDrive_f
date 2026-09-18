import { useState } from 'react'
import { askChat } from '../api/chat'
import { ChatIcon, CloseIcon, SendIcon } from './icons'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!question.trim()) return

    const currentQuestion = question
    setMessages((m) => [...m, { role: 'question', text: currentQuestion }])
    setQuestion('')
    setLoading(true)

    try {
      const { data } = await askChat(currentQuestion)
      setMessages((m) => [...m, { role: 'answer', text: data.answer, sources: data.sources }])
    } catch {
      setMessages((m) => [...m, { role: 'answer', text: "Le service IA n'a pas répondu." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="chat-widget-panel">
          <div className="chat-widget-header">
            <span>Assistant RapportDrive</span>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Fermer le chat">
              <CloseIcon />
            </button>
          </div>

          <div className="chat-thread">
            {messages.length === 0 && (
              <p className="chat-widget-hint">
                Pose une question sur les rapports, les chauffeurs ou les incidents récents.
              </p>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.role}`}>
                <p>{message.text}</p>
                {message.sources?.length > 0 && (
                  <p className="badge">sources : {message.sources.join(', ')}</p>
                )}
              </div>
            ))}
          </div>

          <form className="chat-widget-form" onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Écris ta question…"
              rows={2}
            />
            <button type="submit" className="icon-btn chat-send" disabled={loading} aria-label="Envoyer">
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fermer le chatbot' : 'Ouvrir le chatbot'}
      >
        <ChatIcon width={24} height={24} />
      </button>
    </>
  )
}
