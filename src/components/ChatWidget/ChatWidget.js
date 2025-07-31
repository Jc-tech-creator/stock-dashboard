// src/components/ChatWidget/ChatWidget.js
import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const SESSION_ID = 'user';          // 如需多用户可换成 uuid
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';             // 若前端 /api 已代理到后端可留空

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [msg, setMsg]         = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef        = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [history]);

  /* ---------- 发送消息 ---------- */
  const send = () => {
    if (!msg.trim()) return;
    const userMsg = { role: 'user', content: msg };
    setHistory((h) => [...h, userMsg]);
    setMsg('');
    setLoading(true);

    const query = new URLSearchParams({ q: msg, sessionId: SESSION_ID });
    const es = new EventSource(`${API_BASE}/api/chat?${query}`);

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
      } catch {
        /* 忽略异常数据 */
      }
    };

    es.onerror = () => {
      es.close();
      setLoading(false);
    };
  };

  return (
    <div className={`chat-widget ${open ? 'open' : ''}`}>
      {/* 悬浮按钮 */}
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        {open ? '×' : '💬'}
      </button>

      {/* 面板 */}
      {open && (
        <div className="chat-panel">
          <div className="chat-header">投资管理助手</div>

          <div className="chat-messages">
            {history.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="chat-msg loading">正在思考…</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-bar">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="输入问题…"
            />
            <button onClick={send} disabled={loading}>
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}