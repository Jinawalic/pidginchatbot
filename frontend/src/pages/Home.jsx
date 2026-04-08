import React, { useState, useEffect } from 'react';
import { PlusCircle, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import { apiCall } from '../config/api';

const Home = ({ user, onLogout }) => {
    const [allMessages, setAllMessages] = useState([]); // Store everything from backend
    const [currentSessionId, setCurrentSessionId] = useState(Date.now().toString());
    const [botResponses, setBotResponses] = useState([]);
    const [activeTab, setActiveTab] = useState('chat');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Fetch all responses and full history on mount
    useEffect(() => {
        // Get chatbot canned responses
        apiCall('/responses')
            .then(res => res.json())
            .then(data => setBotResponses(data))
            .catch(err => console.error('Error fetching responses:', err));

        // Get user history
        apiCall(`/history/${user.userId}`)
            .then(res => res.json())
            .then(data => {
                setAllMessages(data);
                if (data.length > 0) {
                    // Automatically load the latest session
                    const lastMsg = data[data.length - 1];
                    if (lastMsg.sessionId) {
                        setCurrentSessionId(lastMsg.sessionId);
                    }
                }
            })
            .catch(err => console.error('Error fetching history:', err));
    }, [user.userId]);

    const [isTyping, setIsTyping] = useState(false);

    // Current messages are filtered by currentSessionId
    const currentMessages = allMessages.filter(m => m.sessionId === currentSessionId);

    const generateTitle = (text) => {
        const words = text.split(' ').slice(0, 6).join(' ');
        return words.length > 30 ? words.substring(0, 30) + '...' : words;
    };

    const handleSendMessage = async (text) => {
        const existingSession = allMessages.find(m => m.sessionId === currentSessionId);
        const title = existingSession ? existingSession.title : generateTitle(text);

        const timestamp = new Date().toISOString();

        // 1. Add User Message immediately
        const userMsg = {
            userId: user.userId,
            sessionId: currentSessionId,
            title: title,
            question: text,
            answer: null, // No answer yet
            timestamp: timestamp
        };
        setAllMessages(prev => [...prev, userMsg]);

        // 2. Start Thinking
        setIsTyping(true);

        try {
            // 3. Get AI Response from Backend
            const response = await apiCall('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: text })
            });

            if (!response.ok) throw new Error('Failed to get AI response');

            const data = await response.json();
            const answer = data.answer;

            // Update UI with the real answer
            setAllMessages(prev => [
                ...prev.filter(m => !(m.sessionId === currentSessionId && m.question === text && m.answer === null)),
                { ...userMsg, answer: answer }
            ]);
            setIsTyping(false);

            // 4. Save to backend history
            await apiCall('/save-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userMsg, answer: answer })
            });
        } catch (err) {
            console.error('Error in chat:', err);
            const errorMsg = "Abeg, I get small issue for my brain, I no fit answer you now. Try again later.";

            setAllMessages(prev => [
                ...prev.filter(m => !(m.sessionId === currentSessionId && m.question === text && m.answer === null)),
                { ...userMsg, answer: errorMsg }
            ]);
            setIsTyping(false);
        }
    };

    const startNewChat = () => {
        setCurrentSessionId(Date.now().toString());
        setIsSidebarOpen(false);
        setActiveTab('new');
    };

    const loadSession = (sessionId) => {
        setCurrentSessionId(sessionId);
        setIsSidebarOpen(false);
        setActiveTab('chat');
    };

    // Group history by sessionId to show titles
    const sessionHistory = allMessages
        .reduce((acc, current, index) => {
            // If message has no sessionId, it's a legacy message. 
            // We give it a temporary one based on its index so it appears but doesn't break grouping
            const sid = current.sessionId || `legacy_${index}`;
            const title = current.title || (current.question ? generateTitle(current.question) : 'Untitled Chat');

            const hasSession = acc.find(item => item.sessionId === sid);
            if (!hasSession && current.sessionId) {
                acc.push({
                    sessionId: sid,
                    title: title
                });
            } else if (!current.sessionId) {
                // For legacy, we just push them as individual items for now to avoid the "one title" bug
                acc.push({
                    sessionId: sid,
                    title: title
                });
            }
            return acc;
        }, [])
        .reverse();

    return (
        <div className="main-layout">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
                    <X size={24} />
                </button>
                <div className="sidebar-logo">
                    <img src="/images/logo.JPG" alt="Logo" />
                    <h2>AgricBot</h2>
                </div>

                <nav className="nav-group">
                    <button
                        className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
                        onClick={startNewChat}
                    >
                        <PlusCircle size={20} />
                        <span>New Chat</span>
                    </button>

                    <div className="nav-item-wrapper">
                        <button
                            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('chat');
                                setIsHistoryOpen(!isHistoryOpen);
                            }}
                        >
                            <MessageSquare size={20} />
                            <span>Chat History</span>
                        </button>

                        {isHistoryOpen && (
                            <div className="history-dropdown">
                                {sessionHistory.length > 0 ? (
                                    sessionHistory.slice(0, 15).map((session) => (
                                        <div
                                            key={session.sessionId}
                                            className={`history-item ${currentSessionId === session.sessionId ? 'active' : ''}`}
                                            onClick={() => loadSession(session.sessionId)}
                                        >
                                            {session.title}
                                        </div>
                                    ))
                                ) : (
                                    <div className="history-item" style={{ opacity: 0.5 }}>No history yet</div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => alert('Settings dey come soon!')}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>

                    <button className="nav-item logout" onClick={onLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="app-container">
                <header className="header">
                    <div className="header-title-area">
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        {/* <img src="/images/logo.JPG" className="header-logo" alt="Logo" /> */}
                        <h1>Agric Chatbot</h1>
                    </div>
                    <div className="user-badge">{user.name}</div>
                </header>

                <ChatWindow messages={currentMessages} isTyping={isTyping} />

                <MessageInput
                    onSendMessage={handleSendMessage}
                    botQuestions={botResponses.map(r => r.question)}
                />
            </div>
        </div>
    );
};

export default Home;
