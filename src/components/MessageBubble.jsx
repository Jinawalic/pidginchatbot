'use client';

import React from 'react';

const MessageBubble = ({ text, sender, timestamp }) => {
  const isBot = sender === 'bot';

  return (
    <div className={`message-bubble ${isBot ? 'bot' : 'user'}`}>
      <div className="message-content">{text}</div>
      <div className="timestamp">
        {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
      </div>
    </div>
  );
};

export default MessageBubble;
