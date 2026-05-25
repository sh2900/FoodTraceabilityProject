import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import VoiceInput from './VoiceInput';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { t, i18n } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    try {
      const res = await axios.post(process.env.REACT_APP_API_URL + '/api/ai/chat', {
        message: currentInput,
        language: i18n.language || 'en'
      });
      const botMsg = { sender: 'bot', text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const botMsg = { sender: 'bot', text: "Sorry, I am having trouble connecting to the server." };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window" style={{
          width: '350px',
          height: '450px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('chatbot.title', 'AI Assistant')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: 'transparent'
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                👋 {t('chatbot.title', 'How can I help you today?')}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'var(--glass-bg)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  wordWrap: 'break-word',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  border: msg.sender === 'bot' ? '1px solid var(--border)' : 'none'
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{
            display: 'flex',
            padding: '0.75rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--glass-panel-bg)',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbot.placeholder', 'Type a message...')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)'
              }}
            />
            <VoiceInput onText={(text) => setInput((prev) => prev ? prev + ' ' + text : text)} />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem' }}
            >
              {t('chatbot.send', 'Send')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
