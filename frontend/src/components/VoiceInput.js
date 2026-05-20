import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function VoiceInput({ onText }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;

      recog.onstart = () => {
        setIsListening(true);
      };

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onText) onText(transcript);
        setIsListening(false);
      };

      recog.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [onText]);

  const toggleListen = () => {
    if (!recognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      let lang = 'en-US';
      if (i18n.language && i18n.language.startsWith('hi')) lang = 'hi-IN';
      if (i18n.language && i18n.language.startsWith('te')) lang = 'te-IN';
      recognition.lang = lang;
      
      recognition.start();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListen}
      title="Voice Input"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.25rem',
        padding: '0.25rem 0.5rem',
        color: isListening ? '#ef4444' : 'var(--text-secondary)',
        transition: 'color 0.2s'
      }}
    >
      {isListening ? '🔴' : '🎤'}
    </button>
  );
}

export default VoiceInput;
