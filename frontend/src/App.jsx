import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import './index.css';

function App() {
    const [user, setUser] = useState(null);
    const [nameInput, setNameInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already saved in storage
        const savedUser = localStorage.getItem('agricBot_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (nameInput.trim()) {
            const userId = nameInput.toLowerCase().replace(/\s+/g, '_');
            const userData = { name: nameInput, userId };
            setUser(userData);
            localStorage.setItem('agricBot_user', JSON.stringify(userData));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('agricBot_user');
        setUser(null);
        setNameInput('');
    };

    if (isLoading) return null; // Avoid flicker

    if (!user) {
        return (
            <div className="login-screen-container" style={{ background: 'var(--background)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="login-card" style={{ maxWidth: '400px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <img src="/images/logo.JPG" alt="Logo" style={{ width: '100px', height: '100px', marginBottom: '8px', objectFit: 'contain' }} />
                        <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>Welcome to AgricBot</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Abeg enter your name make we start.</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Your name here..."
                            className="login-input"
                            style={{ width: '100%' }}
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            required
                        />
                        <button type="submit" className="login-button">
                            Continue to Chat
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <Home user={user} onLogout={handleLogout} />;
}

export default App;
