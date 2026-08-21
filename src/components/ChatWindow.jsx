'use client';

import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages = [], isTyping = false }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="chat-window" ref={scrollRef}>
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '40px', fontSize: '1.1rem' }}>
          🌿 Welcome to AgricBot! Wetin you wan ask about farming today?
        </div>
      ) : (
        <>
          {messages.map((msg, index) => (
            <React.Fragment key={msg.id || index}>
              {msg.question && (
                <MessageBubble
                  text={msg.question}
                  sender="user"
                  timestamp={msg.timestamp}
                />
              )}
              {msg.answer && (
                <MessageBubble
                  text={msg.answer}
                  sender="bot"
                  timestamp={msg.timestamp}
                />
              )}
            </React.Fragment>
          ))}
          {isTyping && (
            <MessageBubble
              text="I dey with you, make i think am small..."
              sender="bot"
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChatWindow;
