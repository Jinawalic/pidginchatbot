import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, isTyping }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div className="chat-window" ref={scrollRef}>
            {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                    Welcome! wetin you wan ask?
                </div>
            ) : (
                <>
                    {messages.map((msg, index) => (
                        <React.Fragment key={index}>
                            {msg.question && <MessageBubble text={msg.question} sender="user" timestamp={msg.timestamp} />}
                            {msg.answer && <MessageBubble text={msg.answer} sender="bot" timestamp={msg.timestamp} />}
                        </React.Fragment>
                    ))}
                    {isTyping && (
                        <MessageBubble text="I dey with you, make i think am small..." sender="bot" />
                    )}
                </>
            )}
        </div>
    );
};

export default ChatWindow;
