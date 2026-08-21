'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSendMessage, botQuestions = [], isTyping = false }) => {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    if (val.trim().length > 1 && botQuestions.length > 0) {
      const filtered = botQuestions.filter((q) =>
        q && q.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onSendMessage(suggestion);
    setMessage('');
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isTyping) {
      onSendMessage(message);
      setMessage('');
      setSuggestions([]);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {suggestions.length > 0 && (
        <div className="suggestions-container">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="suggestion-item"
              onClick={() => handleSelectSuggestion(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-field"
          placeholder="Type your question for Pidgin..."
          value={message}
          onChange={handleInputChange}
          disabled={isTyping}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!message.trim() || isTyping}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
