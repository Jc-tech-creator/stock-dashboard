// src/components/ChatWidget/ChatWidget.js
import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const SESSION_ID = 'user';
const API_BASE   = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [msg, setMsg]         = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef        = useRef(null);
  const esRef                 = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [history]);

  const send = () => {
    if (!msg.trim()) return;
    const userMsg = { role: 'user', content: msg };
    setHistory((h) => [...h, userMsg]);
    setMsg('');
    setLoading(true);

    const query = new URLSearchParams({ q: msg, sessionId: SESSION_ID });
    const es    = new EventSource(`${API_BASE}/api/chat?${query}`);
    esRef.current = es;

    let assistant = { role: 'assistant', content: '' };
    setHistory((h) => [...h, assistant]);

    es.onmessage = (e) => {
      if (e.data === '[DONE]') {
        es.close();
        setLoading(false);
        return;
      }
      try {
        const { delta } = JSON.parse(e.data);
        assistant.content += delta;
        setHistory((h) => {
          const copy = [...h];
          copy[copy.length - 1] = { ...assistant };
          return copy;
        });
      } catch {}
    };

    es.onerror = () => {
      es.close();
      setLoading(false);
    };
  };

  const stop = () => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setLoading(false);
  };

  const clear = () => {
    if (esRef.current) esRef.current.close();
    setHistory([]);
    setLoading(false);
  };

  return (
    <div className="chat-widget">
       {!open && (
        <button className="chat-toggle" onClick={() => setOpen(true)}>
          💬
        </button>
       )}

      {open && (
        <div className="chat-panel">
          <button className="close-btn" onClick={() => setOpen(false)}>
            <span className="close-icon">×</span>
          </button>

          <div className="chat-header">
            <span>AI Assistant</span>
            <button className="clear-btn" onClick={clear}>
              Clear
            </button>
          </div>

          <div className="chat-messages">
            {history.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.role}`}>
                <span>{m.content}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            {loading && (
              <div className="thinking-bar">
                <span>Generating…</span>
                <button className="stop-btn" onClick={stop}>
                  Stop
                </button>
              </div>
            )}
            <div className="chat-input-bar">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask a question…"
              />
              <button onClick={send} disabled={loading}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}